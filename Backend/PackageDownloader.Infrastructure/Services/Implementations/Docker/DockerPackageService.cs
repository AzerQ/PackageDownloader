using PackageDownloader.Core.Models;
using PackageDownloader.Core.Services.Abstractions;
using PackageDownloader.Infrastructure.Services.Abstractions;

namespace PackageDownloader.Infrastructure.Services.Implementations.Docker;

/// <summary>
/// Extended Docker package service for detailed package information
/// </summary>
public class DockerPackageService : IDockerPackageService
{
    private readonly IDockerHubHttpClient _dockerHubClient;

    public DockerPackageService(IDockerHubHttpClient dockerHubClient)
    {
        _dockerHubClient = dockerHubClient;
    }

    public async Task<PackageInfo?> GetDetailedPackageInfoAsync(string packageId)
    {
        try
        {
            // First, search for the package to get basic info
            var searchResponse = await _dockerHubClient.SearchImagesAsync(packageId, 1, 50);
            var searchResult = searchResponse.Results.FirstOrDefault(r => 
                r.RepoName.Equals(packageId, StringComparison.OrdinalIgnoreCase));

            if (searchResult == null)
            {
                return null;
            }

            // Now get tags for detailed version information
            var tagsResponse = await _dockerHubClient.GetImageTagsAsync(packageId, 1, 100);
            var tags = tagsResponse.Results.Select(t => t.Name).ToList();

            return new PackageInfo
            {
                Id = searchResult.RepoName,
                CurrentVersion = tags.FirstOrDefault(t => t == "latest") ?? tags.FirstOrDefault() ?? "latest",
                OtherVersions = tags.Where(t => t != "latest").Take(50), // Get more versions for detailed view
                Description = searchResult.ShortDescription ?? "No description available",
                Tags = new[] { searchResult.IsOfficial ? "official" : "community", "docker" }
                    .Concat(searchResult.IsAutomated ? new[] { "automated" } : Array.Empty<string>()),
                AuthorInfo = searchResult.RepoOwner ?? "Docker Hub",
                PackageUrl = GetCorrectPackageUrl(searchResult.RepoName, searchResult.IsOfficial),
                DownloadsCount = searchResult.PullCount
            };
        }
        catch (Exception)
        {
            return null;
        }
    }

    public async Task<IEnumerable<string>> GetPackageTagsAsync(string packageId, int page = 1, int pageSize = 100)
    {
        try
        {
            var tagsResponse = await _dockerHubClient.GetImageTagsAsync(packageId, page, pageSize);
            return tagsResponse.Results.Select(t => t.Name);
        }
        catch (Exception)
        {
            return Array.Empty<string>();
        }
    }

    private static string GetCorrectPackageUrl(string repoName, bool isOfficial)
    {
        // Official images don't have the /r/ prefix in their URL
        return isOfficial || !repoName.Contains('/')
            ? $"https://hub.docker.com/_/{repoName}"
            : $"https://hub.docker.com/r/{repoName}";
    }
}