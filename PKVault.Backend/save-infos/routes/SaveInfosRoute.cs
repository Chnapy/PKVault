using System.Net.Mime;
using Microsoft.AspNetCore.Mvc;

namespace PKVault.Backend.saveinfos.routes;

[ApiController]
[Route("api/[controller]")]
public class SaveInfosController(
    DataService dataService, ISaveService saveService, ISessionService sessionService
) : ControllerBase
{
    [HttpGet()]
    public async Task<ActionResult<Dictionary<uint, SaveInfosDTO>>> GetAll()
    {
        return await saveService.GetAllSaveInfos();
    }

    [HttpPut()]
    public async Task<ActionResult<DataDTO>> Scan()
    {
        if (!sessionService.HasEmptyActionList())
        {
            throw new InvalidOperationException($"Empty action list is required");
        }

        saveService.InvalidateSaves();
        var flags = await sessionService.StartNewSession(checkInitialActions: true);

        flags ??= new();

        flags.Saves.All = true;
        flags.Dex.All = true;
        flags.SaveInfos = true;
        flags.Warnings = true;

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpGet("{saveId}/download")]
    public async Task<ActionResult> Download(uint saveId)
    {
        if (!sessionService.HasEmptyActionList())
        {
            throw new InvalidOperationException($"Empty action list is required");
        }

        var saveById = await saveService.GetSaveById();

        var save = saveById[saveId].Clone();

        var filename = save.Metadata.FileName;

        byte[] fileBytes = save.GetSaveFileData();
        return File(fileBytes, MediaTypeNames.Application.Octet, filename);
    }
}
