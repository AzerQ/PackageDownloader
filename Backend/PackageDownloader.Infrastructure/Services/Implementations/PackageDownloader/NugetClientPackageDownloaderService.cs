using NuGet.Common;
using NuGet.Configuration;
using NuGet.Frameworks;
using NuGet.Packaging;
using NuGet.Packaging.Core;
using NuGet.Protocol;
using NuGet.Protocol.Core.Types;
using NuGet.Resolver;
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
        NuGetFramework targetFramework = ResolveTargetFramework(packageRequest.SdkVersion);
        var rootPackages = new List<PackageIdentity>();
        var availablePackages = new HashSet<SourcePackageDependencyInfo>(PackageIdentityComparer.Default);
        var visitedPackages = new HashSet<PackageIdentity>(PackageIdentityComparer.Default);

        foreach (PackageDetails packageDetails in packageRequest.PackagesDetails)
        {
            PackageIdentity package = await ResolvePackageAsync(
                packageDetails,
                cacheContext,
                cancellationToken);

            rootPackages.Add(package);
            await GatherPackageGraphAsync(
                package,
                targetFramework,
                cacheContext,
                availablePackages,
                visitedPackages,
                cancellationToken);
        }

        IEnumerable<PackageIdentity> resolvedPackages = ResolvePackageGraph(
            rootPackages,
            availablePackages,
            cancellationToken);

        foreach (PackageIdentity package in resolvedPackages)
        {
            await DownloadPackageAsync(
                package,
                packagesDirectory,
                cacheContext,
                cancellationToken);
        }

        return _archiveService.ArchiveFolder(packagesDirectory, tempFolderPath);
    }

    private static NuGetFramework ResolveTargetFramework(string? sdkVersion)
    {
        NuGetFramework fallbackFramework = NuGetFramework.ParseFolder(DotnetFrameworks.NetStandart20);

        if (string.IsNullOrWhiteSpace(sdkVersion))
            return fallbackFramework;

        string targetFramework = sdkVersion.Trim();

        if (char.IsDigit(targetFramework[0]) &&
            NuGetVersion.TryParse(targetFramework, out NuGetVersion? parsedSdkVersion))
        {
            targetFramework = $"net{parsedSdkVersion.Major}.{parsedSdkVersion.Minor}";
        }

        NuGetFramework framework = NuGetFramework.ParseFolder(targetFramework);
        return framework.IsUnsupported ? fallbackFramework : framework;
    }

    private async Task GatherPackageGraphAsync(
        PackageIdentity package,
        NuGetFramework targetFramework,
        SourceCacheContext cacheContext,
        ISet<SourcePackageDependencyInfo> availablePackages,
        ISet<PackageIdentity> visitedPackages,
        CancellationToken cancellationToken)
    {
        if (!visitedPackages.Add(package))
            return;

        SourcePackageDependencyInfo? dependencyInfo = null;

        foreach (SourceRepository repository in _sourceRepositories)
        {
            DependencyInfoResource resource =
                await repository.GetResourceAsync<DependencyInfoResource>(cancellationToken);
            dependencyInfo = await resource.ResolvePackage(
                package,
                targetFramework,
                cacheContext,
                NullLogger.Instance,
                cancellationToken);

            if (dependencyInfo is not null)
                break;
        }

        if (dependencyInfo is null)
        {
            throw new InvalidOperationException(
                $"NuGet package '{package.Id}' version '{package.Version}' was not found " +
                $"for target framework '{targetFramework.GetShortFolderName()}'.");
        }

        availablePackages.Add(dependencyInfo);

        foreach (PackageDependency dependency in dependencyInfo.Dependencies)
        {
            PackageIdentity dependencyPackage = await ResolveDependencyAsync(
                dependency,
                cacheContext,
                cancellationToken);

            await GatherPackageGraphAsync(
                dependencyPackage,
                targetFramework,
                cacheContext,
                availablePackages,
                visitedPackages,
                cancellationToken);
        }
    }

    private async Task<PackageIdentity> ResolveDependencyAsync(
        PackageDependency dependency,
        SourceCacheContext cacheContext,
        CancellationToken cancellationToken)
    {
        var versions = new HashSet<NuGetVersion>();

        foreach (SourceRepository repository in _sourceRepositories)
        {
            FindPackageByIdResource resource =
                await repository.GetResourceAsync<FindPackageByIdResource>(cancellationToken);
            IEnumerable<NuGetVersion> sourceVersions = await resource.GetAllVersionsAsync(
                dependency.Id,
                cacheContext,
                NullLogger.Instance,
                cancellationToken);

            versions.UnionWith(sourceVersions);
        }

        NuGetVersion? resolvedVersion = dependency.VersionRange.FindBestMatch(
            versions.OrderBy(version => version));

        return resolvedVersion is null
            ? throw new InvalidOperationException(
                $"Dependency '{dependency.Id}' matching range '{dependency.VersionRange}' " +
                "was not found in configured NuGet sources.")
            : new PackageIdentity(dependency.Id, resolvedVersion);
    }

    private IEnumerable<PackageIdentity> ResolvePackageGraph(
        IReadOnlyCollection<PackageIdentity> rootPackages,
        IReadOnlyCollection<SourcePackageDependencyInfo> availablePackages,
        CancellationToken cancellationToken)
    {
        string[] rootPackageIds = rootPackages
            .Select(package => package.Id)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        var resolverContext = new PackageResolverContext(
            DependencyBehavior.Lowest,
            rootPackageIds,
            rootPackageIds,
            Enumerable.Empty<PackageReference>(),
            rootPackages,
            availablePackages,
            _sourceRepositories.Select(repository => repository.PackageSource),
            NullLogger.Instance);

        return new PackageResolver()
            .Resolve(resolverContext, cancellationToken)
            .OrderBy(package => package.Id, StringComparer.OrdinalIgnoreCase)
            .ThenBy(package => package.Version)
            .ToArray();
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
