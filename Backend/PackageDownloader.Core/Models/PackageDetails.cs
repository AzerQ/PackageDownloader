namespace PackageDownloader.Core.Models;

public class PackageDetails
{
    /// <summary>
    /// The ID of the package to be downloaded.
    /// </summary>
    /// <remarks>This property is required.</remarks>
    public required string PackageID { get; set; }

    /// <summary>
    /// The version of the package to be downloaded.
    /// If not provided, the latest version will be downloaded.
    /// </summary>
    public string? PackageVersion { get; set; }

    /// <summary>
    /// The kind of artifact to be downloaded for the requested version.
    /// </summary>
    /// <remarks>
    /// Only meaningful for package types exposing several artifacts per version (GitHub releases).
    /// For GitHub it is either a release asset name, <c>source</c> for the source code archive,
    /// or <c>all</c> / <see langword="null"/> for every asset of the release.
    /// </remarks>
    public string? ArtifactType { get; set; }
}