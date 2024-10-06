using PackageDownloader.Core.Services.Abstractions;
using PackageDownloader.Infrastructure.Resources;
using PackageDownloader.Infrastructure.Services.Abstractions;

namespace PackageDownloader.Infrastructure.Services.Implementations;

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
public class NugetPackageDownloaderService : CLIPackageDownloader, IPackageDownloadService
{

    protected readonly IFileSystemService _fileSystemService;

    public NugetPackageDownloaderService(IFileSystemService fileSystemService, IShellCommandService shellCommandService, IArchiveService archiveService) :
        base(fileSystemService, shellCommandService, archiveService)
    {
        _fileSystemService = fileSystemService;

        BeforePackagesDownloadStarted += (packageRequest, packagesOutputFolder) =>
        {
            string frameworkVersion = GetAvailableFrameworkVersion(packageRequest.SdkVersion);
            string projectFilePath = CreateDotnetProjectFile(frameworkVersion, packagesOutputFolder);
        };

        AfterPackagesDownloadFinished += (packageRequest, packagesOutputFolder) =>
        {
            CopyNupkgFilesAndRemoveOther(packagesOutputFolder);
        };
    }

    protected override string DownloadPackageCommandTemplate => "dotnet add package {0} --package-directory {1}";

    protected override string DownloadPackgeWithVersionCommandTemplate => "dotnet add package {0} --version {1} --package-directory {2}";

    private static string GetAvailableFrameworkVersion(string? currentVersion)
    {
        string[] availableFrameworks = [DotnetFrameworks.NetStandart2_0, DotnetFrameworks.NetStandart2_1,
                                                    DotnetFrameworks.Net6, DotnetFrameworks.Net7, DotnetFrameworks.Net8];

        string defaultFrameworkVersion = DotnetFrameworks.NetStandart2_0;

        return !string.IsNullOrEmpty(currentVersion) && availableFrameworks.Contains(currentVersion)
            ? currentVersion : defaultFrameworkVersion;

    }

    private static string CreateDotnetProjectFile(string frameworkVersion, string directoryPath)
    {
        string fileContent = string.Format(ProjectTemplates.DotnetTemplate, frameworkVersion);
        string filePath = Path.Combine(directoryPath, "Project.template.csproj");
        File.WriteAllText(filePath, fileContent);
        return filePath;
    }

    private void CopyNupkgFilesAndRemoveOther(string packagesFolder)
    {
        var nupkgFiles = _fileSystemService.GetAllFilesByExtension(packagesFolder, "nupkg");
        _fileSystemService.CopyFilesToFolder(nupkgFiles, packagesFolder);
        _fileSystemService.RemoveDirectoryItemsByFilter(packagesFolder, item => !item.EndsWith(".nupkg"));
    }

}
