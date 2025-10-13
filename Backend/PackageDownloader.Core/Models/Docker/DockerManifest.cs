using System.Text.Json.Serialization;

namespace PackageDownloader.Core.Models.Docker;

/// <summary>
/// Docker image manifest model
/// </summary>
public class DockerManifest
{
    [JsonPropertyName("schemaVersion")]
    public int SchemaVersion { get; set; }

    [JsonPropertyName("mediaType")]
    public required string MediaType { get; set; }

    [JsonPropertyName("config")]
    public required DockerConfig Config { get; set; }

    [JsonPropertyName("layers")]
    public IEnumerable<DockerLayer> Layers { get; set; } = new List<DockerLayer>();
}

public class DockerConfig
{
    [JsonPropertyName("mediaType")]
    public required string MediaType { get; set; }

    [JsonPropertyName("size")]
    public long Size { get; set; }

    [JsonPropertyName("digest")]
    public required string Digest { get; set; }
}

public class DockerLayer
{
    [JsonPropertyName("mediaType")]
    public required string MediaType { get; set; }

    [JsonPropertyName("size")]
    public long Size { get; set; }

    [JsonPropertyName("digest")]
    public required string Digest { get; set; }
}