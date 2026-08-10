using PackageDownloader.Core.Models;
using PackageDownloader.Core.Services.Abstractions;
using PackageDownloader.Infrastructure.Extensions;
using PackageDownloader.Infrastructure.Services.Abstractions;

namespace PackageDownloader.Infrastructure.Services.Implementations.PackageSearch;

public class NpmPackageSearchService(IPackageInfoConverterService packageInfoConverter) : IPackageSearchService
{
    // Используем официальное NPM Registry API вместо веб-интерфейса
    const string SearchPackageRequestUrl = "https://registry.npmjs.org/-/v1/search?text={0}&size=20";
    
    const string GetPackageDetailsUrl = "https://registry.npmjs.org/{0}";

    public async Task<IEnumerable<string>> GetPackagesNamesSuggestions(string namePart)
    {
        string url = string.Format(SearchPackageRequestUrl, namePart);

        var content = await new Uri(url).GetJsonContentAsync();

        return packageInfoConverter.ConvertNpmJsonToSuggestionsList(content);  
    }

    public async Task<IEnumerable<PackageVersion>> GetPackageVersions(string packageName, int maxVersionsCount)
    {
        string url = string.Format(GetPackageDetailsUrl, packageName);
        var content = await new Uri(url).GetJsonContentAsync();
        return packageInfoConverter.ConvertNpmJsonToPackageVersions(content, maxVersionsCount);
    }

    public async Task<IEnumerable<PackageInfo>> SearchPackagesByName(string name)
    {
        string url = string.Format(SearchPackageRequestUrl, name);

        var content = await new Uri(url).GetJsonContentAsync();

        return packageInfoConverter.ConvertNpmJsonToPackageInfo(content);
    }
}

