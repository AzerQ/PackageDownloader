using System.Text.Json.Serialization;

namespace PackageDownloader.Core.Models.Docker;

/// <summary>
/// Docker Hub tags API response model
/// </summary>
public class DockerHubTagsResponse
{
    [JsonPropertyName("count")]
    public int Count { get; set; }

    [JsonPropertyName("next")]
    public string? Next { get; set; }

    [JsonPropertyName("previous")]
    public string? Previous { get; set; }

    [JsonPropertyName("results")]
    public IEnumerable<DockerTag> Results { get; set; } = new List<DockerTag>();
}

public class DockerTag
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("full_size")]
    public long? FullSize { get; set; }

    [JsonPropertyName("last_updated")]
    public DateTime LastUpdated { get; set; }

    [JsonPropertyName("last_updater_username")]
    public string? LastUpdaterUsername { get; set; }

    [JsonPropertyName("images")]
    public IEnumerable<DockerTagImage> Images { get; set; } = new List<DockerTagImage>();
}

public class DockerTagImage
{
    [JsonPropertyName("architecture")]
    public required string Architecture { get; set; }

    [JsonPropertyName("os")]
    public required string Os { get; set; }

    [JsonPropertyName("size")]
    public long Size { get; set; }

    [JsonPropertyName("digest")]
    public required string Digest { get; set; }
}