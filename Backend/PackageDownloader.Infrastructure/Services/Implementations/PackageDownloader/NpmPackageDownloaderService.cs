using PackageDownloader.Core.Services.Abstractions;
using PackageDownloader.Infrastructure.Services.Abstractions;

namespace PackageDownloader.Infrastructure.Services.Implementations.PackageDownloader;

/// <summary>
/// Represents a service for downloading npm packages.
/// </summary>
/// <param name="shellCommandService">An instance of <see cref="IShellCommandService"/> to execute shell commands.</param>
public class NpmPackageDownloaderService(IPackagesDirectoryCreator packagesDirectoryCreator, IShellCommandService shellCommandService, IArchiveService archiveService) :
    CliPackageDownloader(packagesDirectoryCreator, shellCommandService, archiveService) 
{
    protected override string DownloadPackageCommandTemplate => "npm install {0} --save --prefix {1}";

    protected override string DownloadPackageWithVersionCommandTemplate => "npm install {0}@{1} --save --prefix {2}";

}
