using PackageDownloader.Core.Services.Abstractions;
using PackageDownloader.Infrastructure.Services.Abstractions;

namespace PackageDownloader.Infrastructure.Services.Implementations;

/// <summary>
/// Represents a service for downloading npm packages.
/// </summary>
/// <param name="fileSystemService">An instance of <see cref="IFileSystemService"/> to handle file system operations.</param>
/// <param name="shellCommandService">An instance of <see cref="IShellCommandService"/> to execute shell commands.</param>
public class NpmPackageDownloaderService(IFileSystemService fileSystemService, IShellCommandService shellCommandService, IArchiveService archiveService) :
    CLIPackageDownloader(fileSystemService, shellCommandService, archiveService), IPackageDownloadService 
{
    protected override string DownloadPackageCommandTemplate => "npm install {0} --save --prefix {1}";

    protected override string DownloadPackgeWithVersionCommandTemplate => "npm install {0}@{1} --save --prefix {2}";

}
