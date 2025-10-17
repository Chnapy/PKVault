using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace PKVault.Backend.storage.routes;

[ApiController]
[Route("api/[controller]")]
public class StorageController : ControllerBase
{
    [HttpGet("main/box")]
    public async Task<ActionResult<List<BoxDTO>>> GetMainBoxes()
    {
        var list = await StorageService.GetMainBoxes();

        return list;
    }

    [HttpGet("main/pkm")]
    public async Task<ActionResult<List<PkmDTO>>> GetMainPkms()
    {
        var list = await StorageService.GetMainPkms();

        return list;
    }

    // TODO return dict for perf
    [HttpGet("main/pkm-version")]
    public async Task<ActionResult<List<PkmVersionDTO>>> GetMainPkmVersions()
    {
        var list = await StorageService.GetMainPkmVersions();

        return list;
    }

    [HttpGet("save/{saveId}/box")]
    public async Task<ActionResult<List<BoxDTO>>> GetSaveBoxes(uint saveId)
    {
        var saveBoxes = await StorageService.GetSaveBoxes(saveId);

        return saveBoxes;
    }

    [HttpGet("save/{saveId}/pkm")]
    public async Task<ActionResult<List<PkmSaveDTO>>> GetSavePkms(uint saveId)
    {
        var savePkms = await StorageService.GetSavePkms(saveId);

        return savePkms;
    }

    [HttpPut("move/pkm")]
    public async Task<ActionResult<DataDTO>> MovePkm(
        [FromQuery] string[] pkmIds, uint? sourceSaveId,
        uint? targetSaveId, [BindRequired] int targetBoxId, [FromQuery] int[] targetBoxSlots,
        bool attached
    )
    {
        var flags = await StorageService.MovePkm(pkmIds, sourceSaveId, targetSaveId, targetBoxId, targetBoxSlots, attached);

        return await DataDTO.FromDataUpdateFlags(flags);
    }

    [HttpPost("main/box")]
    public async Task<ActionResult<DataDTO>> CreateMainBox([BindRequired] string boxName)
    {
        var flags = await StorageService.MainCreateBox(boxName);

        return await DataDTO.FromDataUpdateFlags(flags);
    }

    [HttpPut("main/box/{boxId}")]
    public async Task<ActionResult<DataDTO>> UpdateMainBox(string boxId, [BindRequired] string boxName)
    {
        var flags = await StorageService.MainUpdateBox(boxId, boxName);

        return await DataDTO.FromDataUpdateFlags(flags);
    }

    [HttpDelete("main/box/{boxId}")]
    public async Task<ActionResult<DataDTO>> DeleteMainBox(string boxId)
    {
        var flags = await StorageService.MainDeleteBox(boxId);

        return await DataDTO.FromDataUpdateFlags(flags);
    }

    [HttpPut("main/pkm/{pkmId}/detach-save")]
    public async Task<ActionResult<DataDTO>> MainPkmDetachSave(string pkmId)
    {
        var flags = await StorageService.MainPkmDetachSave(pkmId);

        return await DataDTO.FromDataUpdateFlags(flags);
    }

    [HttpPost("main/pkm-version")]
    public async Task<ActionResult<DataDTO>> MainCreatePkmVersion([BindRequired] string pkmId, [BindRequired] uint generation)
    {
        var flags = await StorageService.MainCreatePkmVersion(pkmId, generation);

        return await DataDTO.FromDataUpdateFlags(flags);
    }

    [HttpPut("main/pkm-version/{pkmVersionId}")]
    public async Task<ActionResult<DataDTO>> MainEditPkmVersion(string pkmVersionId, [BindRequired] EditPkmVersionPayload payload)
    {
        var flags = await StorageService.MainEditPkmVersion(pkmVersionId, payload);

        return await DataDTO.FromDataUpdateFlags(flags);
    }

    [HttpDelete("main/pkm-version/{pkmVersionId}")]
    public async Task<ActionResult<DataDTO>> MainDeletePkmVersion(string pkmVersionId)
    {
        var flags = await StorageService.MainPkmVersionDelete(pkmVersionId);

        return await DataDTO.FromDataUpdateFlags(flags);
    }

    [HttpDelete("save/{saveId}/pkm/{pkmId}")]
    public async Task<ActionResult<DataDTO>> SaveDeletePkm(uint saveId, string pkmId)
    {
        var flags = await StorageService.SaveDeletePkm(saveId, pkmId);

        return await DataDTO.FromDataUpdateFlags(flags);
    }

    [HttpPut("save/{saveId}/pkm/{pkmId}")]
    public async Task<ActionResult<DataDTO>> SaveEditPkm(uint saveId, string pkmId, [BindRequired] EditPkmVersionPayload payload)
    {
        var flags = await StorageService.SaveEditPkm(saveId, pkmId, payload);

        return await DataDTO.FromDataUpdateFlags(flags);
    }

    [HttpPut("save/{saveId}/pkm/synchronize")]
    public async Task<ActionResult<DataDTO>> SaveSynchronizePkm(uint saveId, [BindRequired] string pkmVersionId)
    {
        var flags = await StorageService.SaveSynchronizePkm(saveId, pkmVersionId);

        return await DataDTO.FromDataUpdateFlags(flags);
    }

    [HttpPut("pkm/{id}/evolve")]
    public async Task<ActionResult<DataDTO>> EvolvePkm(string id, uint? saveId)
    {
        var flags = await StorageService.EvolvePkm(saveId, id);

        return await DataDTO.FromDataUpdateFlags(flags);
    }

    [HttpGet("action")]
    public ActionResult<List<DataActionPayload>> GetActions()
    {
        return StorageService.GetActionPayloadList();
    }

    [HttpDelete("action")]
    public async Task<ActionResult<DataDTO>> DeleteActions([BindRequired] int actionIndexToRemoveFrom)
    {
        var flags = await StorageService.RemoveDataActionsAndReset(actionIndexToRemoveFrom);

        return await DataDTO.FromDataUpdateFlags(flags);
    }

    [HttpPost("action/save")]
    public async Task<ActionResult<DataDTO>> Save()
    {
        var flags = await StorageService.Save();

        return await DataDTO.FromDataUpdateFlags(flags);
    }
}
