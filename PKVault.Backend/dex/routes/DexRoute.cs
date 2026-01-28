using Microsoft.AspNetCore.Mvc;

namespace PKVault.Backend.dex.routes;

[ApiController]
[Route("api/[controller]")]
public class DexController(DexService dexService) : ControllerBase
{
    [HttpGet()]
    public async Task<ActionResult<Dictionary<ushort, Dictionary<uint, DexItemDTO>>>> GetAll()
    {
        var record = await dexService.GetDex(null);

        return record;
    }
}
