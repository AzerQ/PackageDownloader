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

    public CommandExecutionResult Execute(CommandInput commandInput)
    {
        var startInfo = new ProcessStartInfo
        {
            FileName = commandInput.CommandName,
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


