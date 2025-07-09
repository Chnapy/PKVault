using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class DexController : ControllerBase
{
    [HttpGet()]
    public ActionResult<Dictionary<int, Dictionary<uint, DexItemDTO>>> GetAll()
    {
        var record = DexService.GetPersistedDex();

        return record;
    }
}
