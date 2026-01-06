using Microsoft.AspNetCore.Mvc;

namespace PKVault.Backend.dex.routes;

[ApiController]
[Route("api/[controller]")]
public class DexController(StorageService storageService, DexService dexService) : ControllerBase
{
    [HttpGet()]
    public async Task<ActionResult<Dictionary<ushort, Dictionary<uint, DexItemDTO>>>> GetAll()
    {
        await storageService.WaitForSetup();

        var record = await dexService.GetDex();

        return record;
    }
}
