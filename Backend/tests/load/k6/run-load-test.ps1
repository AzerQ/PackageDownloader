[CmdletBinding()]
param()

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = 'Stop'
$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$envFile = if ($env:ENV_FILE) { $env:ENV_FILE } else { Join-Path $scriptDirectory '.env' }
if (-not [IO.Path]::IsPathRooted($envFile)) { $envFile = Join-Path $scriptDirectory $envFile }

function Import-DotEnv {
    param([Parameter(Mandatory)][string]$Path)

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        throw "Environment file was not found: $Path. Copy .env.example to .env first."
    }

    foreach ($line in Get-Content -LiteralPath $Path -Encoding UTF8) {
        $trimmed = $line.Trim()
        if ($trimmed.Length -eq 0 -or $trimmed.StartsWith('#')) { continue }

        $separator = $trimmed.IndexOf('=')
        if ($separator -lt 1) { throw "Invalid .env line: $line" }
        $name = $trimmed.Substring(0, $separator).Trim()
        $value = $trimmed.Substring($separator + 1).Trim()
        if ($name -notmatch '^[A-Za-z_][A-Za-z0-9_]*$') { throw "Invalid .env key: $name" }
        if ($value.Length -ge 2 -and (($value[0] -eq '"' -and $value[-1] -eq '"') -or
                ($value[0] -eq "'" -and $value[-1] -eq "'"))) {
            $value = $value.Substring(1, $value.Length - 2)
        }
        [Environment]::SetEnvironmentVariable($name, $value, 'Process')
    }
}

function Get-RequiredEnvironmentValue {
    param([Parameter(Mandatory)][string]$Name)
    $value = [Environment]::GetEnvironmentVariable($Name, 'Process')
    if ([string]::IsNullOrWhiteSpace($value)) { throw "Required .env value '$Name' is missing." }
    return $value
}

function ConvertTo-Boolean {
    param([Parameter(Mandatory)][string]$Name)
    $value = (Get-RequiredEnvironmentValue $Name).ToLowerInvariant()
    if ($value -notin @('true', 'false')) { throw "$Name must be true or false." }
    return $value -eq 'true'
}

function Resolve-TestPath {
    param([Parameter(Mandatory)][string]$Path)
    if ([IO.Path]::IsPathRooted($Path)) { return [IO.Path]::GetFullPath($Path) }
    return [IO.Path]::GetFullPath((Join-Path $scriptDirectory $Path))
}

function Wait-BackendReady {
    param([Parameter(Mandatory)][string]$BaseUrl, [Parameter(Mandatory)][int]$TimeoutSeconds)
    $deadline = [DateTime]::UtcNow.AddSeconds($TimeoutSeconds)
    $heartbeat = "$($BaseUrl.TrimEnd('/'))/api/Heartbeat/HeartbeatExists"
    do {
        try {
            $response = Invoke-RestMethod -Uri $heartbeat -TimeoutSec 3
            if ($response.isAlive -eq $true) { return }
        } catch { Start-Sleep -Milliseconds 500 }
    } while ([DateTime]::UtcNow -lt $deadline)
    throw "Backend did not become ready within $TimeoutSeconds seconds: $heartbeat"
}

function Start-ProcessSampler {
    param([Parameter(Mandatory)][int]$ProcessId, [Parameter(Mandatory)][string]$OutputPath,
        [Parameter(Mandatory)][double]$IntervalSeconds)

    return Start-Job -ArgumentList $ProcessId, $OutputPath, $IntervalSeconds -ScriptBlock {
        param($TargetPid, $CsvPath, $Interval)
        $culture = [Globalization.CultureInfo]::InvariantCulture
        $writer = [IO.StreamWriter]::new($CsvPath, $false, [Text.UTF8Encoding]::new($false))
        try {
            $writer.WriteLine('timestamp_utc,cpu_percent,working_set_bytes,private_memory_bytes,virtual_memory_bytes,thread_count')
            $previous = Get-Process -Id $TargetPid -ErrorAction Stop
            $previousCpuMs = $previous.TotalProcessorTime.TotalMilliseconds
            $previousTime = [DateTime]::UtcNow
            while ($true) {
                Start-Sleep -Milliseconds ([Math]::Max(100, [int]($Interval * 1000)))
                $process = Get-Process -Id $TargetPid -ErrorAction SilentlyContinue
                if ($null -eq $process) { break }
                $now = [DateTime]::UtcNow
                $elapsedMs = ($now - $previousTime).TotalMilliseconds
                $cpuDeltaMs = $process.TotalProcessorTime.TotalMilliseconds - $previousCpuMs
                $cpu = if ($elapsedMs -gt 0) {
                    100 * $cpuDeltaMs / ($elapsedMs * [Environment]::ProcessorCount)
                } else { 0 }
                $values = @(
                    $now.ToString('O', $culture),
                    $cpu.ToString('F4', $culture),
                    $process.WorkingSet64,
                    $process.PrivateMemorySize64,
                    $process.VirtualMemorySize64,
                    $process.Threads.Count
                )
                $writer.WriteLine(($values -join ','))
                $writer.Flush()
                $previousCpuMs = $process.TotalProcessorTime.TotalMilliseconds
                $previousTime = $now
            }
        } finally { $writer.Dispose() }
    }
}

function Start-CounterCollector {
    param([Parameter(Mandatory)][int]$ProcessId, [Parameter(Mandatory)][string]$OutputPath)

    $launcher = Get-RequiredEnvironmentValue 'COUNTERS_LAUNCHER'
    $tool = [Environment]::GetEnvironmentVariable('COUNTERS_TOOL', 'Process')
    $package = [Environment]::GetEnvironmentVariable('COUNTERS_PACKAGE', 'Process')
    $arguments = [Collections.Generic.List[string]]::new()
    if (-not [string]::IsNullOrWhiteSpace($tool)) { $arguments.Add($tool) }
    if (-not [string]::IsNullOrWhiteSpace($package)) { $arguments.Add($package) }
    if ((Get-RequiredEnvironmentValue 'COUNTERS_AUTO_CONFIRM').ToLowerInvariant() -eq 'true') {
        $arguments.Add('--yes')
    }
    foreach ($argument in @('collect', '--process-id', "$ProcessId", '--refresh-interval',
            (Get-RequiredEnvironmentValue 'SAMPLE_INTERVAL_SECONDS'), '--format', 'csv', '--output', $OutputPath,
            '--counters', (Get-RequiredEnvironmentValue 'COUNTERS'))) {
        $arguments.Add($argument)
    }

    $startInfo = [Diagnostics.ProcessStartInfo]::new()
    $startInfo.FileName = $launcher
    $startInfo.UseShellExecute = $false
    $startInfo.RedirectStandardInput = $true
    $startInfo.Arguments = (($arguments | ForEach-Object { '"' + $_.Replace('"', '\"') + '"' }) -join ' ')
    $process = [Diagnostics.Process]::new()
    $process.StartInfo = $startInfo
    if (-not $process.Start()) { throw 'Unable to start dotnet-counters.' }
    return $process
}

function Stop-CounterCollector {
    param([Diagnostics.Process]$Process)
    if ($null -eq $Process -or $Process.HasExited) { return }
    $Process.StandardInput.WriteLine('q')
    $Process.StandardInput.Flush()
    if (-not $Process.WaitForExit(15000)) {
        $Process.Kill()
        $Process.WaitForExit()
    }
}

function Invoke-K6 {
    param([Parameter(Mandatory)][string]$Profile, [Parameter(Mandatory)][string]$SummaryPath,
        [Parameter(Mandatory)][string]$LogPath)

    $arguments = @(
        'run',
        '-e', "TARGET_URL=$(Get-RequiredEnvironmentValue 'TARGET_URL')",
        '-e', "BUILD_LABEL=$(Get-RequiredEnvironmentValue 'BUILD_LABEL')",
        '-e', "PROFILE=$Profile",
        '-e', "RATE=$(Get-RequiredEnvironmentValue 'RATE')",
        '-e', "DURATION=$(Get-RequiredEnvironmentValue 'DURATION')",
        '-e', "PRE_ALLOCATED_VUS=$(Get-RequiredEnvironmentValue 'PRE_ALLOCATED_VUS')",
        '-e', "MAX_VUS=$(Get-RequiredEnvironmentValue 'MAX_VUS')",
        '-e', "MAX_VERSIONS=$(Get-RequiredEnvironmentValue 'MAX_VERSIONS')",
        '-e', "INCLUDE_DOCKER=$(Get-RequiredEnvironmentValue 'INCLUDE_DOCKER')",
        '-e', "RESULT_FILE=$SummaryPath",
        (Resolve-TestPath (Get-RequiredEnvironmentValue 'K6_SCRIPT'))
    )
    & (Get-RequiredEnvironmentValue 'K6_BIN') @arguments 2>&1 | Tee-Object -FilePath $LogPath | Out-Host
    $exitCode = $LASTEXITCODE
    return [int]$exitCode
}

Import-DotEnv $envFile

$targetUrl = Get-RequiredEnvironmentValue 'TARGET_URL'
$label = Get-RequiredEnvironmentValue 'BUILD_LABEL'
$runId = [Environment]::GetEnvironmentVariable('RUN_ID', 'Process')
if ([string]::IsNullOrWhiteSpace($runId)) { $runId = [DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss') }
$resultDirectory = Join-Path (Resolve-TestPath (Get-RequiredEnvironmentValue 'RESULT_ROOT')) "$label-$runId"
if (Test-Path -LiteralPath $resultDirectory) { throw "Result directory already exists: $resultDirectory" }
[void](New-Item -ItemType Directory -Path $resultDirectory)

$k6Summary = Join-Path $resultDirectory (Get-RequiredEnvironmentValue 'K6_SUMMARY_FILE')
$k6Log = Join-Path $resultDirectory (Get-RequiredEnvironmentValue 'K6_LOG_FILE')
$warmupSummary = Join-Path $resultDirectory (Get-RequiredEnvironmentValue 'WARMUP_SUMMARY_FILE')
$warmupLog = Join-Path $resultDirectory (Get-RequiredEnvironmentValue 'WARMUP_LOG_FILE')
$counterFile = Join-Path $resultDirectory (Get-RequiredEnvironmentValue 'COUNTERS_FILE')
$processFile = Join-Path $resultDirectory (Get-RequiredEnvironmentValue 'PROCESS_SAMPLES_FILE')
$resourceSummary = Join-Path $resultDirectory (Get-RequiredEnvironmentValue 'RESOURCE_SUMMARY_FILE')
$backendLog = Join-Path $resultDirectory (Get-RequiredEnvironmentValue 'BACKEND_LOG_FILE')
Copy-Item -LiteralPath $envFile -Destination (Join-Path $resultDirectory 'run.env')

$backendProcess = $null
$ownsBackend = $false
$samplerJob = $null
$counterProcess = $null
$k6ExitCode = 1

try {
    if (ConvertTo-Boolean 'START_BACKEND') {
        $project = Resolve-TestPath (Get-RequiredEnvironmentValue 'BACKEND_PROJECT')
        $configuration = Get-RequiredEnvironmentValue 'BACKEND_CONFIGURATION'
        if (ConvertTo-Boolean 'BUILD_BACKEND') {
            & dotnet build $project --configuration $configuration
            if ($LASTEXITCODE -ne 0) { throw "Backend build failed with exit code $LASTEXITCODE." }
        }
        $dll = Resolve-TestPath (Get-RequiredEnvironmentValue 'BACKEND_DLL')
        if (-not (Test-Path -LiteralPath $dll -PathType Leaf)) { throw "Backend DLL was not found: $dll" }
        $backendProcess = Start-Process -FilePath (Get-RequiredEnvironmentValue 'DOTNET_BIN') `
            -ArgumentList @('exec', "`"$dll`"", '--urls', $targetUrl) -PassThru -NoNewWindow `
            -RedirectStandardOutput $backendLog -RedirectStandardError "$backendLog.stderr"
        $ownsBackend = $true
        $backendPid = $backendProcess.Id
    } else {
        $backendPid = [int](Get-RequiredEnvironmentValue 'BACKEND_PID')
        $backendProcess = Get-Process -Id $backendPid -ErrorAction Stop
    }

    Wait-BackendReady -BaseUrl $targetUrl -TimeoutSeconds ([int](Get-RequiredEnvironmentValue 'STARTUP_TIMEOUT_SECONDS'))

    if (ConvertTo-Boolean 'WARMUP_ENABLED') {
        $warmupExitCode = Invoke-K6 -Profile (Get-RequiredEnvironmentValue 'WARMUP_PROFILE') `
            -SummaryPath $warmupSummary -LogPath $warmupLog
        if ($warmupExitCode -ne 0) { throw "Warmup failed with exit code $warmupExitCode." }
    }

    $interval = [double]::Parse((Get-RequiredEnvironmentValue 'SAMPLE_INTERVAL_SECONDS'),
        [Globalization.CultureInfo]::InvariantCulture)
    $counterProcess = Start-CounterCollector -ProcessId $backendPid -OutputPath $counterFile
    $counterDeadline = [DateTime]::UtcNow.AddSeconds([int](Get-RequiredEnvironmentValue 'COUNTER_START_TIMEOUT_SECONDS'))
    while (-not (Test-Path -LiteralPath $counterFile -PathType Leaf)) {
        if ($counterProcess.HasExited) {
            throw "dotnet-counters exited before collection started (exit code $($counterProcess.ExitCode))."
        }
        if ([DateTime]::UtcNow -ge $counterDeadline) { throw 'Timed out waiting for dotnet-counters output.' }
        Start-Sleep -Milliseconds 250
    }
    $samplerJob = Start-ProcessSampler -ProcessId $backendPid -OutputPath $processFile -IntervalSeconds $interval
    Start-Sleep -Seconds ([int](Get-RequiredEnvironmentValue 'COLLECTOR_START_DELAY_SECONDS'))
    if ($counterProcess.HasExited) {
        throw "dotnet-counters exited before the load test (exit code $($counterProcess.ExitCode))."
    }

    if ((Get-RequiredEnvironmentValue 'K6_WEB_DASHBOARD').ToLowerInvariant() -eq 'true') {
        $env:K6_WEB_DASHBOARD = 'true'
        $env:K6_WEB_DASHBOARD_OPEN = 'false'
        $env:K6_WEB_DASHBOARD_PORT = '-1'
        $env:K6_WEB_DASHBOARD_EXPORT = Join-Path $resultDirectory (Get-RequiredEnvironmentValue 'K6_HTML_REPORT_FILE')
    }

    $k6ExitCode = Invoke-K6 -Profile (Get-RequiredEnvironmentValue 'PROFILE') -SummaryPath $k6Summary -LogPath $k6Log
} finally {
    Stop-CounterCollector -Process $counterProcess
    if ($null -ne $samplerJob) {
        Stop-Job -Job $samplerJob -ErrorAction SilentlyContinue
        Wait-Job -Job $samplerJob -Timeout 5 | Out-Null
        Remove-Job -Job $samplerJob -Force -ErrorAction SilentlyContinue
    }
    if ($ownsBackend -and $null -ne $backendProcess -and -not $backendProcess.HasExited) {
        Stop-Process -Id $backendProcess.Id -ErrorAction SilentlyContinue
        [void]$backendProcess.WaitForExit(10000)
    }
}

& (Get-RequiredEnvironmentValue 'NODE_BIN') (Resolve-TestPath (Get-RequiredEnvironmentValue 'RESOURCE_SUMMARIZER')) `
    $processFile $counterFile $resourceSummary
if ($LASTEXITCODE -ne 0) { throw "Resource summarizer failed with exit code $LASTEXITCODE." }

Write-Host "Results: $resultDirectory"
if ($k6ExitCode -ne 0) { throw "k6 failed with exit code $k6ExitCode." }
