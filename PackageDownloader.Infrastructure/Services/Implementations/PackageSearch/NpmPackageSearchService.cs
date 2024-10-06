using PackageDownloader.Core.Models;
using PackageDownloader.Core.Services.Abstractions;
using PackageDownloader.Infrastructure.Extensions;
using PackageDownloader.Infrastructure.Services.Abstractions;


namespace PackageDownloader.Infrastructure.Services.Implementations;

public class NpmPackageSearchService(IPackageInfoConverterService packageInfoConverter) : IPackageSearchService
{

    const string SearchPackageRequestUrl = "https://www.npmjs.com/search/suggestions?q={0}";

    public Task<IEnumerable<string>> GetPackagesNamesSuggestions(string namePart)
    {
        throw new NotImplementedException();
    }

    public async Task<IEnumerable<PackageInfo>> SearchPacakgesByName(string name)
    {
        string url = string.Format(SearchPackageRequestUrl, name);

        var content = await new Uri(url).GetJsonContent();

        return packageInfoConverter.ConvertNpmJsonStringToPackageInfo(content);

    }
}

