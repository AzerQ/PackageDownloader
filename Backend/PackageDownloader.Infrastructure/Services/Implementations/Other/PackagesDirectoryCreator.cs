using System.Text;
using PackageDownloader.Core.Models;
using PackageDownloader.Infrastructure.Services.Abstractions;

namespace PackageDownloader.Infrastructure.Services.Implementations.Other;

public class PackagesDirectoryCreator (IFileSystemService fileSystemService) : IPackagesDirectoryCreator
{

    private string GetPackagesDirectoryName(PackageRequest packageRequest)
    {
        if (packageRequest.PackagesDetails.Count() > 1)
            return "packages_" + Guid.NewGuid().ToString();

        else
        {
            var packageDetails = packageRequest.PackagesDetails.First();
            var fileNameBuilder = new StringBuilder()
                .Append(packageDetails.PackageID)
                .Append('_')
                .Append(packageDetails.PackageVersion ?? "last")
                .Append('_')
                .Append(packageRequest.SdkVersion ?? "default");

            return fileNameBuilder.ToString();

        }
    }

    
    public  (string tempFolderPath, string packagesDirectory) CreatePackagesTempDirectory(PackageRequest packageRequest)
    {
        string directoryName = GetPackagesDirectoryName(packageRequest);
        string tempFolderPath = fileSystemService.CreateTempFolder();
        string packagesDirectory = fileSystemService.CreateDirectory(tempFolderPath, directoryName);

        return (tempFolderPath, packagesDirectory);

    }
    
}