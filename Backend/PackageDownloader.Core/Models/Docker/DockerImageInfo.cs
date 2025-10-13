namespace PackageDownloader.Core.Models.Docker;

/// <summary>
/// Represents Docker image information from Docker Hub
/// </summary>
public class DockerImageInfo
{
    public required string Name { get; set; }
    public required string Description { get; set; }
    public required string ShortDescription { get; set; }
    public bool IsOfficial { get; set; }
    public bool IsAutomated { get; set; }
    public int StarCount { get; set; }
    public int PullCount { get; set; }
    public required string RepoOwner { get; set; }
    public required string RepoName { get; set; }
    public DateTime LastUpdated { get; set; }
    public IEnumerable<string> Tags { get; set; } = new List<string>();
}