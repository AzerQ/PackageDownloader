using PackageDownloader.Core.Models;

namespace PackageDownloader.Core.Services.Abstractions;

/// <summary>
/// Provides methods for executing shell commands.
/// </summary>
public interface IShellCommandService
{
    /// <summary>
    /// Executes a single shell command and returns the result.
    /// </summary>
    /// <param name="commandInput">The input containing the command to execute.</param>
    /// <returns>The result of the command execution.</returns>
    CommandExecutionResult Execute(CommandInput commandInput);

    /// <summary>
    /// Executes multiple shell commands and returns the results.
    /// If a command fails, the execution will stop and the results of the executed commands will be returned.
    /// </summary>
    /// <param name="commandInputs">The inputs containing the commands to execute.</param>
    /// <returns>The results of the command executions.</returns>
    IEnumerable<CommandExecutionResult> ExecuteAll(IEnumerable<CommandInput> commandInputs);

    /// <summary>
    /// Tries to execute multiple shell commands and returns the results.
    /// If a command fails, it will not stop the execution of the remaining commands.
    /// </summary>
    /// <param name="commandInputs">The inputs containing the commands to execute.</param>
    /// <returns>The results of the command executions.</returns>
    IEnumerable<CommandExecutionResult> TryExecuteAll(IEnumerable<CommandInput> commandInputs);
}

