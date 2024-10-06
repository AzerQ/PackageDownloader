using PackageDownloader.Core.Models;

namespace PackageDownloader.Core.Services.Abstractions
{
    public interface IPackageSearchService
    {
        Task<IEnumerable<PackageInfo>> SearchPacakgesByName(string namePart);

        Task<IEnumerable<string>> GetPackagesNamesSuggestions(string namePart);
    }
}
