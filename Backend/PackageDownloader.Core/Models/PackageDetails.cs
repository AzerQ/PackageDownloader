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

}