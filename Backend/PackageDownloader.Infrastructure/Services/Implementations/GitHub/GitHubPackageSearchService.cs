using PackageDownloader.Core.Models;
using PackageDownloader.Core.Models.GitHub;
using PackageDownloader.Core.Services.Abstractions;
using PackageDownloader.Infrastructure.Services.Abstractions;

namespace PackageDownloader.Infrastructure.Services.Implementations.GitHub;

/// <summary>
/// GitHub package search service implementation.
/// A "package" here is a repository, a "version" is either a release tag
/// or the always present <see cref="GitHubPackageConventions.LatestSourceVersion"/> pseudo version.
/// </summary>
public class GitHubPackageSearchService : IPackageSearchService
{
    private const int SearchResultsCount = 25;
    private const int SuggestionsCount = 10;

    /// <summary>
    /// Number of top search results the latest release is resolved for.
    /// Every resolved release costs an extra GitHub API call, so it is kept small.
    /// </summary>
    private const int DetailedSearchResultsCount = 5;

    private readonly IGitHubHttpClient _gitHubClient;

    public GitHubPackageSearchService(IGitHubHttpClient gitHubClient)
    {
        _gitHubClient = gitHubClient;
    }

    public async Task<IEnumerable<PackageInfo>> SearchPackagesByName(string namePart)
    {
        var searchResponse = await _gitHubClient.SearchRepositoriesAsync(namePart, 1, SearchResultsCount);
        var repositories = searchResponse.Items.ToList();

        var detailedRepositories = repositories.Take(DetailedSearchResultsCount);
        var otherRepositories = repositories.Skip(DetailedSearchResultsCount);

        // Resolve the latest release only for the top results, the rest fall back to the source version
        var detailedPackages = await Task.WhenAll(detailedRepositories.Select(async repository =>
        {
            try
            {
                var latestRelease = await _gitHubClient.GetLatestReleaseAsync(repository.FullName);
                return CreatePackageInfo(repository, latestRelease?.TagName);
            }
            catch (Exception)
            {
                return CreatePackageInfo(repository, latestReleaseTag: null);
            }
        }));

        return detailedPackages
            .Concat(otherRepositories.Select(repository => CreatePackageInfo(repository, latestReleaseTag: null)))
            .OrderByDescending(package => package.DownloadsCount);
    }

    public async Task<IEnumerable<string>> GetPackagesNamesSuggestions(string namePart)
    {
        var searchResponse = await _gitHubClient.SearchRepositoriesAsync(namePart, 1, SuggestionsCount * 2);

        // GitHub already sorts by relevance, only the exact name matches are pulled to the top
        return searchResponse.Items
            .Select(repository => repository.FullName)
            .OrderByDescending(fullName => fullName.Contains(namePart, StringComparison.OrdinalIgnoreCase))
            .Take(SuggestionsCount);
    }

    /// <summary>
    /// Returns the release tags of the repository, always prefixed with the
    /// <see cref="GitHubPackageConventions.LatestSourceVersion"/> pseudo version.
    /// </summary>
    public async Task<IEnumerable<PackageVersion>> GetPackageVersions(string packageName, int maxVersionsCount)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(packageName);

        if (maxVersionsCount <= 0)
            return [];

        var repositoryTask = _gitHubClient.GetRepositoryAsync(packageName);
        var releasesTask = _gitHubClient.GetReleasesAsync(packageName, maxVersionsCount - 1);

        var repository = await repositoryTask;
        var releases = await releasesTask;

        // The default branch head is downloadable even when the repository has no releases at all
        var latestSourceVersion = new PackageVersion(
            GitHubPackageConventions.LatestSourceVersion,
            repository?.PushedAt);

        var releaseVersions = releases
            .OrderByDescending(release => release.ReleaseDate)
            .Select(release => new PackageVersion(release.TagName, release.ReleaseDate));

        return releaseVersions.Prepend(latestSourceVersion);
    }

    private static PackageInfo CreatePackageInfo(GitHubRepository repository, string? latestReleaseTag)
    {
        return new PackageInfo
        {
            Id = repository.FullName,
            CurrentVersion = latestReleaseTag ?? GitHubPackageConventions.LatestSourceVersion,
            OtherVersions = latestReleaseTag is null
                ? []
                : [GitHubPackageConventions.LatestSourceVersion],
            Description = repository.Description ?? "No description available",
            Tags = BuildTags(repository),
            AuthorInfo = repository.Owner?.Login ?? "GitHub",
            RepositoryUrl = repository.HtmlUrl,
            IconUrl = repository.Owner?.AvatarUrl,
            PackageUrl = repository.HtmlUrl,
            // GitHub does not expose a download counter for a repository, stars are the closest popularity metric
            DownloadsCount = repository.StargazersCount
        };
    }

    private static IEnumerable<string> BuildTags(GitHubRepository repository)
    {
        var tags = new List<string> { "github" };

        if (!string.IsNullOrWhiteSpace(repository.Language))
            tags.Add(repository.Language);

        if (repository.Archived)
            tags.Add("archived");

        if (repository.Fork)
            tags.Add("fork");

        tags.AddRange(repository.Topics);

        return tags;
    }
}
