using Microsoft.AspNetCore.Mvc;
using PackageDownloader.Core.Models;
using PackageDownloader.Core.Models.Docker;
using PackageDownloader.Core.Services.Abstractions;
using PackageDownloader.Infrastructure.Services.Abstractions;

namespace PackageDownloader.API.Controllers;

/// <summary>
/// Docker-specific API controller for enhanced Docker Hub functionality
/// </summary>
[Route("api/[controller]")]
[ApiController]
public class DockerController : ControllerBase
{
    private readonly IDockerHubHttpClient _dockerHubClient;
    private readonly IDockerPackageService _dockerPackageService;
    private readonly Func<PackageType, IPackageSearchService> _searchServiceAccessor;
    private readonly Func<PackageType, IPackageDownloadService> _downloadServiceAccessor;
    private readonly IPackagesStorageService _packagesStorageService;

    public DockerController(
        IDockerHubHttpClient dockerHubClient,
        IDockerPackageService dockerPackageService,
        Func<PackageType, IPackageSearchService> searchServiceAccessor,
        Func<PackageType, IPackageDownloadService> downloadServiceAccessor,
        IPackagesStorageService packagesStorageService)
    {
        _dockerHubClient = dockerHubClient;
        _dockerPackageService = dockerPackageService;
        _searchServiceAccessor = searchServiceAccessor;
        _downloadServiceAccessor = downloadServiceAccessor;
        _packagesStorageService = packagesStorageService;
    }

    /// <summary>
    /// Search Docker images on Docker Hub
    /// </summary>
    /// <param name="query">Search query</param>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Results per page (default: 25)</param>
    /// <returns>Docker Hub search results</returns>
    [HttpGet("search")]
    [Produces("application/json")]
    public async Task<ActionResult<DockerHubSearchResponse>> SearchImages(
        [FromQuery] string query,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return BadRequest("Query parameter is required");
        }

        try
        {
            var result = await _dockerHubClient.SearchImagesAsync(query, page, pageSize);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error searching Docker images: {ex.Message}");
        }
    }

    /// <summary>
    /// Get tags for a specific Docker image
    /// </summary>
    /// <param name="repository">Repository name (e.g., "nginx" or "library/nginx")</param>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Results per page (default: 100)</param>
    /// <returns>Docker image tags</returns>
    [HttpGet("tags/{repository}")]
    [Produces("application/json")]
    public async Task<ActionResult<DockerHubTagsResponse>> GetImageTags(
        string repository,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 100)
    {
        if (string.IsNullOrWhiteSpace(repository))
        {
            return BadRequest("Repository parameter is required");
        }

        try
        {
            // URL decode the repository parameter in case it contains encoded characters
            repository = Uri.UnescapeDataString(repository);
            var result = await _dockerHubClient.GetImageTagsAsync(repository, page, pageSize);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error getting Docker image tags: {ex.Message}");
        }
    }

    /// <summary>
    /// Get manifest for a specific Docker image and tag
    /// </summary>
    /// <param name="repository">Repository name</param>
    /// <param name="tag">Image tag</param>
    /// <returns>Docker image manifest</returns>
    [HttpGet("manifest/{repository}/{tag}")]
    [Produces("application/json")]
    public async Task<ActionResult<DockerManifest>> GetImageManifest(string repository, string tag)
    {
        if (string.IsNullOrWhiteSpace(repository) || string.IsNullOrWhiteSpace(tag))
        {
            return BadRequest("Repository and tag parameters are required");
        }

        try
        {
            repository = Uri.UnescapeDataString(repository);
            tag = Uri.UnescapeDataString(tag);
            var result = await _dockerHubClient.GetImageManifestAsync(repository, tag);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error getting Docker image manifest: {ex.Message}");
        }
    }

    /// <summary>
    /// Search Docker packages using unified search interface
    /// </summary>
    /// <param name="namePart">Search term</param>
    /// <returns>Unified package search results</returns>
    [HttpGet("packages/search")]
    [Produces("application/json")]
    public async Task<ActionResult<IEnumerable<PackageInfo>>> SearchPackages([FromQuery] string namePart)
    {
        if (string.IsNullOrWhiteSpace(namePart))
        {
            return BadRequest("NamePart parameter is required");
        }

        try
        {
            var searchService = _searchServiceAccessor(PackageType.Docker);
            var result = await searchService.SearchPackagesByName(namePart);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error searching Docker packages: {ex.Message}");
        }
    }

    /// <summary>
    /// Get Docker package name suggestions
    /// </summary>
    /// <param name="namePart">Partial name for suggestions</param>
    /// <returns>Package name suggestions</returns>
    [HttpGet("packages/suggestions")]
    [Produces("application/json")]
    public async Task<ActionResult<IEnumerable<string>>> GetPackageSuggestions([FromQuery] string namePart)
    {
        if (string.IsNullOrWhiteSpace(namePart))
        {
            return BadRequest("NamePart parameter is required");
        }

        try
        {
            var searchService = _searchServiceAccessor(PackageType.Docker);
            var result = await searchService.GetPackagesNamesSuggestions(namePart);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error getting Docker package suggestions: {ex.Message}");
        }
    }

    /// <summary>
    /// Get detailed information about a specific Docker package including all tags
    /// </summary>
    /// <param name="packageId">Docker repository name (e.g., "nginx" or "library/nginx")</param>
    /// <returns>Detailed package information with all available tags</returns>
    [HttpGet("packages/details/{packageId}")]
    [Produces("application/json")]
    public async Task<ActionResult<PackageInfo>> GetPackageDetails(string packageId)
    {
        if (string.IsNullOrWhiteSpace(packageId))
        {
            return BadRequest("PackageId parameter is required");
        }

        try
        {
            packageId = Uri.UnescapeDataString(packageId);
            var result = await _dockerPackageService.GetDetailedPackageInfoAsync(packageId);
            
            if (result == null)
            {
                return NotFound($"Docker package '{packageId}' not found");
            }
            
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error getting Docker package details: {ex.Message}");
        }
    }

    /// <summary>
    /// Get available tags for a specific Docker package
    /// </summary>
    /// <param name="packageId">Docker repository name</param>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Results per page (default: 100)</param>
    /// <returns>List of available tags</returns>
    [HttpGet("packages/tags/{packageId}")]
    [Produces("application/json")]
    public async Task<ActionResult<IEnumerable<string>>> GetPackageTags(
        string packageId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 100)
    {
        if (string.IsNullOrWhiteSpace(packageId))
        {
            return BadRequest("PackageId parameter is required");
        }

        try
        {
            packageId = Uri.UnescapeDataString(packageId);
            var result = await _dockerPackageService.GetPackageTagsAsync(packageId, page, pageSize);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error getting Docker package tags: {ex.Message}");
        }
    }

    /// <summary>
    /// Prepare Docker images download link
    /// </summary>
    /// <param name="packageRequest">Docker package download request</param>
    /// <returns>Download URL for the prepared archive</returns>
    [HttpPost("packages/download/prepare")]
    [Produces("text/plain")]
    public ActionResult<string> PrepareDownload([FromBody] PackageRequest packageRequest)
    {
        if (packageRequest.PackageType != PackageType.Docker)
        {
            return BadRequest("Invalid package type. Expected Docker.");
        }

        if (!packageRequest.PackagesDetails.Any())
        {
            return BadRequest("At least one package must be specified");
        }

        try
        {
            var downloadService = _downloadServiceAccessor(PackageType.Docker);
            string packageFilePath = downloadService.DownloadPackagesAsArchive(packageRequest);
            Guid packagesArchiveId = _packagesStorageService.SetPackagesArchivePath(packageFilePath);

            string packagesDownloadUrl = Url.Action(nameof(DownloadPreparedArchive),
                "Docker", new { packagesArchiveId }, Request.Scheme) ??
                throw new InvalidOperationException("Can't resolve package download link");

            return Ok(packagesDownloadUrl);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error preparing Docker images download: {ex.Message}");
        }
    }

    /// <summary>
    /// Download prepared Docker images archive
    /// </summary>
    /// <param name="packagesArchiveId">Archive identifier</param>
    /// <returns>Docker images archive file</returns>
    [HttpGet("packages/download/{packagesArchiveId}")]
    [Produces("application/zip", "application/gzip")]
    public IActionResult DownloadPreparedArchive(Guid packagesArchiveId)
    {
        try
        {
            string? packageFilePath = _packagesStorageService.GetPackagesArchivePath(packagesArchiveId);

            if (string.IsNullOrEmpty(packageFilePath) || !System.IO.File.Exists(packageFilePath))
                return NotFound("Archive not found or has expired");

            string fileName = Path.GetFileName(packageFilePath);
            string contentType = fileName.EndsWith(".tar.gz") ? "application/gzip" : "application/zip";

            return PhysicalFile(packageFilePath, contentType, fileName);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error downloading Docker images archive: {ex.Message}");
        }
    }
}