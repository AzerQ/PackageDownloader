using PackageDownloader.Core.Models;
using System.Text.Json;
using PackageDownloader.Core.Services.Abstractions;

namespace PackageDownloader.Infrastructure.Services.Abstractions
{
    public interface IPackageInfoConverterService
    {
        IReadOnlyList<PackageInfo> ConvertNugetJsonToPackageInfo(JsonDocument json);

        IReadOnlyList<PackageInfo> ConvertNpmJsonToPackageInfo(JsonDocument json);
        
        IReadOnlyList<PackageInfo> ConvertVsCodeJsonToPackageInfo(JsonDocument json);

        IReadOnlyList<string> ConvertNpmJsonToSuggestionsList(JsonDocument json);

        IReadOnlyList<string> ConvertNugetJsonToSuggestionsList(JsonDocument json);


        IReadOnlyList<PackageVersion> ConvertNpmJsonToPackageVersions(JsonDocument content, int maxVersionsCount);
        IReadOnlyList<PackageVersion> ConvertNugetJsonToPackageVersions(JsonDocument content, int maxVersionsCount, out List<string?> pagesRefs);
        IReadOnlyList<PackageVersion> ConvertVsCodeJsonToPackageVersions(JsonDocument content, int maxVersionsCount);
    }
}
