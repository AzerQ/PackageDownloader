using PackageDownloader.Core.Models;
using PackageDownloader.Core.Models.GitHub;

namespace PackageDownloader.Core.Services.Abstractions;

/// <summary>
/// Extended GitHub package service interface for detailed repository information
/// </summary>
public interface IGitHubPackageService
{
    /// <summary>
    /// Gets detailed repository information including its release versions
    /// </summary>
    /// <param name="packageId">Repository full name (e.g., "dotnet/runtime")</param>
    Task<PackageInfo?> GetDetailedPackageInfoAsync(string packageId);

    /// <summary>
    /// Gets artifacts (release assets and the source code archive) available for a repository version
    /// </summary>
    /// <param name="packageId">Repository full name (e.g., "dotnet/runtime")</param>
    /// <param name="version">
    /// Release tag, <see cref="GitHubPackageConventions.LatestSourceVersion"/>,
    /// or <see langword="null"/> for the latest release
    /// </param>
    Task<IEnumerable<GitHubArtifactInfo>> GetPackageArtifactsAsync(string packageId, string? version);
}
