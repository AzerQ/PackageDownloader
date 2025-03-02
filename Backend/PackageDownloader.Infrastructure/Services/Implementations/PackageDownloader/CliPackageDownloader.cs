using System.Text;
using PackageDownloader.Core.Models;
using PackageDownloader.Core.Services.Abstractions;
using PackageDownloader.Infrastructure.Models;
using PackageDownloader.Infrastructure.Services.Abstractions;

namespace PackageDownloader.Infrastructure.Services.Implementations.PackageDownloader
{
    public delegate void PackageAction(PackageRequest packageRequest, string packagesOutputFolder);

    public abstract class CliPackageDownloader(IPackagesDirectoryCreator packagesDirectoryCreator, IShellCommandService shellCommandService, IArchiveService archiveService) : IPackageDownloadService
    {
        protected abstract string DownloadPackageCommandTemplate { get; }
        protected abstract string DownloadPackageWithVersionCommandTemplate { get; }

        public event PackageAction? BeforePackagesDownloadStarted;

        public event PackageAction? AfterPackagesDownloadFinished;

        protected string GetPackageDownloadCommand(PackageDetails packageDetails, string folderPath)
        {
            return packageDetails.PackageVersion is not null ?
                string.Format(DownloadPackageWithVersionCommandTemplate, packageDetails.PackageID, packageDetails.PackageVersion, folderPath) :
                string.Format(DownloadPackageCommandTemplate, packageDetails.PackageID, folderPath);
        }
        
        private void ExecutePackagesDownloadCommands(PackageRequest packageRequest, string folderPath)
        {
            foreach (var packageDetail in packageRequest.PackagesDetails)
            {
                var downloadPackageCommand = new CommandInput
                {
                    CommandName = GetPackageDownloadCommand(packageDetail, folderPath),
                    WorkDirectory = folderPath
                };

                var downloadPackageResult = shellCommandService.ExecuteOrThrow(downloadPackageCommand);
            }
        }

        public string DownloadPackagesAsArchive(PackageRequest packageRequest)
        {
            (string tempFolderPath, string packagesDirectory) = packagesDirectoryCreator.CreatePackagesTempDirectory(packageRequest);

            BeforePackagesDownloadStarted?.Invoke(packageRequest, packagesDirectory);

            ExecutePackagesDownloadCommands(packageRequest, packagesDirectory);

            AfterPackagesDownloadFinished?.Invoke(packageRequest, packagesDirectory);

            string archivePath = archiveService.ArchiveFolder(packagesDirectory, tempFolderPath);
            return archivePath;
        }
    }
}
