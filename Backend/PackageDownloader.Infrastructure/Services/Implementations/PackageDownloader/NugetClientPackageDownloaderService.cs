using NuGet.Common;
using NuGet.Configuration;
using NuGet.Packaging.Core;
using NuGet.Protocol;
using NuGet.Protocol.Core.Types;
using NuGet.Versioning;
using PackageDownloader.Core.Models;
using PackageDownloader.Core.Services.Abstractions;
using PackageDownloader.Infrastructure.Services.Abstractions;

namespace PackageDownloader.Infrastructure.Services.Implementations.PackageDownloader;

/// <summary>
/// Downloads NuGet package archives through the NuGet Client SDK.
/// </summary>
public sealed class NugetClientPackageDownloaderService : IPackageDownloadService
{
    private readonly IPackagesDirectoryCreator _packagesDirectoryCreator;
    private readonly IArchiveService _archiveService;
    private readonly IReadOnlyList<SourceRepository> _sourceRepositories;

    public NugetClientPackageDownloaderService(
        IPackagesDirectoryCreator packagesDirectoryCreator,
        IArchiveService archiveService)
    {
        _packagesDirectoryCreator = packagesDirectoryCreator;
        _archiveService = archiveService;

        ISettings settings = Settings.LoadDefaultSettings(root: null);
        var packageSourceProvider = new PackageSourceProvider(settings);
        var repositoryProvider = new SourceRepositoryProvider(
            packageSourceProvider,
            Repository.Provider.GetCoreV3());

        _sourceRepositories = repositoryProvider.GetRepositories().ToArray();
    }

    public string DownloadPackagesAsArchive(PackageRequest packageRequest)
    {
        ArgumentNullException.ThrowIfNull(packageRequest);

        return DownloadPackagesAsArchiveAsync(packageRequest, CancellationToken.None)
            .GetAwaiter()
            .GetResult();
    }

    private async Task<string> DownloadPackagesAsArchiveAsync(
        PackageRequest packageRequest,
        CancellationToken cancellationToken)
    {
        (string tempFolderPath, string packagesDirectory) =
            _packagesDirectoryCreator.CreatePackagesTempDirectory(packageRequest);

        using var cacheContext = new SourceCacheContext();
        var downloadedPackages = new HashSet<PackageIdentity>(PackageIdentityComparer.Default);

        foreach (PackageDetails packageDetails in packageRequest.PackagesDetails)
        {
            PackageIdentity package = await ResolvePackageAsync(
                packageDetails,
                cacheContext,
                cancellationToken);

            if (!downloadedPackages.Add(package))
                continue;

            await DownloadPackageAsync(
                package,
                packagesDirectory,
                cacheContext,
                cancellationToken);
        }

        return _archiveService.ArchiveFolder(packagesDirectory, tempFolderPath);
    }

    private async Task<PackageIdentity> ResolvePackageAsync(
        PackageDetails packageDetails,
        SourceCacheContext cacheContext,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(packageDetails.PackageID))
            throw new ArgumentException("NuGet package ID cannot be empty.", nameof(packageDetails));

        if (!string.IsNullOrWhiteSpace(packageDetails.PackageVersion))
        {
            if (!NuGetVersion.TryParse(packageDetails.PackageVersion, out NuGetVersion? parsedVersion))
            {
                throw new ArgumentException(
                    $"'{packageDetails.PackageVersion}' is not a valid NuGet version.",
                    nameof(packageDetails));
            }

            return new PackageIdentity(packageDetails.PackageID, parsedVersion);
        }

        NuGetVersion? latestVersion = null;

        foreach (SourceRepository repository in _sourceRepositories)
        {
            FindPackageByIdResource resource =
                await repository.GetResourceAsync<FindPackageByIdResource>(cancellationToken);
            IEnumerable<NuGetVersion> versions = await resource.GetAllVersionsAsync(
                packageDetails.PackageID,
                cacheContext,
                NullLogger.Instance,
                cancellationToken);

            NuGetVersion? latestStableVersion = versions
                .Where(version => !version.IsPrerelease)
                .OrderByDescending(version => version)
                .FirstOrDefault();

            if (latestStableVersion is not null &&
                (latestVersion is null || latestStableVersion > latestVersion))
            {
                latestVersion = latestStableVersion;
            }
        }

        return latestVersion is null
            ? throw new InvalidOperationException(
                $"NuGet package '{packageDetails.PackageID}' was not found in configured sources.")
            : new PackageIdentity(packageDetails.PackageID, latestVersion);
    }

    private async Task DownloadPackageAsync(
        PackageIdentity package,
        string destinationDirectory,
        SourceCacheContext cacheContext,
        CancellationToken cancellationToken)
    {
        string fileName = $"{package.Id}.{package.Version.ToNormalizedString()}.nupkg";
        string destinationPath = Path.Combine(destinationDirectory, fileName);

        foreach (SourceRepository repository in _sourceRepositories)
        {
            FindPackageByIdResource resource =
                await repository.GetResourceAsync<FindPackageByIdResource>(cancellationToken);

            await using var packageStream = new FileStream(
                destinationPath,
                FileMode.Create,
                FileAccess.Write,
                FileShare.None,
                bufferSize: 81920,
                useAsync: true);

            bool downloaded = await resource.CopyNupkgToStreamAsync(
                package.Id,
                package.Version,
                packageStream,
                cacheContext,
                NullLogger.Instance,
                cancellationToken);

            if (downloaded)
                return;

            packageStream.Close();
            File.Delete(destinationPath);
        }

        throw new InvalidOperationException(
            $"NuGet package '{package.Id}' version '{package.Version}' was not found in configured sources.");
    }
}
