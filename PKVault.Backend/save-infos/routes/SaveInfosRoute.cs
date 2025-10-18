using System.Net.Mime;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace PKVault.Backend.saveinfos.routes;

[ApiController]
[Route("api/[controller]")]
public class SaveInfosController : ControllerBase
{
    [HttpGet()]
    public async Task<ActionResult<Dictionary<uint, SaveInfosDTO>>> GetAll()
    {
        await Program.WaitForSetup();

        return LocalSaveService.GetAllSaveInfos();
    }

    [HttpPut()]
    public async Task<ActionResult<DataDTO>> Scan()
    {
        if (!StorageService.HasEmptyActionList())
        {
            throw new InvalidOperationException($"Empty action list is required");
        }

        await LocalSaveService.ReadLocalSaves();

        await StorageService.ResetDataLoader(true);

        return await DataDTO.FromDataUpdateFlags(new()
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

    [HttpDelete()]
    public async Task<ActionResult<DataDTO>> Delete([BindRequired] uint saveId)
    {
        await Program.WaitForSetup();

        var flags = await LocalSaveService.DeleteSaveFromId(saveId);
        return await DataDTO.FromDataUpdateFlags(flags);
    }

    [HttpGet("{saveId}/download")]
    public ActionResult Download(uint saveId)
    {
        if (!StorageService.HasEmptyActionList())
        {
            throw new InvalidOperationException($"Empty action list is required");
        }

        var save = LocalSaveService.SaveById[saveId].Clone();
        // var path = LocalSaveService.SaveByPath.Keys.ToList().Find(key => LocalSaveService.SaveByPath[key].ID32 == saveId);

        var filename = save.Metadata.FileName;

        byte[] fileBytes = save.Write().ToArray();
        return File(fileBytes, MediaTypeNames.Application.Octet, filename);
    }
}
