using System.Net.Mime;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace PKVault.Backend.saveinfos.routes;

[ApiController]
[Route("api/[controller]")]
public class SaveInfosController(DataService dataService, LocalSaveService saveService, StorageService storageService) : ControllerBase
{
    [HttpGet()]
    public async Task<ActionResult<Dictionary<uint, SaveInfosDTO>>> GetAll()
    {
        await storageService.WaitForSetup();

        return saveService.GetAllSaveInfos();
    }

    [HttpPut()]
    public async Task<ActionResult<DataDTO>> Scan()
    {
        if (!storageService.HasEmptyActionList())
        {
            throw new InvalidOperationException($"Empty action list is required");
        }

        saveService.ReadLocalSaves();

        await storageService.ResetDataLoader(true);

        return await dataService.CreateDataFromUpdateFlags(new()
        {
            MainPkmVersions = true,
            Saves = [
                new (){
                    SaveId = 0
                }
            ],
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
    public ActionResult Download(uint saveId)
    {
        if (!storageService.HasEmptyActionList())
        {
            throw new InvalidOperationException($"Empty action list is required");
        }

        var save = saveService.SaveById[saveId].Clone();
        // var path = LocalSaveService.SaveByPath.Keys.ToList().Find(key => LocalSaveService.SaveByPath[key].ID32 == saveId);

        var filename = save.Metadata.FileName;

        byte[] fileBytes = save.Write().ToArray();
        return File(fileBytes, MediaTypeNames.Application.Octet, filename);
    }
}
