﻿namespace PackageDownloader.Core.Services.Abstractions;
/// <summary>
/// Provides methods for interacting with the file system.
/// </summary>
public interface IFileSystemService
{

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

    string CreateDirectoryForPackage(string baseFolderPath, string packageID, string? pacakgeVersion);

    void CopyFilesToFolder(IEnumerable<string> filePaths, string destinationFodler);

    IEnumerable<string> GetAllFilesByExtension(string folder, string extension);

    void RemoveDirectoryItemsByFilter(string directoryPath, Func<string, bool> itemsFilter);

}