using PackageDownloader.Core.Models;
using PackageDownloader.Core.Services.Abstractions;

namespace PackageDownloader.PackageDownloader.Core.Services.Abstractions;

/// <summary>
/// A base class for package downloaders. It provides functionality to download a package as an archive.
/// </summary>
/// <param name="fileSystemService">An instance of <see cref="IFileSystemService"/> for file system operations.</param>
public abstract class PackageDownloaderBase(IFileSystemService fileSystemService)
{
    private string CreateDirectoryForPackage(string packageID, string? pacakgeVersion)
    {
        string uniquePath = fileSystemService.CreateTempFolder();
        string folerForPackagesPath = Path.Combine(uniquePath, packageID, pacakgeVersion ?? string.Empty);
        Directory.CreateDirectory(folerForPackagesPath);
        return folerForPackagesPath;
    }

    /// <summary>
    /// An abstract method to be implemented by derived classes to download a package in a specified folder.
    /// </summary>
    /// <param name="packageRequest">The details of the package to be downloaded.</param>
    /// <param name="folderPath">The path of the folder where the package should be downloaded.</param>
    protected abstract void DownloadPackageInFolder(PackageRequest packageRequest, string folderPath);

    /// <summary>
    /// Downloads a package as an archive using the provided package request.
    /// </summary>
    /// <param name="packageRequest">The details of the package to be downloaded.</param>
    /// <returns>The path of the downloaded archive.</returns>
    public string DownloadPacakgeAsArchive(PackageRequest packageRequest)
    {
        string packageDirectory = CreateDirectoryForPackage(packageRequest.PackageID, packageRequest.PackageVersion);
        DownloadPackageInFolder(packageRequest, packageDirectory);
        string archivePath = fileSystemService.ArchiveFolder(packageDirectory);
        return archivePath;
    }
}
