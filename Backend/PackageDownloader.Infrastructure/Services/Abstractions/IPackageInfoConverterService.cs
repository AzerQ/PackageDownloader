using PackageDownloader.Core.Models;
using System.Text.Json;
using PackageDownloader.Core.Services.Abstractions;

namespace PackageDownloader.Infrastructure.Services.Abstractions
{
    public interface IPackageInfoConverterService
    {
        IEnumerable<PackageInfo> ConvertNugetJsonToPackageInfo(JsonDocument json);

        IEnumerable<PackageInfo> ConvertNpmJsonToPackageInfo(JsonDocument json);
        
        IEnumerable<PackageInfo> ConvertVsCodeJsonToPackageInfo(JsonDocument json);

        IEnumerable<string> ConvertNpmJsonToSuggestionsList(JsonDocument json);

        IEnumerable<string> ConvertNugetJsonToSuggestionsList(JsonDocument json);


        IEnumerable<PackageVersion> ConvertNpmJsonToPackageVersions(JsonDocument content, int maxVersionsCount);
        IEnumerable<PackageVersion> ConvertNugetJsonToPackageVersions(JsonDocument content, int maxVersionsCount);
        IEnumerable<PackageVersion> ConvertVsCodeJsonToPackageVersions(JsonDocument content, int maxVersionsCount);
    }
}
