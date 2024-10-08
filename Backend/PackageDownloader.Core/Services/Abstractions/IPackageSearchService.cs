using PackageDownloader.Core.Models;

namespace PackageDownloader.Core.Services.Abstractions
{
    public interface IPackageSearchService
    {
        Task<IEnumerable<PackageInfo>> SearchPackagesByName(string namePart);

        Task<IEnumerable<string>> GetPackagesNamesSuggestions(string namePart);
    }
}
