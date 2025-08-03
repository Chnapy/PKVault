using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

[ApiController]
[Route("api/[controller]")]
public class SaveInfosController : ControllerBase
{
    [HttpGet()]
    public ActionResult<Dictionary<uint, List<SaveInfosDTO>>> GetAll()
    {
        var record = SaveInfosService.GetAllSaveInfos();

        return record;
    }

    [HttpPost()]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<SaveInfosDTO>> Upload([BindRequired] IFormFile saveFile)
    {
        if (saveFile == null || saveFile.Length == 0)
            return BadRequest("No file received");

        byte[] fileBytes;
        using (var ms = new MemoryStream())
        {
            await saveFile.CopyToAsync(ms);
            fileBytes = ms.ToArray();
        }

        var saveInfos = SaveInfosService.UploadNewSave(fileBytes, saveFile.FileName);

        return saveInfos;
    }

    [HttpDelete()]
    public void Delete([BindRequired] uint saveId, [BindRequired] long timestamp)
    {
        SaveInfosService.DeleteSave(saveId, timestamp);
    }
}
