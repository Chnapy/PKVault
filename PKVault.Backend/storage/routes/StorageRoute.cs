using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace PKVault.Backend.storage.routes;

[ApiController]
[Route("api/[controller]")]
public class StorageController : ControllerBase
{
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
        var list = StorageService.GetMainPkmVersions();

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

    [HttpPut("main/pkm/{pkmId}/move")]
    public async Task<ActionResult<List<DataActionPayload>>> MainMovePkm(string pkmId, [BindRequired] uint boxId, [BindRequired] uint boxSlot)
    {
        await StorageService.MainMovePkm(pkmId, boxId, boxSlot);

        return StorageService.GetActionPayloadList();
    }

    [HttpPut("main/pkm/{pkmId}/detach-save")]
    public async Task<ActionResult<List<DataActionPayload>>> MainPkmDetachSave(string pkmId)
    {
        await StorageService.MainPkmDetachSave(pkmId);

        return StorageService.GetActionPayloadList();
    }

    [HttpPost("main/pkm-version")]
    public async Task<ActionResult<List<DataActionPayload>>> MainCreatePkmVersion([BindRequired] string pkmId, [BindRequired] uint generation)
    {
        await StorageService.MainCreatePkmVersion(pkmId, generation);

        return StorageService.GetActionPayloadList();
    }

    [HttpPut("main/pkm-version/{pkmVersionId}")]
    public async Task<ActionResult<List<DataActionPayload>>> MainEditPkmVersion(string pkmVersionId, [BindRequired] EditPkmVersionPayload payload)
    {
        await StorageService.MainEditPkmVersion(pkmVersionId, payload);

        return StorageService.GetActionPayloadList();
    }

    [HttpDelete("main/pkm-version/{pkmVersionId}")]
    public async Task<ActionResult<List<DataActionPayload>>> MainDeletePkmVersion(string pkmVersionId)
    {
        await StorageService.MainPkmVersionDelete(pkmVersionId);

        return StorageService.GetActionPayloadList();
    }

    [HttpDelete("save/{saveId}/pkm/{pkmId}")]
    public async Task<ActionResult<List<DataActionPayload>>> SaveDeletePkm(uint saveId, string pkmId)
    {
        await StorageService.SaveDeletePkm(saveId, pkmId);

        return StorageService.GetActionPayloadList();
    }

    [HttpPut("save/{saveId}/pkm/{pkmId}")]
    public async Task<ActionResult<List<DataActionPayload>>> SaveEditPkm(uint saveId, string pkmId, [BindRequired] EditPkmVersionPayload payload)
    {
        await StorageService.SaveEditPkm(saveId, pkmId, payload);

        return StorageService.GetActionPayloadList();
    }

    [HttpPut("save/{saveId}/pkm/{pkmId}/move")]
    public async Task<ActionResult<List<DataActionPayload>>> SaveMovePkm(uint saveId, string pkmId, [BindRequired] int boxId, [BindRequired] int boxSlot)
    {
        await StorageService.SaveMovePkm(saveId, pkmId, boxId, boxSlot);

        return StorageService.GetActionPayloadList();
    }

    [HttpPut("save/{saveId}/pkm/move-to-storage")]
    public async Task<ActionResult<List<DataActionPayload>>> SaveMovePkmToStorage(uint saveId, [BindRequired] string savePkmId, [BindRequired] uint storageBoxId, [BindRequired] uint storageSlot)
    {
        await StorageService.SaveMovePkmToStorage(saveId, savePkmId, storageBoxId, storageSlot);

        return StorageService.GetActionPayloadList();
    }

    [HttpPut("save/{saveId}/pkm/move-from-storage")]
    public async Task<ActionResult<List<DataActionPayload>>> SaveMovePkmFromStorage(uint saveId, [BindRequired] string pkmVersionId, [BindRequired] int saveBoxId, [BindRequired] int saveSlot)
    {
        await StorageService.SaveMovePkmFromStorage(saveId, pkmVersionId, saveBoxId, saveSlot);

        return StorageService.GetActionPayloadList();
    }

    [HttpPut("save/{saveId}/pkm/synchronize")]
    public async Task<ActionResult<List<DataActionPayload>>> SaveSynchronizePkm(uint saveId, [BindRequired] string pkmVersionId)
    {
        await StorageService.SaveSynchronizePkm(saveId, pkmVersionId);

        return StorageService.GetActionPayloadList();
    }

    [HttpPut("pkm/{id}/evolve")]
    public async Task<ActionResult<List<DataActionPayload>>> EvolvePkm(string id, uint? saveId)
    {
        await StorageService.EvolvePkm(saveId, id);

        return StorageService.GetActionPayloadList();
    }

    [HttpGet("action")]
    public ActionResult<List<DataActionPayload>> GetActions()
    {
        return StorageService.GetActionPayloadList();
    }

    [HttpDelete("action")]
    public async Task<ActionResult<List<DataActionPayload>>> DeleteActions([BindRequired] int actionIndexToRemoveFrom)
    {
        await StorageService.RemoveDataActions(actionIndexToRemoveFrom);

        return StorageService.GetActionPayloadList();
    }

    [HttpPost("action/save")]
    public async Task<ActionResult<List<DataActionPayload>>> Save()
    {
        await StorageService.Save();

        return StorageService.GetActionPayloadList();
    }
}
