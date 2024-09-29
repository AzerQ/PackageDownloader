using Microsoft.AspNetCore.Mvc;
using PackageDownloader.Core.Models;
using PackageDownloader.Core.Services.Abstractions;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace PackageDownloader.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PackageSearchController(Func<PackageType, PackageSearchServiceBase> serviceAccessor) : ControllerBase
    {

        // GET: api/<PackageSearchController>
        [HttpGet]
        public async Task<IEnumerable<PackageInfo>> Get([FromQuery] PackageRequest packageRequest)
        {
            var pacakgeSearchService = serviceAccessor(packageRequest.PackageType);
            return await pacakgeSearchService.SearchPacakgesByName(packageRequest.PackageID);
        }
    }
}
