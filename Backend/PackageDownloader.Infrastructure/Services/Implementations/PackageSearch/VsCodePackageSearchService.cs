using System.Text.Json;
using System.Text.Json.Serialization;
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

    public async Task<IEnumerable<PackageVersion>> GetPackageVersions(string packageName, int maxVersionsCount)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(packageName);

        const int filterTypeExtensionName = 7;
        const int filterTypeTarget = 8;
        const int includeVersions = 0x1;
        const int includeVersionProperties = 0x10;

        var queryUri = new Uri(SearchExtensionRequestUrl);

        var request = new
        {
            filters = new[]
            {
                new
                {
                    criteria = new[]
                    {
                        new { filterType = filterTypeExtensionName, value = packageName.Replace("/", ".") },
                        new { filterType = filterTypeTarget, value = "Microsoft.VisualStudio.Code" }
                    },
                    pageNumber = 1,
                    pageSize = 1
                }
            },
            flags = includeVersions | includeVersionProperties
        };

        var headers = new Dictionary<string, string>
        {
            ["Accept"] = "application/json;api-version=3.0-preview.1"
        };
        
        using JsonDocument content = await queryUri.PostJsonDataAsync(request, headers);
        return packageInfoConverter.ConvertVsCodeJsonToPackageVersions(content, maxVersionsCount);
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
        using var jsonResult = await new Uri(SearchExtensionRequestUrl).PostJsonDataAsync(searchRequestData);
        return packageInfoConverter.ConvertVsCodeJsonToPackageInfo(jsonResult);
    }
}

internal sealed record GalleryQueryRequest(
    [property: JsonPropertyName("filters")] GalleryFilter[] Filters,
    [property: JsonPropertyName("flags")] int Flags);

internal sealed record GalleryFilter(
    [property: JsonPropertyName("criteria")] GalleryCriterion[] Criteria,
    [property: JsonPropertyName("pageNumber")] int PageNumber,
    [property: JsonPropertyName("pageSize")] int PageSize);

internal sealed record GalleryCriterion(
    [property: JsonPropertyName("filterType")] int FilterType,
    [property: JsonPropertyName("value")] string Value);
