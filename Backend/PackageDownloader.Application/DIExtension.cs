using Microsoft.Extensions.DependencyInjection;
using PackageDownloader.Core.Models;
using PackageDownloader.Core.Services.Abstractions;
using PackageDownloader.Infrastructure.Services.Abstractions;
using PackageDownloader.Infrastructure.Services.Implementations;

namespace PackageDownloader.Application
{
    public static class DIExtension
    {
        private static IPackageDownloadService PackageDownloaderFactory(IServiceProvider serviceProvider,
                                                                   PackageType packageType)
        {
            return packageType switch
            {
                PackageType.Npm => serviceProvider.GetRequiredService<NpmPackageDownloaderService>(),
                PackageType.Nuget => serviceProvider.GetRequiredService<NugetPackageDownloaderService>(),
                _ => throw new InvalidOperationException()
            };
        }

        private static IPackageSearchService PacakgeSearchFactory(IServiceProvider serviceProvider,
                                                             PackageType packageType)
        {
            return packageType switch
            {
                PackageType.Npm => serviceProvider.GetRequiredService<NpmPackageSearchService>(),
                PackageType.Nuget => serviceProvider.GetRequiredService<NugetPackageSearchService>(),
                _ => throw new InvalidOperationException()
            };
        }

        public static void AddPackageDownloaderServices(this IServiceCollection services)
        {
            // Base services

            services.AddTransient<IArchiveService, ArchiveService>();
            services.AddTransient<IFileSystemService, FileSystemService>();
            services.AddTransient<IShellCommandService, ShellCommandService>();
            services.AddTransient<IPackageInfoConverterService, PackageInfoConverterService>();

            // Package download services

            services.AddTransient<NugetPackageDownloaderService>();
            services.AddTransient<NpmPackageDownloaderService>();
            services.AddTransient<Func<PackageType, IPackageDownloadService>>(serviceProvider => packageType =>
            {
                return PackageDownloaderFactory(serviceProvider, packageType);
            });

            // Pacakge search services

            services.AddTransient<NugetPackageSearchService>();
            services.AddTransient<NpmPackageSearchService>();

            services.AddTransient<Func<PackageType, IPackageSearchService>>(serviceProvider => packageType =>
            {
                return PacakgeSearchFactory(serviceProvider, packageType);
            });
        }
    }
}
