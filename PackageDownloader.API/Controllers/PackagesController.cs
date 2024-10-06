using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using PackageDownloader.Core.Models;
using PackageDownloader.Core.Services.Abstractions;


// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace PackageDownloader.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PackagesController(Func<PackageType, IPackageDownloadService> serviceAccessor) : ControllerBase
    {
        const string UnknownMIME = "application/octet-stream";


        // GET: api/<PackagesController>
        [HttpGet]
        public IActionResult Get([FromQuery] PackageRequest packageRequest)
        {
            var packageDownloader = serviceAccessor(packageRequest.PackageType);
            string packageFilePath = packageDownloader.DownloadPackagesAsArchive(packageRequest);

            string fileName = Path.GetFileName(packageFilePath);

            new FileExtensionContentTypeProvider()
                .TryGetContentType(packageFilePath, out string? contentType);

            return PhysicalFile(packageFilePath, contentType ?? UnknownMIME, fileName);
        }
    }
}
