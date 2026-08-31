namespace PackageDownloader.Core.Models.GitHub;

/// <summary>
/// Describes a single downloadable artifact of a GitHub release version.
/// </summary>
/// <remarks>
/// The <see cref="ArtifactType"/> value is what the client puts into
/// <see cref="PackageDetails.ArtifactType"/> when requesting a download.
/// </remarks>
public class GitHubArtifactInfo
{
    /// <summary>
    /// Value to be passed back as <see cref="PackageDetails.ArtifactType"/>.
    /// </summary>
    public required string ArtifactType { get; set; }

    /// <summary>
    /// Human readable artifact (file) name.
    /// </summary>
    public required string Name { get; set; }

    public string? ContentType { get; set; }

    public long Size { get; set; }

    public long DownloadsCount { get; set; }

    public string? DownloadUrl { get; set; }

    /// <summary>
    /// True for the pseudo artifacts (source code archive, all release assets at once)
    /// that are not real release assets.
    /// </summary>
    public bool IsVirtual { get; set; }
}
