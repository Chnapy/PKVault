using System.Net.Mime;
using Microsoft.AspNetCore.Mvc;

namespace PKVault.Backend.saveinfos.routes;

[ApiController]
[Route("api/[controller]")]
public class SaveInfosController(
    ISettingsService settingsService,
    DataService dataService, ISavesLoadersService savesLoadersService, ISessionService sessionService
) : ControllerBase
{
    [HttpGet()]
    public ActionResult<IDictionary<uint, SaveInfosDTO>> GetAll()
    {
        var saveInfos = savesLoadersService.GetAllSaveInfos();
        return saveInfos.ToDictionary();
    }

    [HttpPut()]
    public async Task<ActionResult<DataDTO>> Scan()
    {
        if (!sessionService.HasEmptyActionList())
        {
            throw new InvalidOperationException($"Empty action list is required");
        }

        DataUpdateFlags flags = new();

        settingsService.RefreshSettings(flags);

        savesLoadersService.Clear();
        await sessionService.StartNewSession(checkInitialActions: true, flags);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpGet("{saveId}/download")]
    public async Task<ActionResult> Download(uint saveId)
    {
        if (!sessionService.HasEmptyActionList())
        {
            throw new InvalidOperationException($"Empty action list is required");
        }

        var saveById = savesLoadersService.GetSaveById();

        var save = saveById[saveId].Clone();

        var filename = save.Metadata.FileName;

        byte[] fileBytes = save.GetSaveFileData();
        return File(fileBytes, MediaTypeNames.Application.Octet, filename);
    }
}
