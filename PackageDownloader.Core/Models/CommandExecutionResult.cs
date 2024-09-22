namespace PackageDownloader.Core.Models
{
    /// <summary>
    /// Represents the result of executing a command.
    /// </summary>
    public class CommandExecutionResult
    {
        /// <summary>
        /// Gets or sets the command that was executed.
        /// </summary>
        /// <value>The source command.</value>
        public required string SourceCommand { get; set; }

        /// <summary>
        /// Gets or sets the output of the executed command.
        /// </summary>
        /// <value>The command output.</value>
        public required string CommandOutput { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether the command execution was successful.
        /// </summary>
        /// <value><c>true</c> if the command was executed successfully; otherwise, <c>false</c>.</value>
        public bool IsSuccesed { get; set; }

        /// <summary>
        /// Gets or sets the error output of the executed command.
        /// </summary>
        /// <value>The command error output. If no error occurred, this will be null or empty.</value>
        public string? CommandError { get; set; }

        /// <summary>
        /// Gets or sets the exit code of the executed command.
        /// </summary>
        /// <value>The exit code.</value>
        public int ExitCode { get; set; }

    }
}
