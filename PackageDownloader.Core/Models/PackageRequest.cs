using System.Text.Json.Serialization;

namespace PackageDownloader.Core.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum PackageType
{
    Npm,
    Nuget
}

/// <summary>
/// Represents a request for downloading a package.
/// </summary>
public class PackageRequest
{
    /// <summary>
    /// The type of the package to be downloaded.
    /// </summary>
    public required PackageType PackageType { get; set; }

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

    public string? SdkVersion { get; set; }
}

