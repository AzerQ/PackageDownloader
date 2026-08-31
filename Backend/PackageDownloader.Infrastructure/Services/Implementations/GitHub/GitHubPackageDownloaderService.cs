using PackageDownloader.Core.Models;
using PackageDownloader.Core.Models.GitHub;
using PackageDownloader.Core.Services.Abstractions;
using PackageDownloader.Infrastructure.Services.Abstractions;

namespace PackageDownloader.Infrastructure.Services.Implementations.GitHub;

/// <summary>
/// GitHub package download service implementation.
/// </summary>
/// <remarks>
/// Depending on the requested version it downloads either the release assets
/// (optionally filtered by <see cref="PackageDetails.ArtifactType"/>) or the source code archive
/// of the default branch (<see cref="GitHubPackageConventions.LatestSourceVersion"/>).
/// </remarks>
public class GitHubPackageDownloaderService : IPackageDownloadService
{
    private readonly IGitHubHttpClient _gitHubClient;
    private readonly IArchiveService _archiveService;
    private readonly IPackagesDirectoryCreator _packagesDirectoryCreator;

    public GitHubPackageDownloaderService(
        IGitHubHttpClient gitHubClient,
        IArchiveService archiveService,
        IPackagesDirectoryCreator packagesDirectoryCreator)
    {
        _gitHubClient = gitHubClient;
        _archiveService = archiveService;
        _packagesDirectoryCreator = packagesDirectoryCreator;
    }

    public string DownloadPackagesAsArchive(PackageRequest packageRequest)
    {
        if (packageRequest.PackageType != PackageType.GitHub)
        {
            throw new ArgumentException("Invalid package type for GitHub downloader", nameof(packageRequest));
        }

        var (tempFolderPath, packagesDirectory) = _packagesDirectoryCreator.CreatePackagesTempDirectory(packageRequest);

        var downloadTasks = packageRequest.PackagesDetails
            .Select(packageDetails => DownloadSinglePackageAsync(packageDetails, packagesDirectory))
            .ToArray();

        Task.WaitAll(downloadTasks);

        return _archiveService.ArchiveFolder(packagesDirectory, tempFolderPath);
    }

    private async Task DownloadSinglePackageAsync(PackageDetails packageDetails, string outputDirectory)
    {
        var repository = packageDetails.PackageID;
        var (releaseTag, isSourceVersion) = GitHubPackageConventions.ParseVersion(packageDetails.PackageVersion);

        try
        {
            // latest.source (and <tag>.source) always packs the repository sources, no release is needed
            if (isSourceVersion)
            {
                await _gitHubClient.DownloadSourceArchiveAsync(
                    repository,
                    releaseTag,
                    CreatePackageDirectory(outputDirectory, repository, releaseTag ?? GitHubPackageConventions.LatestSourceVersion));

                return;
            }

            var release = releaseTag is null
                ? await _gitHubClient.GetLatestReleaseAsync(repository)
                : await _gitHubClient.GetReleaseByTagAsync(repository, releaseTag);

            if (release is null)
            {
                throw new InvalidOperationException(releaseTag is null
                    ? $"GitHub repository '{repository}' has no published releases. " +
                      $"Use the '{GitHubPackageConventions.LatestSourceVersion}' version to download its sources."
                    : $"GitHub repository '{repository}' has no release tagged '{releaseTag}'");
            }

            var packageDirectory = CreatePackageDirectory(outputDirectory, repository, release.TagName);

            await DownloadReleaseArtifactsAsync(repository, release, packageDetails.ArtifactType, packageDirectory);
        }
        catch (Exception exception)
        {
            throw new InvalidOperationException(
                $"Failed to download GitHub package {repository}:{packageDetails.PackageVersion ?? "latest"}",
                exception);
        }
    }

    private async Task DownloadReleaseArtifactsAsync(
        string repository,
        GitHubRelease release,
        string? artifactType,
        string packageDirectory)
    {
        if (GitHubPackageConventions.IsSourceArtifactType(artifactType))
        {
            await _gitHubClient.DownloadSourceArchiveAsync(repository, release.TagName, packageDirectory);
            return;
        }

        var assets = release.Assets.ToList();

        if (!GitHubPackageConventions.IsAllArtifactsType(artifactType))
        {
            assets = assets
                .Where(asset => string.Equals(asset.Name, artifactType, StringComparison.OrdinalIgnoreCase))
                .ToList();

            if (assets.Count == 0)
            {
                throw new InvalidOperationException(
                    $"Release '{release.TagName}' of '{repository}' has no artifact '{artifactType}'. " +
                    $"Available artifacts: {FormatAvailableArtifacts(release)}");
            }
        }

        // A release without assets (sources only) still has to produce something downloadable
        if (assets.Count == 0)
        {
            await _gitHubClient.DownloadSourceArchiveAsync(repository, release.TagName, packageDirectory);
            return;
        }

        await Task.WhenAll(assets.Select(asset => _gitHubClient.DownloadAssetAsync(asset, packageDirectory)));
    }

    private static string FormatAvailableArtifacts(GitHubRelease release)
    {
        var artifactNames = release.Assets
            .Select(asset => asset.Name)
            .Append(GitHubPackageConventions.SourceArtifactType);

        return string.Join(", ", artifactNames);
    }

    private static string CreatePackageDirectory(string outputDirectory, string repository, string version)
    {
        var safeName = RemoveInvalidFileNameChars($"{repository.Replace('/', '_')}_{version}");
        var packageDirectory = Path.Combine(outputDirectory, safeName);

        Directory.CreateDirectory(packageDirectory);

        return packageDirectory;
    }

    private static string RemoveInvalidFileNameChars(string fileName) =>
        string.Concat(fileName.Split(Path.GetInvalidFileNameChars()));
}
