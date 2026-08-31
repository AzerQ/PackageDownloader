using System.Text.Json.Serialization;

namespace PackageDownloader.Core.Models.GitHub;

/// <summary>
/// GitHub repositories search API response model
/// </summary>
public class GitHubSearchResponse
{
    [JsonPropertyName("total_count")]
    public int TotalCount { get; set; }

    [JsonPropertyName("incomplete_results")]
    public bool IncompleteResults { get; set; }

    [JsonPropertyName("items")]
    public IEnumerable<GitHubRepository> Items { get; set; } = [];
}
