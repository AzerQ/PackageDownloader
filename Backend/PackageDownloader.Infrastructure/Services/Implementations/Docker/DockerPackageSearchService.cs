using PackageDownloader.Core.Models;
using PackageDownloader.Core.Models.Docker;
using PackageDownloader.Core.Services.Abstractions;
using PackageDownloader.Infrastructure.Services.Abstractions;

namespace PackageDownloader.Infrastructure.Services.Implementations.Docker;

/// <summary>
/// Docker package search service implementation
/// </summary>
public class DockerPackageSearchService : IPackageSearchService
{
    private readonly IDockerHubHttpClient _dockerHubClient;

    public DockerPackageSearchService(IDockerHubHttpClient dockerHubClient)
    {
        _dockerHubClient = dockerHubClient;
    }

    public async Task<IEnumerable<PackageInfo>> SearchPackagesByName(string namePart)
    {
        var searchResponse = await _dockerHubClient.SearchImagesAsync(namePart, 1, 25); // Reduce to 25 for faster processing
        
        var packages = new List<PackageInfo>();
        
        // Get tags for top repositories in parallel (limited to first 10 for performance)
        var topResults = searchResponse.Results.Take(10).ToList();
        var otherResults = searchResponse.Results.Skip(10).ToList();
        
        // Process top 10 results with tags in parallel
        var tagTasks = topResults.Select(async result =>
        {
            try
            {
                // Get only first 5 most recent tags for performance
                var tagsResponse = await _dockerHubClient.GetImageTagsAsync(result.RepoName, 1, 5);
                var tags = tagsResponse.Results.Select(t => t.Name).ToList();
                
                return new PackageInfo
                {
                    Id = result.RepoName,
                    CurrentVersion = tags.FirstOrDefault(t => t == "latest") ?? tags.FirstOrDefault() ?? "latest",
                    OtherVersions = tags.Where(t => t != "latest").Take(4), // Show max 4 other versions
                    Description = result.ShortDescription ?? "No description available",
                    Tags = new[] { result.IsOfficial ? "official" : "community", "docker" }
                        .Concat(result.IsAutomated ? new[] { "automated" } : Array.Empty<string>()),
                    AuthorInfo = result.RepoOwner ?? "Docker Hub",
                    PackageUrl = GetCorrectPackageUrl(result.RepoName, result.IsOfficial),
                    DownloadsCount = result.PullCount
                };
            }
            catch (Exception)
            {
                // Fallback to basic info if tags fetch fails
                return CreateBasicPackageInfo(result);
            }
        });
        
        // Wait for all tag requests to complete
        var topPackages = await Task.WhenAll(tagTasks);
        packages.AddRange(topPackages);
        
        // Process remaining results without tags for speed
        foreach (var result in otherResults)
        {
            packages.Add(CreateBasicPackageInfo(result));
        }
        
        return packages.OrderByDescending(p => p.DownloadsCount);
    }

    private PackageInfo CreateBasicPackageInfo(DockerHubSearchResult result)
    {
        return new PackageInfo
        {
            Id = result.RepoName,
            CurrentVersion = "latest", // Default to latest for basic results
            OtherVersions = Array.Empty<string>(), // No additional versions for basic results
            Description = result.ShortDescription ?? "No description available",
            Tags = new[] { result.IsOfficial ? "official" : "community", "docker" }
                .Concat(result.IsAutomated ? new[] { "automated" } : Array.Empty<string>()),
            AuthorInfo = result.RepoOwner ?? "Docker Hub",
            PackageUrl = GetCorrectPackageUrl(result.RepoName, result.IsOfficial),
            DownloadsCount = result.PullCount
        };
    }

    private static string GetCorrectPackageUrl(string repoName, bool isOfficial)
    {
        // Official images don't have the /r/ prefix in their URL
        return isOfficial || !repoName.Contains('/')
            ? $"https://hub.docker.com/_/{repoName}"
            : $"https://hub.docker.com/r/{repoName}";
    }

    public async Task<IEnumerable<string>> GetPackagesNamesSuggestions(string namePart)
    {
        var searchResponse = await _dockerHubClient.SearchImagesAsync(namePart, 1, 20);
        
        return searchResponse.Results
            .Select(r => r.RepoName)
            .Where(name => name.Contains(namePart, StringComparison.OrdinalIgnoreCase))
            .OrderBy(name => name.Length)
            .Take(10);
    }
}