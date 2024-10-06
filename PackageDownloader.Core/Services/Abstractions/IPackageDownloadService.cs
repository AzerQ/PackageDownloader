using PackageDownloader.Core.Models;

namespace PackageDownloader.Core.Services.Abstractions
{
    public interface IPackageDownloadService
    {
        string DownloadPackagesAsArchive(PackageRequest packageRequest);
    }
}
