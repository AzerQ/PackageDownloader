using Microsoft.AspNetCore.Mvc;
using PackageDownloader.Core.Models;
using PackageDownloader.Core.Models.GitHub;
using PackageDownloader.Core.Services.Abstractions;

namespace PackageDownloader.API.Controllers;

/// <summary>
/// GitHub-specific API controller.
/// </summary>
/// <remarks>
/// Search, versions and downloads go through the common PackageInfo/Packages controllers
/// with <see cref="PackageType.GitHub"/>. This controller adds what is specific to GitHub:
/// the artifacts (release assets) available for a chosen version.
/// </remarks>
[Route("api/[controller]")]
[ApiController]
public class GitHubController(IGitHubPackageService gitHubPackageService) : ControllerBase
{
    /// <summary>
    /// Gets detailed repository information including its release versions
    /// </summary>
    /// <param name="packageId">Repository full name (e.g., "dotnet/runtime")</param>
    [HttpGet("packages/details")]
    [Produces("application/json")]
    public async Task<ActionResult<PackageInfo>> GetPackageDetails([FromQuery] string packageId)
    {
        if (string.IsNullOrWhiteSpace(packageId))
            return BadRequest("PackageId parameter is required");

        var packageInfo = await gitHubPackageService.GetDetailedPackageInfoAsync(packageId);

        return packageInfo is null
            ? NotFound($"GitHub repository '{packageId}' not found")
            : Ok(packageInfo);
    }

    /// <summary>
    /// Gets artifacts available for a repository version
    /// </summary>
    /// <param name="packageId">Repository full name (e.g., "dotnet/runtime")</param>
    /// <param name="version">
    /// Release tag, <c>latest.source</c> for the default branch sources,
    /// or nothing for the latest release
    /// </param>
    /// <returns>
    /// Artifacts of the version. The <c>artifactType</c> of the chosen one is passed back
    /// in <see cref="PackageDetails.ArtifactType"/> when preparing a download.
    /// </returns>
    [HttpGet("packages/artifacts")]
    [Produces("application/json")]
    public async Task<ActionResult<IEnumerable<GitHubArtifactInfo>>> GetPackageArtifacts(
        [FromQuery] string packageId,
        [FromQuery] string? version = null)
    {
        if (string.IsNullOrWhiteSpace(packageId))
            return BadRequest("PackageId parameter is required");

        return Ok(await gitHubPackageService.GetPackageArtifactsAsync(packageId, version));
    }
}
