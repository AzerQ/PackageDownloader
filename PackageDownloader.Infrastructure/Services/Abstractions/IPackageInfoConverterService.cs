using PackageDownloader.Core.Models;
using System.Text.Json;

namespace PackageDownloader.Infrastructure.Services.Abstractions
{
    public interface IPackageInfoConverterService
    {
        IEnumerable<PackageInfo> ConvertNugetJsonStringToPackageInfo(JsonDocument json);

        IEnumerable<PackageInfo> ConvertNpmJsonStringToPackageInfo(JsonDocument json);

    }
}
