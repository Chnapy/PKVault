using Microsoft.AspNetCore.Mvc;

namespace PKVault.Backend.warnings.routes;

[ApiController]
[Route("api/[controller]")]
public class WarningsController(WarningsService warningsService) : ControllerBase
{
    [HttpGet("warnings")]
    public async Task<ActionResult<WarningsDTO>> GetWarnings()
    {
        return await warningsService.GetWarningsDTO();
    }
}
