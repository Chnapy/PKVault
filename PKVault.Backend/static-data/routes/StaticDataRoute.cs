using Microsoft.AspNetCore.Mvc;

namespace PKVault.Backend.storage.routes;

[ApiController]
[Route("api/[controller]")]
public class StaticDataController : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<StaticDataDTO>> Get()
    {
        return await StaticDataService.PrepareStaticData();
    }

    [HttpGet("spritesheet/{sheetName}")]
    public async Task<IActionResult> GetSpritesheetImg(string sheetName, [FromQuery] Guid buildID)
    {
        using var stream = await SpritesheetFileClient.GetAsyncString(sheetName);

        Response.Headers.Pragma = "cache";
        Response.Headers.CacheControl = "public, max-age=31536000"; // 1y
        Response.Headers.Expires = DateTime.UtcNow.AddYears(1).ToString("R");

        if (stream == null) return NotFound();

        using var ms = new MemoryStream();
        stream.CopyTo(ms);
        var imageData = ms.ToArray();
        return File(imageData, "image/webp");
    }
}
