using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class StorageController : ControllerBase
{
    // [HttpGet("session/create/{saveId}")]
    // public void CreateSession(uint saveId)
    // {
    //     StorageService.CreateSession(saveId);
    // }

    [HttpGet("main/box")]
    public ActionResult<List<BoxDTO>> GetMainBoxes()
    {
        var list = StorageService.GetMainBoxes();

        return list;
    }

    [HttpGet("main/pkm")]
    public ActionResult<List<PkmDTO>> GetMainPkms()
    {
        var list = StorageService.GetMainPkms();

        return list;
    }

    [HttpGet("main/pkm-version")]
    public ActionResult<List<PkmVersionDTO>> GetMainPkmVersions()
    {
        var list = StorageService.GetMainPkmVersions(null);

        return list;
    }

    [HttpGet("save/{saveId}/box")]
    public ActionResult<List<BoxDTO>> GetSaveBoxes(uint saveId)
    {
        var saveBoxes = StorageService.GetSaveBoxes(saveId);

        return saveBoxes;
    }

    [HttpGet("save/{saveId}/pkm")]
    public ActionResult<List<PkmSaveDTO>> GetSavePkms(uint saveId)
    {
        var savePkms = StorageService.GetSavePkms(saveId);

        return savePkms;
    }

    [HttpPost("save")]
    public void Save()
    {
        StorageService.Save();
    }

    [HttpPut("main/move-pkm")]
    public void MainMovePkm(long pkmId, uint boxId, uint boxSlot)
    {
        StorageService.MainMovePkm(pkmId, boxId, boxSlot);
    }

    [HttpPost("main/create-pkm-version")]
    public void MainCreatePkmVersion(long pkmId, uint generation)
    {
        StorageService.MainCreatePkmVersion(pkmId, generation);
    }

    [HttpPut("save/{saveId}/move-pkm")]
    public void SaveMovePkm(uint saveId, long pkmId, int boxId, int boxSlot)
    {
        StorageService.SaveMovePkm(saveId, pkmId, boxId, boxSlot);
    }

    [HttpPut("save/{saveId}/move-pkm-to-storage")]
    public void SaveMovePkmToStorage(uint saveId, long savePkmId, uint storageBoxId, uint storageSlot)
    {
        StorageService.SaveMovePkmToStorage(saveId, savePkmId, storageBoxId, storageSlot);
    }

    [HttpPut("save/{saveId}/move-pkm-from-storage")]
    public void SaveMovePkmFromStorage(uint saveId, long pkmVersionId, int saveBoxId, int saveSlot)
    {
        StorageService.SaveMovePkmFromStorage(saveId, pkmVersionId, saveBoxId, saveSlot);
    }
}
