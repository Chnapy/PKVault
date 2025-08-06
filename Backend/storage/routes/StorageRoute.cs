using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

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
    public ActionResult<List<DataActionPayload>> Save()
    {
        StorageService.Save();

        return StorageService.GetActionPayloadList();
    }

    [HttpPut("main/move-pkm")]
    public ActionResult<List<DataActionPayload>> MainMovePkm([BindRequired] string pkmId, [BindRequired] uint boxId, [BindRequired] uint boxSlot)
    {
        StorageService.MainMovePkm(pkmId, boxId, boxSlot);

        return StorageService.GetActionPayloadList();
    }

    [HttpPost("main/create-pkm-version")]
    public ActionResult<List<DataActionPayload>> MainCreatePkmVersion([BindRequired] string pkmId, [BindRequired] uint generation)
    {
        StorageService.MainCreatePkmVersion(pkmId, generation);

        return StorageService.GetActionPayloadList();
    }

    [HttpPut("save/{saveId}/move-pkm")]
    public ActionResult<List<DataActionPayload>> SaveMovePkm(uint saveId, [BindRequired] string pkmId, [BindRequired] int boxId, [BindRequired] int boxSlot)
    {
        StorageService.SaveMovePkm(saveId, pkmId, boxId, boxSlot);

        return StorageService.GetActionPayloadList();
    }

    [HttpPut("save/{saveId}/move-pkm-to-storage")]
    public ActionResult<List<DataActionPayload>> SaveMovePkmToStorage(uint saveId, [BindRequired] string savePkmId, [BindRequired] uint storageBoxId, [BindRequired] uint storageSlot)
    {
        StorageService.SaveMovePkmToStorage(saveId, savePkmId, storageBoxId, storageSlot);

        return StorageService.GetActionPayloadList();
    }

    [HttpPut("save/{saveId}/move-pkm-from-storage")]
    public ActionResult<List<DataActionPayload>> SaveMovePkmFromStorage(uint saveId, [BindRequired] string pkmVersionId, [BindRequired] int saveBoxId, [BindRequired] int saveSlot)
    {
        StorageService.SaveMovePkmFromStorage(saveId, pkmVersionId, saveBoxId, saveSlot);

        return StorageService.GetActionPayloadList();
    }

    [HttpGet("action")]
    public ActionResult<List<DataActionPayload>> GetActions()
    {
        return StorageService.GetActionPayloadList();
    }

    [HttpDelete("action")]
    public ActionResult<List<DataActionPayload>> DeleteActions(int actionIndexToRemoveFrom)
    {
        StorageService.RemoveDataActions(actionIndexToRemoveFrom);

        return StorageService.GetActionPayloadList();
    }
}
