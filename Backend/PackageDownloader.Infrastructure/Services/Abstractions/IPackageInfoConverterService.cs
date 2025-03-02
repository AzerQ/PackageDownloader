using PackageDownloader.Core.Models;
using System.Text.Json;

namespace PackageDownloader.Infrastructure.Services.Abstractions
{
    public interface IPackageInfoConverterService
    {
        IEnumerable<PackageInfo> ConvertNugetJsonToPackageInfo(JsonDocument json);

        IEnumerable<PackageInfo> ConvertNpmJsonToPackageInfo(JsonDocument json);
        
        IEnumerable<PackageInfo> ConvertVsCodeJsonToPackageInfo(JsonDocument json);

        IEnumerable<string> ConvertNpmJsonToSuggestionsList(JsonDocument json);

        IEnumerable<string> ConvertNugetJsonToSuggestionsList(JsonDocument json);
        

    }
}
