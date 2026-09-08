
namespace PKVault.Core.storage.routes;

[Route("api/[controller]")]
public class StaticDataController(StaticDataService staticDataService)
{
    [HttpGet]
    public async Task<StaticDataDTO> Get()
    {
        return await staticDataService.GetStaticDataDTO();
    }
}
