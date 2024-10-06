namespace PackageDownloader.Infrastructure.Services.Abstractions
{
    public interface IArchiveService
    {
        /// <summary>
        /// Archives the specified folder by compressing its contents into a zip file.
        /// </summary>
        /// <param name="folderPath">The path of the folder to be archived.</param>
        /// <returns>Path to archive file</returns>
        string ArchiveFolder(string folderPath, string outputFolder);
    }
}
