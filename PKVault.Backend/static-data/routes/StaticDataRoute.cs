using System.IO.Compression;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace PKVault.Backend.storage.routes;

[ApiController]
[Route("api/[controller]")]
public class StaticDataController : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<StaticDataDTO>> Get()
    {
        var tmpPath = Path.Combine(StaticDataService.TmpDirectory, "StaticData.json.gz");
        var jsonOptions = new JsonSerializerOptions() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

        if (System.IO.File.Exists(tmpPath))
        {
            try
            {
                using var fileStream = System.IO.File.Open(tmpPath, FileMode.Open);
                using var gzipStream = new GZipStream(fileStream, CompressionMode.Decompress);

                return JsonSerializer.Deserialize<StaticDataDTO>(gzipStream, jsonOptions)!;
            }
            // file is wrong
            catch (JsonException)
            {
                System.IO.File.Delete(tmpPath);
            }
            // file locked by previous request
            catch (IOException)
            {
                Thread.Sleep(100);
                return await Get();
            }
        }

        var time = LogUtil.Time("static-data process");

        var versions = StaticDataService.GetStaticVersions();
        var species = StaticDataService.GetStaticSpecies();
        var stats = StaticDataService.GetStaticStats();
        var types = StaticDataService.GetStaticTypes();
        var moves = StaticDataService.GetStaticMoves();
        var natures = StaticDataService.GetStaticNatures();
        var abilities = StaticDataService.GetStaticAbilities();
        var items = StaticDataService.GetStaticItems();

        var dto = new StaticDataDTO
        {
            Versions = await versions,
            Species = await species,
            Stats = await stats,
            Types = types,
            Moves = await moves,
            Natures = await natures,
            Abilities = abilities,
            Items = await items,
            EggSprite = StaticDataService.GetEggSprite()
        };

        time();

        time = LogUtil.Time($"Write cached static-data in {tmpPath}");

        var jsonContent = JsonSerializer.Serialize(dto, jsonOptions);
        using var originalFileStream = new MemoryStream(Encoding.UTF8.GetBytes(jsonContent));
        using var compressedFileStream = System.IO.File.Create(tmpPath);
        using var compressionStream = new GZipStream(compressedFileStream, CompressionLevel.Optimal);

        originalFileStream.CopyTo(compressionStream);

        time();

        return dto;
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
