using PackageDownloader.Core.Models;
using PackageDownloader.Core.Services.Abstractions;
using PackageDownloader.Infrastructure.Services.Abstractions;

namespace PackageDownloader.Infrastructure.Services.Implementations.Docker;

/// <summary>
/// Docker package download service implementation
/// </summary>
public class DockerPackageDownloaderService : IPackageDownloadService
{
    private readonly IDockerHubHttpClient _dockerHubClient;
    private readonly IArchiveService _archiveService;
    private readonly IPackagesDirectoryCreator _packagesDirectoryCreator;

    public DockerPackageDownloaderService(
        IDockerHubHttpClient dockerHubClient,
        IArchiveService archiveService,
        IPackagesDirectoryCreator packagesDirectoryCreator)
    {
        _dockerHubClient = dockerHubClient;
        _archiveService = archiveService;
        _packagesDirectoryCreator = packagesDirectoryCreator;
    }

    public string DownloadPackagesAsArchive(PackageRequest packageRequest)
    {
        if (packageRequest.PackageType != PackageType.Docker)
        {
            throw new ArgumentException("Invalid package type for Docker downloader", nameof(packageRequest));
        }

        var (tempFolderPath, packagesDirectory) = _packagesDirectoryCreator.CreatePackagesTempDirectory(packageRequest);
        var downloadTasks = new List<Task<string>>();

        foreach (var packageDetails in packageRequest.PackagesDetails)
        {
            var downloadTask = DownloadSinglePackageAsync(packageDetails, packagesDirectory);
            downloadTasks.Add(downloadTask);
        }

        // Wait for all downloads to complete
        Task.WaitAll(downloadTasks.ToArray());

        var downloadedFiles = downloadTasks.Select(t => t.Result).ToList();
        
        // Create final archive containing all downloaded Docker images
        var archivePath = _archiveService.ArchiveFolder(packagesDirectory, tempFolderPath);
        
        return archivePath;
    }

    private async Task<string> DownloadSinglePackageAsync(PackageDetails packageDetails, string outputDirectory)
    {
        var repository = packageDetails.PackageID;
        var tag = packageDetails.PackageVersion ?? "latest";
        
        // Clean repository name for file system
        var safeName = repository.Replace("/", "_").Replace(":", "_");
        var imageOutputDir = Path.Combine(outputDirectory, $"{safeName}_{tag}");
        
        try
        {
            return await _dockerHubClient.DownloadImageAsync(repository, tag, imageOutputDir);
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Failed to download Docker image {repository}:{tag}", ex);
        }
    }
}