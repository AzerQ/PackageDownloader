using Microsoft.AspNetCore.Mvc;

namespace PackageDownloader.API.Controllers;


[Route("api/[controller]")]
[ApiController]
public class HeartbeatController : ControllerBase
{
    
    [HttpGet("[action]")]
    public string HeartbeatExists() => "OK";
    
}