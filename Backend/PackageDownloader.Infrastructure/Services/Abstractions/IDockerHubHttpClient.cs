using PackageDownloader.Core.Models.Docker;

namespace PackageDownloader.Infrastructure.Services.Abstractions;

/// <summary>
/// Docker Hub HTTP client interface
/// </summary>
public interface IDockerHubHttpClient
{
    /// <summary>
    /// Search for Docker images on Docker Hub
    /// </summary>
    /// <param name="query">Search query</param>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 25)</param>
    /// <returns>Search results</returns>
    Task<DockerHubSearchResponse> SearchImagesAsync(string query, int page = 1, int pageSize = 25);

    /// <summary>
    /// Get tags for a specific Docker image
    /// </summary>
    /// <param name="repository">Repository name (e.g., "library/nginx" or "nginx")</param>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 100)</param>
    /// <returns>Tags information</returns>
    Task<DockerHubTagsResponse> GetImageTagsAsync(string repository, int page = 1, int pageSize = 100);

    /// <summary>
    /// Get image manifest from Docker Hub registry
    /// </summary>
    /// <param name="repository">Repository name</param>
    /// <param name="tag">Image tag</param>
    /// <returns>Image manifest</returns>
    Task<DockerManifest> GetImageManifestAsync(string repository, string tag);

    /// <summary>
    /// Download Docker image layer as tar.gz
    /// </summary>
    /// <param name="repository">Repository name</param>
    /// <param name="digest">Layer digest</param>
    /// <param name="outputPath">Output file path</param>
    /// <returns>Downloaded file path</returns>
    Task<string> DownloadLayerAsync(string repository, string digest, string outputPath);

    /// <summary>
    /// Download complete Docker image with all layers as tar.gz archive
    /// </summary>
    /// <param name="repository">Repository name</param>
    /// <param name="tag">Image tag</param>
    /// <param name="outputPath">Output directory path</param>
    /// <returns>Path to downloaded tar.gz archive (can be loaded with 'docker load')</returns>
    Task<string> DownloadImageAsync(string repository, string tag, string outputPath);
}