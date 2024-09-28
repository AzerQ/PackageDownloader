
using PackageDownloader.Core.Models;
using PackageDownloader.Core.Services.Abstractions;
using PackageDownloader.PackageDownloader.Core.Services.Abstractions;

namespace PackageDownloader.Core.Services.Implementations;

/// <summary>
/// Represents a service for downloading npm packages.
/// </summary>
/// <param name="fileSystemService">An instance of <see cref="IFileSystemService"/> to handle file system operations.</param>
/// <param name="shellCommandService">An instance of <see cref="IShellCommandService"/> to execute shell commands.</param>
public class NpmPackageDownloaderService(IFileSystemService fileSystemService, IShellCommandService shellCommandService, IArchiveService archiveService) : 
    PackageDownloaderBase(fileSystemService, archiveService)
{
    const string DownloadPackageTemplate = "npm install {0} --save --prefix {1}";
    const string DownloadPackgeWithVersionTemplate = "npm install {0}@{1} --save --prefix {2}";

    private string GetPackageDownloadCommand(PackageRequest packageRequest, string folderPath)
    {
        return (packageRequest.PackageVersion is not null) ?
            string.Format(DownloadPackgeWithVersionTemplate, packageRequest.PackageID, packageRequest.PackageVersion, folderPath) :
            string.Format(DownloadPackageTemplate, packageRequest.PackageID, folderPath);
    }

    protected override void DownloadPackageInFolder(PackageRequest packageRequest, string folderPath)
    {
        var downloadNpmPackageCommand = new CommandInput
        {
            CommandName = GetPackageDownloadCommand(packageRequest, folderPath),
            WorkDirectory = folderPath
        };

        var downloadPacakgeResult = shellCommandService.ExecuteOrThrow(downloadNpmPackageCommand);
    }
}
