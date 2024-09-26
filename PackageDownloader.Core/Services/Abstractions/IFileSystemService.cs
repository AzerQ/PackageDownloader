namespace PackageDownloader.Core.Services.Abstractions;
    /// <summary>
    /// Provides methods for interacting with the file system.
    /// </summary>
    public interface IFileSystemService
    {
        /// <summary>
        /// Archives the specified folder by compressing its contents into a zip file.
        /// </summary>
        /// <param name="folderPath">The path of the folder to be archived.</param>
        /// <returns>Path to archive file</returns>
        string ArchiveFolder(string folderPath);

        /// <summary>
        /// Creates a temporary folder in the system's temporary directory.
        /// </summary>
        /// <returns>The path of the newly created temporary folder.</returns>
        string CreateTempFolder();

        /// <summary>
        /// Removes the specified temporary folder from the file system.
        /// </summary>
        /// <param name="folderPath">The path of the temporary folder to be removed.</param>
        void RemoveTempFolder(string folderPath);
    }