using PackageDownloader.Core.Models;
using PackageDownloader.Core.Services.Abstractions;
using PackageDownloader.PackageDownloader.Core.Exceptions;
using System.Diagnostics;

namespace PackageDownloader.Core.Services.Implementations;

public class ShellCommandService : IShellCommandService
{

    public CommandExecutionResult ExecuteOrThrow(CommandInput input)
    {
        var executionResult = Execute(input);

        return executionResult.IsSuccesed ? executionResult : 
            throw new ShellCommandException(executionResult);

    }

    private (string shellFileName, string commandArgument) PrepareShellCommand(string shellCommandRaw)
    {
        bool isLinux = Environment.OSVersion.Platform == PlatformID.Unix;
        
        if (isLinux)
        {
            string escapedCommand = shellCommandRaw.Replace("\"", "\\\"");
            return ("/bin/bash", $"-c \"{escapedCommand}\"");
        }

        else
        {
            return ("cmd.exe", $"/C {shellCommandRaw}");
        }


    }
    public CommandExecutionResult Execute(CommandInput commandInput)
    {

        var shellInfo = PrepareShellCommand(commandInput.CommandName);

        var startInfo = new ProcessStartInfo
        {
            FileName = shellInfo.shellFileName,
            Arguments = shellInfo.commandArgument,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };

        if (commandInput.Arguments is not null)
        {
            startInfo.Arguments = string.Join(" ", commandInput.Arguments);
        }

        if (commandInput.WorkDirectory != null)
            startInfo.WorkingDirectory = commandInput.WorkDirectory;

        var process = new Process { StartInfo = startInfo };

        process.Start();

        var output = process.StandardOutput.ReadToEnd();
        var error = process.StandardError.ReadToEnd();

        process.WaitForExit();

        return new CommandExecutionResult
        {
            SourceCommand = commandInput,
            CommandOutput = output,
            IsSuccesed = process.ExitCode == 0,
            ExitCode = process.ExitCode,
            CommandError = error
        };
    }

    public IEnumerable<CommandExecutionResult> ExecuteAll(IEnumerable<CommandInput> commandInputs)
    {
        foreach (var commandInput in commandInputs)
        {
            var executionResult = Execute(commandInput);
            if (!executionResult.IsSuccesed)
                break;

            yield return executionResult;
        }
    }

    public IEnumerable<CommandExecutionResult> TryExecuteAll(IEnumerable<CommandInput> commandInputs)
    {
        foreach (var commandInput in commandInputs)
        {
            yield return Execute(commandInput);
        }
    }
}


