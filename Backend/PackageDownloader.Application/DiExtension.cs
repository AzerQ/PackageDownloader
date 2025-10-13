using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PackageDownloader.AI;
using PackageDownloader.Core.Models;
using PackageDownloader.Core.Services.Abstractions;
using PackageDownloader.Infrastructure.Services.Abstractions;
using PackageDownloader.Infrastructure.Services.Implementations;
using PackageDownloader.Infrastructure.Services.Implementations.Other;
using PackageDownloader.Infrastructure.Services.Implementations.PackageDownloader;
using PackageDownloader.Infrastructure.Services.Implementations.PackageSearch;
using PackageDownloader.Infrastructure.Services.Implementations.Recommendations;
using PackageDownloader.Infrastructure.Services.Implementations.WebSearch;
using PackageDownloader.Persistence.Services;

namespace PackageDownloader.Application
{
    public static class DiExtension
    {
        private static IPackageDownloadService PackageDownloaderFactory(IServiceProvider serviceProvider,
                                                                   PackageType packageType)
        {
            return packageType switch
            {
                PackageType.Npm => serviceProvider.GetRequiredService<NpmPackageDownloaderService>(),
                PackageType.Nuget => serviceProvider.GetRequiredService<NugetPackageDownloaderService>(),
                PackageType.VsCode => serviceProvider.GetRequiredService<HttpPackageDownloaderService>(),
                _ => throw new InvalidOperationException()
            };
        }

        private static IPackageSearchService PackageSearchFactory(IServiceProvider serviceProvider,
                                                             PackageType packageType)
        {
            return packageType switch
            {
                PackageType.Npm => serviceProvider.GetRequiredService<NpmPackageSearchService>(),
                PackageType.Nuget => serviceProvider.GetRequiredService<NugetPackageSearchService>(),
                PackageType.VsCode => serviceProvider.GetRequiredService<VsCodePackageSearchService>(),
                _ => throw new InvalidOperationException()
            };
        }

        private static Uri PackageDownloadUriResolver(PackageType packageType, PackageDetails packageDetails)
        {
            var packageIdParts = packageDetails.PackageID.Split("/");
            (string publisher, string extensionName) = (packageIdParts[0], packageIdParts[1]);
                
            return packageType switch
            {
                PackageType.VsCode => new Uri($"https://marketplace.visualstudio.com/_apis/public/gallery/publishers/{publisher}/vsextensions/{extensionName}/{packageDetails.PackageVersion}/vspackage"),
                _ => throw new NotImplementedException(nameof(packageType))
            };
        }
        
        private static string RemoveInvalidChars(string filename)
        {
            return string.Concat(filename.Split(Path.GetInvalidFileNameChars()));
        }
        
        private static string PackageFileNameResolver(PackageType packageType, PackageDetails packageDetails)
        {
            return packageType switch
            {
                PackageType.VsCode => RemoveInvalidChars($"{packageDetails.PackageID}_{packageDetails.PackageVersion}.vsix"),
                _ => throw new NotImplementedException(nameof(packageType))
            };
        }
        

        public static void AddPackageDownloaderServices(this IServiceCollection services)
        {
            // Base services

            
            services.AddTransient<IJsonPathExecutor, JsonPathExecutor>();
            services.AddTransient<IArchiveService, ArchiveService>();
            services.AddTransient<IFileSystemService, FileSystemService>();
            services.AddTransient<IPackagesDirectoryCreator, PackagesDirectoryCreator>();
            services.AddTransient<IShellCommandService, ShellCommandService>();
            services.AddTransient<IPackageInfoConverterService, PackageInfoConverterService>();

            // Package download services

            services.AddTransient<NugetPackageDownloaderService>();
            services.AddTransient<NpmPackageDownloaderService>();

            services.AddTransient<Func<PackageType, PackageDetails, Uri>>(_ => PackageDownloadUriResolver);
            services.AddTransient<Func<PackageType, PackageDetails, string>>(_ => PackageFileNameResolver);
            services.AddTransient<HttpPackageDownloaderService>();
            
            services.AddTransient<Func<PackageType, IPackageDownloadService>>(serviceProvider => packageType => PackageDownloaderFactory(serviceProvider, packageType));

            // Pacakge search services

            services.AddTransient<SearchResultCleaner>();
            services.AddTransient<IGlobalWebSearchService, GoogleWebSearchService>();
            
            services.AddTransient<NugetPackageSearchService>();
            services.AddTransient<NpmPackageSearchService>();
            services.AddTransient<VsCodePackageSearchService>();

            services.AddTransient<Func<PackageType, IPackageSearchService>>(serviceProvider => packageType => PackageSearchFactory(serviceProvider, packageType));

            services.AddTransient<OpenRouterClient>(serviceProvider =>
            {
                var configuration = serviceProvider.GetService<IConfiguration>();
                string? apiKey = configuration?["AI:API_KEY"];
                
                if (configuration == null || apiKey == null)
                    throw new NullReferenceException("Can't load API key for AI provider ");
                
                string apiUrl = configuration["AI:API_URL"] ?? "https://openrouter.ai/api/v1/";
                string aiModel = configuration["AI:MODEL"] ?? "deepseek/deepseek-chat-v3.1:free";

                return new OpenRouterClient(apiUrl, apiKey, aiModel);
            });

            services.AddTransient<IPackageRecommendationService, PackageRecommendationService>();
            services.AddTransient<IPackagesStorageService, CachedPackagesStorageService>();
        }
    }
}
