using Microsoft.AspNetCore.Mvc;

namespace PKVault.Backend.dex.routes;

[ApiController]
[Route("api/[controller]")]
public class DexController : ControllerBase
{
    [HttpGet()]
    public async Task<ActionResult<Dictionary<int, Dictionary<uint, DexItemDTO>>>> GetAll()
    {
        var record = await DexService.GetDex();

        return record;
    }
}
