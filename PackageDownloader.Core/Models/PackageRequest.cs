namespace PackageDownloader.Core.Models;

/// <summary>
/// Represents a request for downloading a package.
/// </summary>
public class PackageRequest
{
    /// <summary>
    /// The type of the package to be downloaded.
    /// </summary>
    public required PackageType PackageType { get; set; }

    public string? SdkVersion { get; set; }

    public required IEnumerable<PackageDetails> PackagesDetails { get; set; }
}
