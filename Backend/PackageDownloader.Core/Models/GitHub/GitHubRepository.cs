using System.Text.Json.Serialization;

namespace PackageDownloader.Core.Models.GitHub;

/// <summary>
/// GitHub repository API response model
/// </summary>
public class GitHubRepository
{
    [JsonPropertyName("full_name")]
    public required string FullName { get; set; }

    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("owner")]
    public GitHubOwner? Owner { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("default_branch")]
    public string? DefaultBranch { get; set; }

    [JsonPropertyName("html_url")]
    public string? HtmlUrl { get; set; }

    [JsonPropertyName("language")]
    public string? Language { get; set; }

    [JsonPropertyName("topics")]
    public IEnumerable<string> Topics { get; set; } = [];

    [JsonPropertyName("stargazers_count")]
    public long StargazersCount { get; set; }

    [JsonPropertyName("forks_count")]
    public long ForksCount { get; set; }

    [JsonPropertyName("archived")]
    public bool Archived { get; set; }

    [JsonPropertyName("fork")]
    public bool Fork { get; set; }

    [JsonPropertyName("pushed_at")]
    public DateTime? PushedAt { get; set; }
}

public class GitHubOwner
{
    [JsonPropertyName("login")]
    public required string Login { get; set; }

    [JsonPropertyName("avatar_url")]
    public string? AvatarUrl { get; set; }
}
