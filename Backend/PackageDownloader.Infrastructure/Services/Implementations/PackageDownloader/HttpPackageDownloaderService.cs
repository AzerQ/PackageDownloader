using PackageDownloader.Core.Models;
using PackageDownloader.Core.Services.Abstractions;
using PackageDownloader.Infrastructure.Extensions;
using PackageDownloader.Infrastructure.Services.Abstractions;

namespace PackageDownloader.Infrastructure.Services.Implementations.PackageDownloader;

public class HttpPackageDownloaderService(IPackagesDirectoryCreator packagesDirectoryCreator, 
                                        IArchiveService archiveService, 
                                        Func<PackageType, PackageDetails, Uri> uriResolver,
                                        Func<PackageType, PackageDetails, string> fileNameResolver) : IPackageDownloadService
{
    public string DownloadPackagesAsArchive(PackageRequest packageRequest)
    {
        (string tempFolderPath, string packagesDirectory) = packagesDirectoryCreator.CreatePackagesTempDirectory(packageRequest);

        foreach (var packageDetail in packageRequest.PackagesDetails)
        {
            Uri packageDownloadUri = uriResolver(packageRequest.PackageType, packageDetail);
            string destinationFilePath = Path.Combine(packagesDirectory, fileNameResolver(packageRequest.PackageType, packageDetail));

            packageDownloadUri
                .SaveFileAsync(destinationFilePath)
                .Wait();

        }
        
        return archiveService.ArchiveFolder(packagesDirectory, tempFolderPath);
    }
}