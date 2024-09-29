using PackageDownloader.Core.Models;
using PackageDownloader.Core.Services.Abstractions;


namespace PackageDownloader.Core.Services.Implementations;

public class NpmPackageSearchService(IPackageInfoConverterService packageInfoConverter) : PackageSearchServiceBase
{

    const string SearchPackageRequestUrl = "https://www.npmjs.com/search/suggestions?q={0}";

    public override async Task<IEnumerable<PackageInfo>> SearchPacakgesByName(string name)
    {
        string url = string.Format(SearchPackageRequestUrl, name);

        var content = await GetStringFromUrl(url);

        return packageInfoConverter.ConvertNpmJsonStringToPackageInfo(content);

    }
}

