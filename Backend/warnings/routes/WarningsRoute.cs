using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class WarningsController : ControllerBase
{
    [HttpGet("warnings")]
    public ActionResult<WarningsDTO> GetWarnings()
    {
        return WarningsService.GetWarningsDTO();
    }
}
