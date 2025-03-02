using PackageDownloader.Core.Models;
using PackageDownloader.Core.Services.Abstractions;
using PackageDownloader.Infrastructure.Extensions;
using PackageDownloader.Infrastructure.Services.Abstractions;

namespace PackageDownloader.Infrastructure.Services.Implementations.PackageSearch;

public class NpmPackageSearchService(IPackageInfoConverterService packageInfoConverter) : IPackageSearchService
{

    const string SearchPackageRequestUrl = "https://www.npmjs.com/search/suggestions?q={0}";

    public async Task<IEnumerable<string>> GetPackagesNamesSuggestions(string namePart)
    {

        string url = string.Format(SearchPackageRequestUrl, namePart);

        var content = await new Uri(url).GetJsonContentAsync();

        return packageInfoConverter.ConvertNpmJsonToSuggestionsList(content);  

    }

    public async Task<IEnumerable<PackageInfo>> SearchPackagesByName(string name)
    {
        string url = string.Format(SearchPackageRequestUrl, name);

        var content = await new Uri(url).GetJsonContentAsync();

        return packageInfoConverter.ConvertNpmJsonToPackageInfo(content);

    }
}

