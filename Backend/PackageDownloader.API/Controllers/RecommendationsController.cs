using Microsoft.AspNetCore.Mvc;
using PackageDownloader.Core.Models;
using PackageDownloader.Core.Services.Abstractions;

namespace PackageDownloader.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class RecommendationsController(IPackageRecommendationService packageRecommendationService) : ControllerBase
{
    [Produces("application/json")]
    [HttpGet("[action]")]
    public async Task<IEnumerable<PackageRecommendation>?> GetRecommendations([FromQuery] PackageType packageType, [FromQuery] string userPrompt, [FromQuery] string langCode)
    {
      return await packageRecommendationService.GetRecommendations(packageType, userPrompt, langCode);
    }
}