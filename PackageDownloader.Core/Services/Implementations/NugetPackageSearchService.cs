using PackageDownloader.Core.Models;
using PackageDownloader.Core.Services.Abstractions;

namespace PackageDownloader.Core.Services.Implementations
{
    public class NugetPackageSearchService(IPackageInfoConverterService packageInfoConverter) : PackageSearchServiceBase
    {
        const string SearchPackageRequestUrl = "https://azuresearch-usnc.nuget.org/query?q={0}";

        public override async Task<IEnumerable<PackageInfo>> SearchPacakgesByName(string name)
        {
            string url = string.Format(SearchPackageRequestUrl, name);

            var content = await GetStringFromUrl(url);

            return packageInfoConverter.ConvertNugetJsonStringToPackageInfo(content);
        }
    }
}
