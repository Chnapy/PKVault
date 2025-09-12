using Microsoft.AspNetCore.Mvc;

namespace PKVault.Backend.storage.routes;

[ApiController]
[Route("api/[controller]")]
public class StaticDataController : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<StaticDataDTO>> Get()
    {
        var versions = await StaticDataService.GetStaticVersions();
        var species = await StaticDataService.GetStaticSpecies();
        var stats = await StaticDataService.GetStaticStats();
        var types = StaticDataService.GetStaticTypes();
        var moves = await StaticDataService.GetStaticMoves();
        var natures = await StaticDataService.GetStaticNatures();
        var abilities = StaticDataService.GetStaticAbilities();
        var items = await StaticDataService.GetStaticItems();

        return new StaticDataDTO
        {
            Versions = versions,
            Species = species,
            Stats = stats,
            Types = types,
            Moves = moves,
            Natures = natures,
            Abilities = abilities,
            Items = items,
        };
    }
}
