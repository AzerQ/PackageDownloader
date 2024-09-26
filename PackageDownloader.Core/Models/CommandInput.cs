namespace PackageDownloader.Core.Models
{
    /// <summary>
    /// Represents the input for a command.
    /// </summary>
    public class CommandInput
    {
        /// <summary>
        /// Gets or sets the name of the command.
        /// </summary>
        /// <value>The name of the command.</value>
        public required string CommandName { get; set; }

        /// <summary>
        /// Gets or sets the arguments for the command.
        /// </summary>
        /// <value>The list of command arguments.</value>
        public List<string>? Arguments { get; set; }

        /// <summary>
        /// Working directory of process
        /// </summary>
        public string? WorkDirectory { get; set; }
    }
}
