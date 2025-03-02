using PackageDownloader.Core.Models;
using PackageDownloader.Core.Services.Abstractions;
using PackageDownloader.Infrastructure.Extensions;
using PackageDownloader.Infrastructure.Services.Abstractions;

namespace PackageDownloader.Infrastructure.Services.Implementations.PackageSearch;

public class VsCodePackageSearchService (IPackageInfoConverterService packageInfoConverter, IGlobalWebSearchService globalWebSearchService) : IPackageSearchService
{
    const string SearchExtensionRequestUrl = "https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery";
    private const string SearchVsCodeExtensionsPrePrompt = "vscode extension";
    
    public async Task<IEnumerable<string>> GetPackagesNamesSuggestions(string namePart)
    {
        return await globalWebSearchService.GetSearchSuggestions(namePart, SearchVsCodeExtensionsPrePrompt);
    }

    public async Task<IEnumerable<PackageInfo>> SearchPackagesByName(string name)
    {
        var searchRequestData = new 
        { 
            assetTypes = new[] 
            {
                "Microsoft.VisualStudio.Services.Icons.Default",
                "Microsoft.VisualStudio.Services.Icons.Branding",
                "Microsoft.VisualStudio.Services.Icons.Small"
            },
            filters = new[] 
            { 
                new 
                {
                    criteria = new[]
                    {
                        new { filterType = 8, value = "Microsoft.VisualStudio.Code" },
                        new { filterType = 10, value = name },
                        new { filterType = 12, value = "37888" }
                    },
                    direction = 2,
                    pageSize = 54,
                    pageNumber = 1,
                    sortBy = 0,
                    sortOrder = 0,
                    pagingToken = null as object
                }
            },
            flags = 870
        };
        var jsonResult = await new Uri(SearchExtensionRequestUrl).PostJsonDataAsync(searchRequestData);
        return packageInfoConverter.ConvertVsCodeJsonToPackageInfo(jsonResult);
    }
}