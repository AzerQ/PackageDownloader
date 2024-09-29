using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using PackageDownloader.Core.Models;
using PackageDownloader.Core.Services.Abstractions;
using PackageDownloader.Core.Services.Implementations;
using PackageDownloader.PackageDownloader.Core.Services.Abstractions;

namespace PackageDownloader
{
    public class Program
    {

        private static PackageDownloaderBase PacakgeDownloaderFactory(IServiceProvider serviceProvider,
                                                                     PackageType packageType)
        {
            return packageType switch
            {
                PackageType.Npm => serviceProvider.GetRequiredService<NpmPackageDownloaderService>(),
                PackageType.Nuget => serviceProvider.GetRequiredService<NugetPackageDownloaderService>(),
                _ => throw new InvalidOperationException()
            };
        }

        private static PackageSearchServiceBase PacakgeSearchFactory(IServiceProvider serviceProvider,
                                                             PackageType packageType)
        {
            return packageType switch
            {
                PackageType.Npm => serviceProvider.GetRequiredService<NpmPackageSearchService>(),
                PackageType.Nuget => serviceProvider.GetRequiredService<NugetPackageSearchService>(),
                _ => throw new InvalidOperationException()
            };
        }

        public static void ResolveDependencies(IServiceCollection services)
        {
            // Base services

            services.AddTransient<IArchiveService, ArchiveService>();
            services.AddTransient<IFileSystemService, FileSystemService>();
            services.AddTransient<IShellCommandService, ShellCommandService>();
            services.AddTransient<IPackageInfoConverterService, PackageInfoConverterService>();

            // Package download services

            services.AddTransient<NugetPackageDownloaderService>();
            services.AddTransient<NpmPackageDownloaderService>();
            services.AddTransient<Func<PackageType, PackageDownloaderBase>>(serviceProvider => packageType =>
            {
                return PacakgeDownloaderFactory(serviceProvider, packageType);
            });

            // Pacakge search services

            services.AddTransient<NugetPackageSearchService>();
            services.AddTransient<NpmPackageSearchService>();

            services.AddTransient<Func<PackageType, PackageSearchServiceBase>>(serviceProvider => packageType =>
            {
                return PacakgeSearchFactory(serviceProvider, packageType);
            });
        }

        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            ResolveDependencies(builder.Services);

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseAuthorization();

            app.UseFileServer(new FileServerOptions()
            {
                FileProvider = new PhysicalFileProvider(
                Path.Combine(Directory.GetCurrentDirectory(), "UI")),
                RequestPath = "/UI",
                EnableDefaultFiles = true
            });

            app.MapControllers();

            app.Run();
        }
    }
}
