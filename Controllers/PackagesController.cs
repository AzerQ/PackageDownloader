using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using PackageDownloader.Core.Models;
using PackageDownloader.PackageDownloader.Core.Services.Abstractions;
using System.Text;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace PackageDownloader.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PackagesController(Func<PackageType, PackageDownloaderBase> serviceAccessor) : ControllerBase
    {
        const string UnknownMIME = "application/octet-stream";

        private string GenerateFileName(PackageRequest packageRequest, string extension)
        {
            var fileNameBuilder = new StringBuilder()
                                    .Append(packageRequest.PackageID)
                                    .Append("_")
                                    .Append(packageRequest.PackageVersion ?? "last")
                                    .Append("_")
                                    .Append(packageRequest.SdkVersion ?? "default")
                                    .Append("_")
                                    .Append(extension);

            return fileNameBuilder.ToString();
        }

        // GET: api/<PackagesController>
        [HttpGet]
        public IActionResult Get([FromQuery] PackageRequest packageRequest)
        {
            var packageDownloader = serviceAccessor(packageRequest.PackageType);
            string packageFilePath = packageDownloader.DownloadPacakgeAsArchive(packageRequest);

            string fileName = GenerateFileName(packageRequest, Path.GetExtension(packageFilePath));

            new FileExtensionContentTypeProvider()
                .TryGetContentType(packageFilePath, out string? contentType);

            return PhysicalFile(packageFilePath, contentType ?? UnknownMIME, fileName);
        }
    }
}
