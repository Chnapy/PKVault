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

    [HttpGet("gh-proxy/{*path}")]
    public async Task RawGithubProxy(string path)
    {
        var url = StaticDataService.GetGHUrl(path);
        // Console.WriteLine($"\n\nRaw github proxy, url={url}\n\n");

        using var httpClient = new HttpClient();
        using var remoteResponse = await httpClient.GetAsync(url, HttpCompletionOption.ResponseHeadersRead);

        Response.StatusCode = (int)remoteResponse.StatusCode;

        Response.Headers.Remove("transfer-encoding"); // avoid stream conflicts
        Response.Headers.ContentType = remoteResponse.Content.Headers.ContentType?.ToString();
        Response.Headers.ContentLength = remoteResponse.Content.Headers.ContentLength;
        Response.Headers.Pragma = "cache";
        Response.Headers.CacheControl = "public, max-age=31536000"; // 1y
        Response.Headers.Expires = DateTime.UtcNow.AddYears(1).ToString("R");

        using var responseStream = await remoteResponse.Content.ReadAsStreamAsync();
        await responseStream.CopyToAsync(Response.Body);
    }
}
