using PackageDownloader.Core.Models;

namespace PackageDownloader.Infrastructure.Services.Abstractions;

public interface IPackagesDirectoryCreator
{
    (string tempFolderPath, string packagesDirectory) CreatePackagesTempDirectory(PackageRequest packageRequest);
}