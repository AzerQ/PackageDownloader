using PackageDownloader.Core.Models;

namespace PackageDownloader.Core.Services.Abstractions
{
    public interface IPackageSearchService
    {
        Task<IEnumerable<PackageInfo>> SearchPackagesByName(string namePart);

        Task<IEnumerable<string>> GetPackagesNamesSuggestions(string namePart);
        
        Task<IEnumerable<PackageVersion>> GetPackageVersions(string packageName, int maxVersionsCount);
    }
}
