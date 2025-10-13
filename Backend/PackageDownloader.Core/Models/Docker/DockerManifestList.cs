using System.Text.Json.Serialization;

namespace PackageDownloader.Core.Models.Docker;

/// <summary>
/// Docker manifest list (multi-platform) model
/// </summary>
public class DockerManifestList
{
    [JsonPropertyName("schemaVersion")]
    public int SchemaVersion { get; set; }

    [JsonPropertyName("mediaType")]
    public required string MediaType { get; set; }

    [JsonPropertyName("manifests")]
    public IEnumerable<DockerManifestDescriptor> Manifests { get; set; } = new List<DockerManifestDescriptor>();
}

public class DockerManifestDescriptor
{
    [JsonPropertyName("mediaType")]
    public required string MediaType { get; set; }

    [JsonPropertyName("size")]
    public long Size { get; set; }

    [JsonPropertyName("digest")]
    public required string Digest { get; set; }

    [JsonPropertyName("platform")]
    public DockerPlatform? Platform { get; set; }

    [JsonPropertyName("annotations")]
    public Dictionary<string, string>? Annotations { get; set; }
}

public class DockerPlatform
{
    [JsonPropertyName("architecture")]
    public required string Architecture { get; set; }

    [JsonPropertyName("os")]
    public required string Os { get; set; }

    [JsonPropertyName("os.version")]
    public string? OsVersion { get; set; }

    [JsonPropertyName("variant")]
    public string? Variant { get; set; }
}