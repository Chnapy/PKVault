using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using PKHeX.Core;

namespace PKVault.Backend.dex.routes;

[ApiController]
[Route("api/[controller]")]
public class DexController(DexService dexService, DexDataService dexDataService) : ControllerBase
{
    [HttpGet()]
    public async Task<ActionResult<Dictionary<ushort, Dictionary<uint, DexItemDTO>>>> GetAll()
    {
        var record = await dexService.GetDex(null);

        return record;
    }

    [HttpGet("moves")]
    public async Task<ActionResult<DexMoveDTO>> GetMoves(
        [BindRequired] EntityContext context, [BindRequired] ushort species, [BindRequired] byte form
    )
    {
        return dexDataService.GetMoves(context, species, form);
    }

    [HttpGet("evolves")]
    public async Task<ActionResult<StaticEvolvesRichData>> GetEvolves([BindRequired] ushort species)
    {
        return await dexDataService.GetEvolutionChain(species);
    }
}
