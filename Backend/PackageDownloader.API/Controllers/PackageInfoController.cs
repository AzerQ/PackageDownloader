using Microsoft.AspNetCore.Mvc;
using PackageDownloader.Core.Models;
using PackageDownloader.Core.Services.Abstractions;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace PackageDownloader.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PackageInfoController(Func<PackageType, IPackageSearchService> serviceAccessor) : ControllerBase
    {
        
        [HttpGet("[action]")]
        [Produces("application/json")]
        public async Task<IEnumerable<PackageInfo>> GetSearchResults([FromQuery] PackageType packageType, [FromQuery] string namePart)
        {
            var pacakgeSearchService = serviceAccessor(packageType);
            return await pacakgeSearchService.SearchPackagesByName(namePart);
        }

        [HttpGet("[action]")]
        [Produces("application/json")]
        public async Task<IEnumerable<string>> GetSearchSuggestions([FromQuery] PackageType packageType, [FromQuery] string namePart)
        {
            var packageSearchService = serviceAccessor(packageType);
            return await packageSearchService.GetPackagesNamesSuggestions(namePart);
        }
    }
}
