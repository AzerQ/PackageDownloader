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

            using var content = await new Uri(url).GetJsonContentAsync();

            return packageInfoConverter.ConvertNugetJsonToSuggestionsList(content);
        }

        public async Task<IEnumerable<PackageVersion>> GetPackageVersions(string packageName, int maxVersionsCount)
        {
            var versions = await GetPackageVersionsInternal(packageName, maxVersionsCount);
            return versions
                .DistinctBy(version => version.VersionTag)
                .OrderByDescending(version => NuGetVersion.Parse(version.VersionTag))
                .Take(maxVersionsCount)
                .ToArray();
        }

        private async Task<IReadOnlyList<PackageVersion>> GetPackageVersionsInternal(
            string packageName,
            int maxVersionsCount,
            string? externalPageRef = null)
        {
            string url = string.Format(PackageDetailsTemplateUrl, packageName.ToLowerInvariant());
            
            using var content = await new Uri(externalPageRef ?? url).GetJsonContentAsync();
            var localVersions = packageInfoConverter
                .ConvertNugetJsonToPackageVersions(content, maxVersionsCount, out var pagesRefs);

            if (pagesRefs.Count == 0)
                return localVersions;

            var pageTasks = pagesRefs
                .Where(pageRef => pageRef is not null)
                .Select(pageRef => GetPackageVersionsInternal(packageName, maxVersionsCount, pageRef));
            var pageVersions = await Task.WhenAll(pageTasks);

            return localVersions.Concat(pageVersions.SelectMany(versions => versions)).ToArray();
        }

        public async Task<IEnumerable<PackageInfo>> SearchPackagesByName(string name)
        {
            string url = string.Format(SearchPackageRequestUrl, name);

            using var content = await new Uri(url).GetJsonContentAsync();

            return packageInfoConverter.ConvertNugetJsonToPackageInfo(content);
        }
    }
}
