using Microsoft.AspNetCore.Mvc;

namespace PKVault.Backend.warnings.routes;

[ApiController]
[Route("api/[controller]")]
public class WarningsController : ControllerBase
{
    [HttpGet("warnings")]
    public ActionResult<WarningsDTO> GetWarnings()
    {
        return WarningsService.GetWarningsDTO();
    }
}
