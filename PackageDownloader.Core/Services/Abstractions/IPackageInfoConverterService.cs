using PackageDownloader.Core.Models;

namespace PackageDownloader.Core.Services.Abstractions
{
    public interface IPackageInfoConverterService
    {
        IEnumerable<PackageInfo> ConvertNugetJsonStringToPackageInfo(string json);

        IEnumerable<PackageInfo> ConvertNpmJsonStringToPackageInfo(string json);

    }
}
