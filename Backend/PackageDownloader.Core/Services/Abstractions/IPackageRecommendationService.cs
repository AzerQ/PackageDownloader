using PackageDownloader.Core.Models;

namespace PackageDownloader.Core.Services.Abstractions;

public interface IPackageRecommendationService
{
    Task<IEnumerable<PackageRecommendation>?> GetRecommendations(PackageType packageType, string userPrompt);
}