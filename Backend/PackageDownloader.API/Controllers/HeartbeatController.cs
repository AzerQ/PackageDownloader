using Microsoft.AspNetCore.Mvc;

namespace PackageDownloader.API.Controllers;

public record ApiHeartbeat (bool IsAlive);

[Route("api/[controller]")]
[ApiController]
public class HeartbeatController : ControllerBase
{
    
    [HttpGet("[action]")]
    public ApiHeartbeat HeartbeatExists() => new ApiHeartbeat(true);
    
}