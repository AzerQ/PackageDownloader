using PackageDownloader.Core.Services.Abstractions;
using PackageDownloader.Infrastructure.Resources;
using PackageDownloader.Infrastructure.Services.Abstractions;

namespace PackageDownloader.Infrastructure.Services.Implementations.PackageDownloader;

public static class DotnetFrameworks
{
    public const string NetStandart20 = "netstandard2.0";
    public const string NetStandart21 = "netstandard2.1";
    public const string Net6 = "net6.0";
    public const string Net7 = "net7.0";
    public const string Net8 = "net8.0";
}

/// <summary>
/// Represents a service for downloading nuget packages.
/// </summary>
public class NugetPackageDownloaderService : CliPackageDownloader
{
    private readonly IFileSystemService _fileSystemService;

    public NugetPackageDownloaderService(IFileSystemService fileSystemService, IShellCommandService shellCommandService, IArchiveService archiveService, IPackagesDirectoryCreator packagesDirectoryCreator) :
        base(packagesDirectoryCreator, shellCommandService, archiveService)
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

    protected override string DownloadPackageWithVersionCommandTemplate => "dotnet add package {0} --version {1} --package-directory {2}";

    private static string GetAvailableFrameworkVersion(string? currentVersion)
    {
        string[] availableFrameworks = [DotnetFrameworks.NetStandart20, DotnetFrameworks.NetStandart21,
                                                    DotnetFrameworks.Net6, DotnetFrameworks.Net7, DotnetFrameworks.Net8];

        string defaultFrameworkVersion = DotnetFrameworks.NetStandart20;

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
