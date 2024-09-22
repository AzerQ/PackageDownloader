namespace PackageDownloader.Core.Services.Abstractions;


/// <summary>
/// Provides methods for downloading packages from various sources.
/// </summary>
public interface IPackageDownloaderService
{
    /// <summary>
    /// Downloads a package from a specified source using the provided package identifier.
    /// </summary>
    /// <param name="packageId">The unique identifier of the package to be downloaded.</param>
    /// <returns>A string representing the path where the downloaded package is saved.</returns>
    string DownloadPackage(string packageId);
}
