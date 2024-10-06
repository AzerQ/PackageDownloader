using Microsoft.AspNetCore.Mvc;
using PackageDownloader.Core.Models;
using PackageDownloader.Core.Services.Abstractions;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace PackageDownloader.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PackageSearchController(Func<PackageType, IPackageSearchService> serviceAccessor) : ControllerBase
    {

        
        [HttpGet("[action]")]
        public async Task<IEnumerable<PackageInfo>> GetSearchResults([FromQuery] PackageType packageType, [FromQuery] string namePart)
        {
            var pacakgeSearchService = serviceAccessor(packageType);
            return await pacakgeSearchService.SearchPacakgesByName(namePart);
        }
    }
}
