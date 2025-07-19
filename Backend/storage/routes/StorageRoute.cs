using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class StorageController : ControllerBase
{
    [HttpGet("session/create/{saveId}")]
    public void CreateSession(uint saveId)
    {
        StorageService.CreateSession(saveId);
    }

    [HttpGet("box")]
    public ActionResult<List<BoxDTO>> GetAllBoxes()
    {
        var list = StorageService.GetAllBoxes();

        return list;
    }

    [HttpGet("pkm")]
    public ActionResult<List<PkmDTO>> GetPkms()
    {
        var list = StorageService.GetPkms();

        return list;
    }

    [HttpGet("pkm/{pkmId}/pkm-version")]
    public ActionResult<List<PkmVersionDTO>> GetPkmVersions(uint pkmId)
    {
        var list = StorageService.GetPkmVersions(pkmId);

        return list;
    }

    [HttpGet("save/pkm")]
    public ActionResult<List<PkmSaveDTO>> GetSaveBox()
    {
        var savePkms = StorageService.GetSavePkms();

        return savePkms;
    }

    [HttpPut("pkm")]
    public ActionResult<PkmDTO> UpdatePkm(PkmDTO pkm)
    {
        var value = StorageService.UpdatePkm(pkm);

        return value;
    }

    [HttpPut("move/save-storage")]
    public void MovePkmFromSaveToStorage(long savePkmId, uint storageBoxId, uint storageSlot)
    {
        StorageService.MovePkmFromSaveToStorage(savePkmId, storageBoxId, storageSlot);
    }

    [HttpPut("move/storage-save")]
    public void MovePkmFromStorageToSave(long pkmVersionId, int saveBoxId, int saveSlot)
    {
        StorageService.MovePkmFromStorageToSave(pkmVersionId, saveBoxId, saveSlot);
    }
}
