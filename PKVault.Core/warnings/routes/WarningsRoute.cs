namespace PKVault.Core.warnings.routes;

[Route("api/[controller]")]
public class WarningsController(WarningsService warningsService)
{
    [HttpGet("warnings")]
    public async Task<WarningsDTO> GetWarnings()
    {
        return await warningsService.GetWarningsDTO();
    }
}
