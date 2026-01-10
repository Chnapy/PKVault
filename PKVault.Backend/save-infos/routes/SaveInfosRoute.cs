using System.Net.Mime;
using Microsoft.AspNetCore.Mvc;

namespace PKVault.Backend.saveinfos.routes;

[ApiController]
[Route("api/[controller]")]
public class SaveInfosController(DataService dataService, SaveService saveService, LoadersService loadersService) : ControllerBase
{
    [HttpGet()]
    public async Task<ActionResult<Dictionary<uint, SaveInfosDTO>>> GetAll()
    {
        return await saveService.GetAllSaveInfos();
    }

    [HttpPut()]
    public async Task<ActionResult<DataDTO>> Scan()
    {
        if (!loadersService.HasEmptyActionList())
        {
            throw new InvalidOperationException($"Empty action list is required");
        }

        saveService.InvalidateSaves();
        loadersService.InvalidateLoaders((maintainData: false, checkSaves: true));

        return await dataService.CreateDataFromUpdateFlags(new()
        {
            Saves = new() { All = true },
            Dex = true,
            SaveInfos = true,
            Warnings = true,
        });
    }

    // [HttpPost()]
    // [Consumes("multipart/form-data")]
    // public async Task<ActionResult<DataDTO>> Upload([BindRequired] IFormFile saveFile)
    // {
    //     if (saveFile == null || saveFile.Length == 0)
    //         return BadRequest("No file received");

    //     byte[] fileBytes;
    //     using (var ms = new MemoryStream())
    //     {
    //         await saveFile.CopyToAsync(ms);
    //         fileBytes = ms.ToArray();
    //     }

    //     var flags = await LocalSaveService.UploadNewSave(fileBytes, saveFile.FileName);

    //     return await DataDTO.FromDataUpdateFlags(flags);
    // }

    [HttpGet("{saveId}/download")]
    public async Task<ActionResult> Download(uint saveId)
    {
        if (!loadersService.HasEmptyActionList())
        {
            throw new InvalidOperationException($"Empty action list is required");
        }

        var saveById = await saveService.GetSaveById();

        var save = saveById[saveId].Clone();
        // var path = LocalSaveService.SaveByPath.Keys.ToList().Find(key => LocalSaveService.SaveByPath[key].ID32 == saveId);

        var filename = save.Metadata.FileName;

        byte[] fileBytes = save.Write().ToArray();
        return File(fileBytes, MediaTypeNames.Application.Octet, filename);
    }
}
