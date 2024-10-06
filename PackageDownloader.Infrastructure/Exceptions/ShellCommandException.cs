using PackageDownloader.Infrastructure.Models;

namespace PackageDownloader.Infrastructure.Exceptions;

[Serializable]
public class ShellCommandException : Exception
{
    public CommandInput? SourceCommand { get; set; }

    public CommandExecutionResult? CommandExecutionResult { get; set; }

    public ShellCommandException() { }

    public ShellCommandException(CommandExecutionResult commandOutput) :
        base($"CLI Command {commandOutput.SourceCommand.CommandName} execution failed, more info: {commandOutput.CommandError}")
    {
    }

    public ShellCommandException(string message) : base(message) { }
    public ShellCommandException(string message, Exception inner) : base(message, inner)
    {

    }
}


