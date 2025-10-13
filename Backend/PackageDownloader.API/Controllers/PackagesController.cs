using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using PackageDownloader.Core.Models;
using PackageDownloader.Core.Services.Abstractions;


// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace PackageDownloader.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PackagesController(Func<PackageType, IPackageDownloadService> serviceAccessor, 
                                    IPackagesStorageService packagesStorageService) : ControllerBase
    {
        const string UnknownMime = "application/octet-stream";

        private string ControllerName(string controllerFullName) => controllerFullName.Replace("Controller","");

        [HttpPost("[action]")]
        public string PreparePackagesDownloadLink([FromBody] PackageRequest packageRequest)
        {
            var packageDownloader = serviceAccessor(packageRequest.PackageType);
            string packageFilePath = packageDownloader.DownloadPackagesAsArchive(packageRequest);
            Guid packagesArchiveId = packagesStorageService.SetPackagesArchivePath(packageFilePath);
            
            bool isDevMode = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";

            string packagesDownloadUrl = Url.Action(nameof(GetPackagesAsArchive), 
                ControllerName(nameof(PackagesController)), new { packagesArchiveId }, isDevMode ? Request.Scheme : null) ?? 
                                         throw new InvalidOperationException("Can't resolve package download link");
            
            return packagesDownloadUrl;
        }

        [HttpGet("[action]")]
        [Produces("application/zip")]
        public IActionResult GetPackagesAsArchive([FromQuery] Guid packagesArchiveId)
        {
            string? packageFilePath = packagesStorageService.GetPackagesArchivePath(packagesArchiveId);
            
            if (!System.IO.File.Exists(packageFilePath))
                return NotFound();
            
            string fileName = Path.GetFileName(packageFilePath);

            new FileExtensionContentTypeProvider()
                .TryGetContentType(packageFilePath, out string? contentType);

            return PhysicalFile(packageFilePath, contentType ?? UnknownMime, fileName);
        }
    }
}