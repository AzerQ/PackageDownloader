using PackageDownloader.Core.Services.Abstractions;

namespace PackageDownloader.Core.Services.Implementations;

public class NugetPackageDownloaderService : IPackageDownloaderService
{
    private readonly IShellCommandService _shellCommandService;

    public NugetPackageDownloaderService(IShellCommandService shellCommandService)
    {
        _shellCommandService = shellCommandService;
    }
    public string DownloadPackage(string packageId)
    {
        throw new NotImplementedException();
    }
}
