using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PackageDownloader.AI;
using PackageDownloader.Core.Models;
using PackageDownloader.Core.Services.Abstractions;
using PackageDownloader.Infrastructure.Services.Abstractions;
using PackageDownloader.Infrastructure.Services.Implementations;
using PackageDownloader.Infrastructure.Services.Implementations.Recommendations;
using PackageDownloader.Persistence.Services;

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

            services.AddTransient<OpenRouterClient>(serviceProvider =>
            {
                var configuration = serviceProvider.GetService<IConfiguration>();
                string? apiKey = configuration?["AI:API_KEY"];
                
                if (configuration == null || apiKey == null)
                    throw new NullReferenceException("Can't load API key for AI provider ");
                
                string apiUrl = configuration["AI:API_URL"] ?? "https://openrouter.ai/api/v1/";
                string aiModel = configuration["AI:MODEL"] ?? "google/gemini-2.0-flash-lite-preview-02-05:free";

                return new OpenRouterClient(apiUrl, apiKey, aiModel);
            });

            services.AddTransient<IPackageRecommendationService, PackageRecommendationService>();
            services.AddTransient<IPackagesStorageService, CachedPackagesStorageService>();
        }
    }
}
