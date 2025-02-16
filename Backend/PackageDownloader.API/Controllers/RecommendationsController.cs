using Microsoft.AspNetCore.Mvc;
using PackageDownloader.Core.Models;
using PackageDownloader.Core.Services.Abstractions;

namespace PackageDownloader.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class RecommendationsController : ControllerBase
{
    private readonly IPackageRecommendationService _packageRecommendationService;
    public RecommendationsController(IPackageRecommendationService packageRecommendationService)
    {
        _packageRecommendationService = packageRecommendationService;
    }

    [Produces("application/json")]
    [HttpGet("[action]")]
    public async Task<IEnumerable<PackageRecommendation>?> GetRecommendations([FromQuery] PackageType packageType, [FromQuery] string userPrompt)
    {
      return await _packageRecommendationService.GetRecommendations(packageType, userPrompt);
    }
}