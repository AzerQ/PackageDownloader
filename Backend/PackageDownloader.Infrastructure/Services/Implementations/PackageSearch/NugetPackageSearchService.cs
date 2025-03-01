using PackageDownloader.Core.Models;
using PackageDownloader.Core.Services.Abstractions;
using PackageDownloader.Infrastructure.Extensions;
using PackageDownloader.Infrastructure.Services.Abstractions;

namespace PackageDownloader.Infrastructure.Services.Implementations.PackageSearch
{
    public class NugetPackageSearchService(IPackageInfoConverterService packageInfoConverter) : IPackageSearchService
    {
        const string SearchPackageRequestUrl = "https://azuresearch-usnc.nuget.org/query?q={0}";

        const string AutocompleteTemplateUrl = "https://azuresearch-ussc.nuget.org/autocomplete?q={0}";

        public async Task<IEnumerable<string>> GetPackagesNamesSuggestions(string namePart)
        {
            string url = string.Format(AutocompleteTemplateUrl, namePart);

            var content = await new Uri(url).GetJsonContent();

            return packageInfoConverter.ConvertNugetJsonToSuggestionsList(content);
        }

        public async Task<IEnumerable<PackageInfo>> SearchPackagesByName(string name)
        {
            string url = string.Format(SearchPackageRequestUrl, name);

            var content = await new Uri(url).GetJsonContent();

            return packageInfoConverter.ConvertNugetJsonToPackageInfo(content);
        }
    }
}
