using PackageDownloader.Core.Models.GitHub;

namespace PackageDownloader.Infrastructure.Services.Abstractions;

/// <summary>
/// GitHub REST API client used by the GitHub package services.
/// </summary>
public interface IGitHubHttpClient
{
    /// <summary>
    /// Searches repositories by a free text query.
    /// </summary>
    Task<GitHubSearchResponse> SearchRepositoriesAsync(string query, int page = 1, int pageSize = 25);

    /// <summary>
    /// Gets a single repository description (default branch, description, popularity).
    /// </summary>
    /// <param name="repository">Repository full name in the <c>owner/repo</c> form.</param>
    Task<GitHubRepository?> GetRepositoryAsync(string repository);

    /// <summary>
    /// Gets published releases of the repository ordered from the newest to the oldest.
    /// </summary>
    Task<IReadOnlyList<GitHubRelease>> GetReleasesAsync(string repository, int maxCount = 100);

    /// <summary>
    /// Gets the latest published release or <see langword="null"/> when the repository has no releases.
    /// </summary>
    Task<GitHubRelease?> GetLatestReleaseAsync(string repository);

    /// <summary>
    /// Gets a release by its tag or <see langword="null"/> when there is no such release.
    /// </summary>
    Task<GitHubRelease?> GetReleaseByTagAsync(string repository, string tag);

    /// <summary>
    /// Downloads a single release asset into the output directory.
    /// </summary>
    /// <returns>Path to the downloaded file.</returns>
    Task<string> DownloadAssetAsync(GitHubReleaseAsset asset, string outputDirectory);

    /// <summary>
    /// Downloads the repository source code as a zip archive.
    /// </summary>
    /// <param name="repository">Repository full name in the <c>owner/repo</c> form.</param>
    /// <param name="reference">
    /// Branch name, tag or commit sha. When <see langword="null"/> the repository default branch is used.
    /// </param>
    /// <param name="outputDirectory">Directory the archive is saved into.</param>
    /// <returns>Path to the downloaded archive.</returns>
    Task<string> DownloadSourceArchiveAsync(string repository, string? reference, string outputDirectory);
}
