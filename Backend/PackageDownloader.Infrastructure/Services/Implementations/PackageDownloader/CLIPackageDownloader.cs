using System.Text;
using PackageDownloader.Core.Models;
using PackageDownloader.Core.Services.Abstractions;
using PackageDownloader.Infrastructure.Models;
using PackageDownloader.Infrastructure.Services.Abstractions;

namespace PackageDownloader.Infrastructure.Services.Implementations.PackageDownloader
{
    public delegate void PackageAction(PackageRequest packageRequest, string packagesOutputFolder);

    public abstract class CLIPackageDownloader(IFileSystemService fileSystemService, IShellCommandService shellCommandService, IArchiveService archiveService) : IPackageDownloadService
    {
        protected abstract string DownloadPackageCommandTemplate { get; }
        protected abstract string DownloadPackgeWithVersionCommandTemplate { get; }

        public event PackageAction? BeforePackagesDownloadStarted;

        public event PackageAction? AfterPackagesDownloadFinished;

        protected string GetPackageDownloadCommand(PackageDetails packageDetails, string folderPath)
        {
            return packageDetails.PackageVersion is not null ?
                string.Format(DownloadPackgeWithVersionCommandTemplate, packageDetails.PackageID, packageDetails.PackageVersion, folderPath) :
                string.Format(DownloadPackageCommandTemplate, packageDetails.PackageID, folderPath);
        }

        private static string GetPackagesDirectoryName(PackageRequest packageRequest)
        {
            if (packageRequest.PackagesDetails.Count() > 1)
                return "packages_" + Guid.NewGuid().ToString();

            else
            {
                var packageDetails = packageRequest.PackagesDetails.First();
                var fileNameBuilder = new StringBuilder()
                        .Append(packageDetails.PackageID)
                        .Append('_')
                        .Append(packageDetails.PackageVersion ?? "last")
                        .Append('_')
                        .Append(packageRequest.SdkVersion ?? "default");

                return fileNameBuilder.ToString();

            }
        }

        private void ExecutePackagesDownloadCommands(PackageRequest packageRequest, string folderPath)
        {
            foreach (var pacakgeDetail in packageRequest.PackagesDetails)
            {
                var downloadPackageCommand = new CommandInput
                {
                    CommandName = GetPackageDownloadCommand(pacakgeDetail, folderPath),
                    WorkDirectory = folderPath
                };

                var downloadPackageResult = shellCommandService.ExecuteOrThrow(downloadPackageCommand);
            }
        }

        public string DownloadPackagesAsArchive(PackageRequest packageRequest)
        {
            string directoryName = GetPackagesDirectoryName(packageRequest);
            string tempFolderPath = fileSystemService.CreateTempFolder();
            string packageDirectory = fileSystemService.CreateDirectory(tempFolderPath, directoryName);

            BeforePackagesDownloadStarted?.Invoke(packageRequest, packageDirectory);

            ExecutePackagesDownloadCommands(packageRequest, packageDirectory);

            AfterPackagesDownloadFinished?.Invoke(packageRequest, packageDirectory);

            string archivePath = archiveService.ArchiveFolder(packageDirectory, tempFolderPath);
            return archivePath;
        }
    }
}
