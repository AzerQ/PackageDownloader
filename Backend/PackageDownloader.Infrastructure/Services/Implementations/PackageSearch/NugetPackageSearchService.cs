using NuGet.Versioning;
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

        private const string PackageDetailsTemplateUrl = "https://api.nuget.org/v3/registration5-semver1/{0}/index.json";
        
        public async Task<IEnumerable<string>> GetPackagesNamesSuggestions(string namePart)
        {
            string url = string.Format(AutocompleteTemplateUrl, namePart);

            var content = await new Uri(url).GetJsonContentAsync();

            return packageInfoConverter.ConvertNugetJsonToSuggestionsList(content);
        }

        public async Task<IEnumerable<PackageVersion>> GetPackageVersions(string packageName, int maxVersionsCount)
        {
            return await GetPackageVersionsInternal(packageName, maxVersionsCount);
        }

        private async Task<IEnumerable<PackageVersion>> GetPackageVersionsInternal(string packageName, int maxVersionsCount, List<PackageVersion>? alreadyAddedVersions = null, string? externalPageRef = null)
        {
            string url = string.Format(PackageDetailsTemplateUrl, packageName.ToLowerInvariant());
            
            var content = await new Uri(externalPageRef ?? url).GetJsonContentAsync();
            
            alreadyAddedVersions ??= new List<PackageVersion>(maxVersionsCount);
            alreadyAddedVersions.AddRange(packageInfoConverter.ConvertNugetJsonToPackageVersions(content, maxVersionsCount, out var pagesRefs));
            if (pagesRefs.Count > 0)
            {
                var pagesLoadTasks = pagesRefs.Select(async pageRef =>
                    await GetPackageVersionsInternal(packageName, maxVersionsCount, alreadyAddedVersions, pageRef));
                var results = await Task.WhenAll(pagesLoadTasks);
                return results.SelectMany(v => v);
            }
            
            return alreadyAddedVersions
                .DistinctBy(v => v.VersionTag)
                .OrderByDescending(v => SemanticVersion.Parse(v.VersionTag))
                .Take(maxVersionsCount);
        }

        public async Task<IEnumerable<PackageInfo>> SearchPackagesByName(string name)
        {
            string url = string.Format(SearchPackageRequestUrl, name);

            var content = await new Uri(url).GetJsonContentAsync();

            return packageInfoConverter.ConvertNugetJsonToPackageInfo(content);
        }
    }
}
