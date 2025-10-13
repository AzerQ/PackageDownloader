using System.Text.Json.Serialization;

namespace PackageDownloader.Core.Models.Docker;

/// <summary>
/// Docker Hub search API response model
/// </summary>
public class DockerHubSearchResponse
{
    [JsonPropertyName("count")]
    public int Count { get; set; }

    [JsonPropertyName("next")]
    public string? Next { get; set; }

    [JsonPropertyName("previous")]
    public string? Previous { get; set; }

    [JsonPropertyName("results")]
    public IEnumerable<DockerHubSearchResult> Results { get; set; } = new List<DockerHubSearchResult>();
}

public class DockerHubSearchResult
{
    [JsonPropertyName("repo_name")]
    public required string RepoName { get; set; }

    [JsonPropertyName("short_description")]
    public string? ShortDescription { get; set; }

    [JsonPropertyName("star_count")]
    public long StarCount { get; set; }

    [JsonPropertyName("pull_count")]
    public long PullCount { get; set; }

    [JsonPropertyName("repo_owner")]
    public string? RepoOwner { get; set; }

    [JsonPropertyName("is_automated")]
    public bool IsAutomated { get; set; }

    [JsonPropertyName("is_official")]
    public bool IsOfficial { get; set; }
}