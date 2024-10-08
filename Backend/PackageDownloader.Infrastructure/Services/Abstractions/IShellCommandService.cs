﻿using PackageDownloader.Infrastructure.Models;

namespace PackageDownloader.Infrastructure.Services.Abstractions;

/// <summary>
/// Provides methods for executing shell commands.
/// </summary>
public interface IShellCommandService
{

    /// <summary>
    /// Executes a shell command and throws an exception if the command fails.
    /// </summary>
    /// <param name="input">The input containing the command to execute.</param>
    /// <returns>The result of the command execution.</returns>
    /// <exception cref="ShellCommandException">Thrown if the command execution fails.</exception>
    CommandExecutionResult ExecuteOrThrow(CommandInput input);

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

