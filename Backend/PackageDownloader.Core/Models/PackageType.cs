using System.Text.Json.Serialization;

namespace PackageDownloader.Core.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum PackageType
{
    Npm,
    Nuget,
    VsCode,
    Docker
}
