using Microsoft.AspNetCore.Mvc;

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
    public async Task<ActionResult<SaveInfosDTO>> Upload()
    {
        var form = await HttpContext.Request.ReadFormAsync();
        var file = form.Files["saveFile"];

        if (file == null || file.Length == 0)
            return BadRequest("No file received");

        byte[] fileBytes;
        using (var ms = new MemoryStream())
        {
            await file.CopyToAsync(ms);
            fileBytes = ms.ToArray();
        }

        var saveInfos = SaveInfosService.UploadNewSave(fileBytes, file.FileName);

        return saveInfos;
    }
}
