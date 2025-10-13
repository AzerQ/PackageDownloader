using PackageDownloader.Core.Models;

namespace PackageDownloader.Core.Services.Abstractions;

/// <summary>
/// Extended Docker package service interface for detailed package information
/// </summary>
public interface IDockerPackageService
{
    /// <summary>
    /// Get detailed package information including all available tags
    /// </summary>
    /// <param name="packageId">Docker repository name (e.g., "nginx" or "library/nginx")</param>
    /// <returns>Detailed package information with all tags</returns>
    Task<PackageInfo?> GetDetailedPackageInfoAsync(string packageId);
    
    /// <summary>
    /// Get available tags for a Docker package
    /// </summary>
    /// <param name="packageId">Docker repository name</param>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Results per page (default: 100)</param>
    /// <returns>List of available tags</returns>
    Task<IEnumerable<string>> GetPackageTagsAsync(string packageId, int page = 1, int pageSize = 100);
}