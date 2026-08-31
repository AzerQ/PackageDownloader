using PackageDownloader.Core.Models;
using PackageDownloader.Core.Models.GitHub;
using PackageDownloader.Core.Services.Abstractions;
using PackageDownloader.Infrastructure.Services.Abstractions;

namespace PackageDownloader.Infrastructure.Services.Implementations.GitHub;

/// <summary>
/// Extended GitHub package service for detailed repository information and artifact selection
/// </summary>
public class GitHubPackageService : IGitHubPackageService
{
    private const int DetailedVersionsCount = 50;

    private readonly IGitHubHttpClient _gitHubClient;

    public GitHubPackageService(IGitHubHttpClient gitHubClient)
    {
        _gitHubClient = gitHubClient;
    }

    public async Task<PackageInfo?> GetDetailedPackageInfoAsync(string packageId)
    {
        var repository = await _gitHubClient.GetRepositoryAsync(packageId);

        if (repository is null)
            return null;

        var releases = await _gitHubClient.GetReleasesAsync(packageId, DetailedVersionsCount);
        var releaseTags = releases.Select(release => release.TagName).ToList();

        return new PackageInfo
        {
            Id = repository.FullName,
            // The source version is always available, even for a repository without releases
            CurrentVersion = releaseTags.FirstOrDefault() ?? GitHubPackageConventions.LatestSourceVersion,
            OtherVersions = releaseTags.Skip(1).Prepend(GitHubPackageConventions.LatestSourceVersion),
            Description = repository.Description ?? "No description available",
            Tags = new[] { "github" }
                .Concat(string.IsNullOrWhiteSpace(repository.Language) ? [] : new[] { repository.Language })
                .Concat(repository.Topics),
            AuthorInfo = repository.Owner?.Login ?? "GitHub",
            RepositoryUrl = repository.HtmlUrl,
            IconUrl = repository.Owner?.AvatarUrl,
            PackageUrl = repository.HtmlUrl,
            DownloadsCount = repository.StargazersCount
        };
    }

    public async Task<IEnumerable<GitHubArtifactInfo>> GetPackageArtifactsAsync(string packageId, string? version)
    {
        var (releaseTag, isSourceVersion) = GitHubPackageConventions.ParseVersion(version);

        // A source version has exactly one artifact - the sources themselves
        if (isSourceVersion)
        {
            var repository = releaseTag is null ? await _gitHubClient.GetRepositoryAsync(packageId) : null;
            var reference = releaseTag ?? repository?.DefaultBranch;

            return [CreateSourceArtifact(packageId, reference)];
        }

        var release = releaseTag is null
            ? await _gitHubClient.GetLatestReleaseAsync(packageId)
            : await _gitHubClient.GetReleaseByTagAsync(packageId, releaseTag);

        if (release is null)
            return [];

        var assetArtifacts = release.Assets.Select(asset => new GitHubArtifactInfo
        {
            ArtifactType = asset.Name,
            Name = asset.Name,
            ContentType = asset.ContentType,
            Size = asset.Size,
            DownloadsCount = asset.DownloadCount,
            DownloadUrl = asset.BrowserDownloadUrl
        }).ToList();

        // Sources of the tag are always downloadable, whether the release has assets or not
        var artifacts = assetArtifacts.Append(CreateSourceArtifact(packageId, release.TagName, release.ZipballUrl));

        // "Everything at once" only makes sense when the release has more than one asset
        return assetArtifacts.Count > 1
            ? artifacts.Prepend(CreateAllArtifacts(assetArtifacts))
            : artifacts;
    }

    private static GitHubArtifactInfo CreateSourceArtifact(string packageId, string? reference, string? downloadUrl = null)
    {
        var repositoryName = packageId.Split('/').Last();

        return new GitHubArtifactInfo
        {
            ArtifactType = GitHubPackageConventions.SourceArtifactType,
            Name = $"{repositoryName}-{reference ?? GitHubPackageConventions.SourceArtifactType}.zip",
            ContentType = "application/zip",
            DownloadUrl = downloadUrl,
            IsVirtual = true
        };
    }

    private static GitHubArtifactInfo CreateAllArtifacts(IReadOnlyCollection<GitHubArtifactInfo> assetArtifacts)
    {
        return new GitHubArtifactInfo
        {
            ArtifactType = GitHubPackageConventions.AllArtifactsType,
            Name = $"All release assets ({assetArtifacts.Count})",
            ContentType = "application/zip",
            Size = assetArtifacts.Sum(artifact => artifact.Size),
            DownloadsCount = assetArtifacts.Sum(artifact => artifact.DownloadsCount),
            IsVirtual = true
        };
    }
}
