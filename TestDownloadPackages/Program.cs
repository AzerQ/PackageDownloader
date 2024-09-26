using PackageDownloader.Core.Models;
using PackageDownloader.Core.Services.Abstractions;
using PackageDownloader.Core.Services.Implementations;
using PackageDownloader.PackageDownloader.Core.Services.Abstractions;

namespace TestDownloadPacakges
{
    internal class Program
    {
        static void Main(string[] args)
        {
            TestDownloadPacakge();
        }

        static void TestDownloadPacakge()
        {
            Console.WriteLine("Choise package type: \n 1) NPM \n 2) nuget");
            int packageTypeInt = int.Parse(Console.ReadLine());

            Console.Write("Enter package name: ");
            string pacakgeName = Console.ReadLine();


            PackageDownloaderBase packageDownloader = (packageTypeInt == 1) ? MakeNpmPackageDownloader() :
                MakeNugetPackageDownloader();

            PackageType packageType = (packageTypeInt == 1) ? PackageType.Npm : PackageType.Nuget;

            string outputFilePath = packageDownloader.DownloadPacakgeAsArchive
                (new PackageRequest {PackageID = pacakgeName, PackageType = packageType});

            Console.WriteLine("Package {0} saved to this path: {1}", pacakgeName, outputFilePath);

            Console.ReadLine();
        }

        static (IFileSystemService fileService, IShellCommandService shellService) GetBaseServices()
        {
            return (new FileSystemService(), new ShellCommandService());
        }

        static PackageDownloaderBase MakeNugetPackageDownloader()
        {
            var baseServices = GetBaseServices();
            return new NugetPackageDownloaderService(baseServices.fileService, baseServices.shellService);
        }

        static PackageDownloaderBase MakeNpmPackageDownloader()
        {
            var baseServices = GetBaseServices();
            return new NpmPackageDownloaderService(baseServices.fileService, baseServices.shellService);
        }
    }
}
