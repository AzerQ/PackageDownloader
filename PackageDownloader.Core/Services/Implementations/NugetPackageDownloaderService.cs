using PackageDownloader.Core.Models;
using PackageDownloader.Core.Resources;
using PackageDownloader.Core.Services.Abstractions;
using PackageDownloader.PackageDownloader.Core.Services.Abstractions;

namespace PackageDownloader.Core.Services.Implementations;

public static class DotnetFrameworks
{
    public const string NetStandart2_0 = "netstandard2.0";
    public const string NetStandart2_1 = "netstandard2.1";
    public const string Net6 = "net6.0";
    public const string Net7 = "net7.0";
    public const string Net8 = "net8.0";
}

/// <summary>
/// Represents a service for downloading nuget packages.
/// </summary>
/// <param name="fileSystemService">An instance of <see cref="IFileSystemService"/> to handle file system operations.</param>
/// <param name="shellCommandService">An instance of <see cref="IShellCommandService"/> to execute shell commands.</param>
public class NugetPackageDownloaderService(IFileSystemService fileSystemService, IShellCommandService shellCommandService, IArchiveService archiveService) :
        PackageDownloaderBase(fileSystemService,archiveService)
{

    const string DownloadPackageTemplate = "dotnet add package {0} --package-directory {1}";
    const string DownloadPackageWithVersionTemplate = "dotnet add package {0} --package-directory {1} --version {2}";
    private string GetAvailableFrameworkVersion(string? currentVersion)
    {
        string[] availableFrameworks = [DotnetFrameworks.NetStandart2_0, DotnetFrameworks.NetStandart2_1,
                                                    DotnetFrameworks.Net6, DotnetFrameworks.Net7, DotnetFrameworks.Net8];

        string defaultFrameworkVersion = DotnetFrameworks.NetStandart2_0;

        return ( !string.IsNullOrEmpty(currentVersion) && availableFrameworks.Contains(currentVersion) ) 
            ? currentVersion : defaultFrameworkVersion;
       
    }

    private string GetPackageDownloadCommand(PackageRequest packageRequest, string packageDownloadFolder)
    {
        return (packageRequest.PackageVersion is not null) ?
             string.Format(DownloadPackageWithVersionTemplate, packageRequest.PackageID, packageDownloadFolder, packageRequest.PackageVersion) :
        string.Format(DownloadPackageTemplate, packageRequest.PackageID, packageDownloadFolder);
           
    }
    private string CreateDotnetProjectFile(string frameworkVersion, string directoryPath)
    {
        string fileContent = string.Format(ProjectTemplates.DotnetTemplate, frameworkVersion);
        string filePath = Path.Combine(directoryPath, "Project.template.csproj");
        File.WriteAllText(filePath, fileContent);
        return filePath;
    }

    private void CopyNupkgFilesAndRemoveOther(string packageOutputFolder, string packagesFolder)
    {
        var nupkgFiles = fileSystemService.GetAllFilesByExtension(packagesFolder, "nupkg");
        fileSystemService.CopyFilesToFolder(nupkgFiles, packageOutputFolder);
        fileSystemService.RemoveDirectoryItemsByFilter(packageOutputFolder, item => !item.EndsWith(".nupkg"));
    } 
    
    
    protected override void DownloadPackageInFolder(PackageRequest packageRequest, string folderPath)
    {
        string frameworkVersion = GetAvailableFrameworkVersion(packageRequest.SdkVersion);
        string projectFilePath = CreateDotnetProjectFile(frameworkVersion, folderPath);
        string pacakgeDownloadFolder = Path.Combine(folderPath, "packages");

        var downloadDotnetPackageCommand = new CommandInput
        {
            CommandName = GetPackageDownloadCommand(packageRequest, pacakgeDownloadFolder),
            WorkDirectory = folderPath
        };

        var downloadPackageResult = shellCommandService.ExecuteOrThrow(downloadDotnetPackageCommand);

        CopyNupkgFilesAndRemoveOther(packageOutputFolder: folderPath, packagesFolder: pacakgeDownloadFolder);

    }
}
