using PKHeX.Core;

namespace PKVault.Core.dex.routes;

[Route("api/[controller]")]
public class DexController(DexService dexService, DexDataService dexDataService)
{
    [HttpGet()]
    public async Task<Dictionary<ushort, Dictionary<uint, DexItemDTO>>> GetAll()
    {
        var record = await dexService.GetDex(null);

        return record;
    }

    [HttpGet("moves")]
    public async Task<DexMoveDTO> GetMoves(
        EntityContext context, ushort species, byte form
    )
    {
        return dexDataService.GetMoves(context, species, form);
    }

    [HttpGet("evolves")]
    public async Task<StaticEvolvesRichData> GetEvolves(ushort species)
    {
        return await dexDataService.GetEvolutionChain(species);
    }

    [HttpGet("locations")]
    public async Task<DexLocationDTO> GetLocations(GameVersion version, ushort species)
    {
        return await dexDataService.GetLocations(version, species);
    }
}
