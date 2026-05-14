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
                                    IPackagesStorageService packagesStorageService,
                                    ILogger<PackagesController> logger) : ControllerBase
    {
        const string UnknownMime = "application/octet-stream";

        public static string ResolveMimeType(string filePath) {
            new FileExtensionContentTypeProvider()
                .TryGetContentType(filePath, out string? contentType);
            return contentType ?? UnknownMime;
        }

        private string ControllerName(string controllerFullName) => controllerFullName.Replace("Controller","");

        [HttpPost("[action]")]
        public string PreparePackagesDownloadLink([FromBody] PackageRequest packageRequest)
        {
            var packageDownloader = serviceAccessor(packageRequest.PackageType);
            string packageFilePath = packageDownloader.DownloadPackagesAsArchive(packageRequest);
            Guid packagesArchiveId = packagesStorageService.CreatePackagesArchiveEntry(packageFilePath, packageRequest, ResolveMimeType).Id;
            
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
            var packagesFileInfo = packagesStorageService.GetPackagesArchiveEntry(packagesArchiveId);
            
            if (packagesFileInfo is null || !System.IO.File.Exists(packagesFileInfo.Path))
                return NotFound();

            logger.LogInformation("packagesFileInfo: @{packagesFileInfo}", new {packagesFileInfo.Path, packagesFileInfo.MimeType, packagesFileInfo.FileName});    

            return PhysicalFile(packagesFileInfo.Path, packagesFileInfo.MimeType, packagesFileInfo.FileName);
        }

        [HttpGet("[action]")]
        [Produces("application/json")]
        public ActionResult<PackagesEntryChunksInfo> GetPackagesChunksInfo([FromQuery] Guid packagesArchiveId, [FromQuery] int chunkSizeInBytes)
        {
            var packagesFileInfo = packagesStorageService.GetPackagesArchiveEntry(packagesArchiveId);
            
            if (packagesFileInfo is null || !System.IO.File.Exists(packagesFileInfo.Path))
                return NotFound();

            return packagesFileInfo.GetChunksInformation(chunkSizeInBytes);
        }

        // Скачать конкретный чанк
        [HttpGet("[action]")]
        [Produces("application/octet-stream")]
        public async Task<IActionResult> GetPackagesFileChunk(Guid packagesArchiveId, [FromQuery] int chunkIndex, [FromQuery] int chunkSizeInBytes)
        {

            var packagesFileInfo = packagesStorageService.GetPackagesArchiveEntry(packagesArchiveId);
            
            if (packagesFileInfo is null || !System.IO.File.Exists(packagesFileInfo.Path))
                return NotFound();

            byte[] chunkData = await packagesFileInfo.ReadChunk(chunkIndex, chunkSizeInBytes);    
            return File(chunkData, "application/octet-stream");
        }

    }
}