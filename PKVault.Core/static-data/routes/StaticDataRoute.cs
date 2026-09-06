namespace PKVault.Core.storage.routes;

[Route("api/[controller]")]
public class StaticDataController(StaticDataService staticDataService)
{
    [HttpGet]
    public async Task<StaticDataDTO> Get()
    {
        return await staticDataService.GetStaticDataDTO();
    }

    [HttpGet("spritesheet/{sheetName}")]
    public async Task<CoreFileResponse> GetSpritesheetImg(string sheetName, Guid? buildID)
    {
        var stream = await staticDataService.GetSpritesheetStream(sheetName);

        return new(
            File: new(
                stream,
                ContentType: "image/webp",
                FileName: sheetName
            ),
            Header: new()
            {
                ["Pragma"] = "cache",
                ["CacheControl"] = "public, max-age=31536000",  // 1y
                ["Expires"] = DateTime.UtcNow.AddYears(1).ToString("R"),
            }
        );
    }
}
