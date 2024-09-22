using PackageDownloader.Core.Models;
using PackageDownloader.Core.Services.Abstractions;
using System.Diagnostics;

namespace PackageDownloader.Core.Services.Implementations;

public class ShellCommandService : IShellCommandService
{

    public CommandExecutionResult Execute(CommandInput commandInput)
    {
        var startInfo = new ProcessStartInfo
        {
            FileName = commandInput.CommandName,
            Arguments = string.Join(" ", commandInput.Arguments),
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };

        if (commandInput.WorkDirectory != null)
            startInfo.WorkingDirectory = commandInput.WorkDirectory;

        var process = new Process { StartInfo = startInfo };

        process.Start();

        var output = process.StandardOutput.ReadToEnd();
        var error = process.StandardError.ReadToEnd();

        process.WaitForExit();

        return new CommandExecutionResult
        {
            SourceCommand = commandInput.CommandName,
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


