using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

[ApiController]
[Route("api/[controller]")]
public class SaveInfosController : ControllerBase
{
    [HttpGet()]
    public ActionResult<Dictionary<uint, SaveInfosDTO>> GetAll()
    {
        return LocalSaveService.GetAllSaveInfos();
    }

    [HttpPost()]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult?> Upload([BindRequired] IFormFile saveFile)
    {
        if (saveFile == null || saveFile.Length == 0)
            return BadRequest("No file received");

        byte[] fileBytes;
        using (var ms = new MemoryStream())
        {
            await saveFile.CopyToAsync(ms);
            fileBytes = ms.ToArray();
        }

        await LocalSaveService.UploadNewSave(fileBytes, saveFile.FileName);

        return null;
    }

    [HttpDelete()]
    public async void Delete([BindRequired] uint saveId)
    {
        await LocalSaveService.DeleteSaveFromId(saveId);
    }
}
