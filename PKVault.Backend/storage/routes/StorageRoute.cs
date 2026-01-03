using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace PKVault.Backend.storage.routes;

[ApiController]
[Route("api/[controller]")]
public class StorageController : ControllerBase
{
    [HttpGet("main/bank")]
    public async Task<ActionResult<List<BankDTO>>> GetMainBanks()
    {
        var list = await StorageService.GetMainBanks();

        return list;
    }

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

    [HttpPut("move/pkm/bank")]
    public async Task<ActionResult<DataDTO>> MovePkmBank(
        [FromQuery] string[] pkmIds, uint? sourceSaveId,
        string bankId,
        bool attached
    )
    {
        var flags = await StorageService.MovePkmBank(pkmIds, sourceSaveId, bankId, attached);

        return await DataDTO.FromDataUpdateFlags(flags);
    }

    [HttpPost("main/box")]
    public async Task<ActionResult<DataDTO>> CreateMainBox([BindRequired] string bankId)
    {
        var flags = await StorageService.MainCreateBox(bankId);

        return await DataDTO.FromDataUpdateFlags(flags);
    }

    [HttpPut("main/box/{boxId}")]
    public async Task<ActionResult<DataDTO>> UpdateMainBox(
        string boxId, [BindRequired] string boxName, [BindRequired] int order, [BindRequired] string bankId,
        [BindRequired] int slotCount, [BindRequired] BoxType type
    )
    {
        var flags = await StorageService.MainUpdateBox(boxId, boxName, order, bankId, slotCount, type);

        return await DataDTO.FromDataUpdateFlags(flags);
    }

    [HttpDelete("main/box/{boxId}")]
    public async Task<ActionResult<DataDTO>> DeleteMainBox(string boxId)
    {
        var flags = await StorageService.MainDeleteBox(boxId);

        return await DataDTO.FromDataUpdateFlags(flags);
    }

    [HttpPost("main/bank")]
    public async Task<ActionResult<DataDTO>> CreateMainBank()
    {
        var flags = await StorageService.MainCreateBank();

        return await DataDTO.FromDataUpdateFlags(flags);
    }

    [HttpPut("main/bank/{bankId}")]
    public async Task<ActionResult<DataDTO>> UpdateMainBank(string bankId,
        [BindRequired] string bankName, [BindRequired] bool isDefault, [BindRequired] int order,
        [BindRequired] BankEntity.BankView view)
    {
        var flags = await StorageService.MainUpdateBank(bankId, bankName, isDefault, order, view);

        return await DataDTO.FromDataUpdateFlags(flags);
    }

    [HttpDelete("main/bank/{bankId}")]
    public async Task<ActionResult<DataDTO>> DeleteMainBank(string bankId)
    {
        var flags = await StorageService.MainDeleteBank(bankId);

        return await DataDTO.FromDataUpdateFlags(flags);
    }

    [HttpPut("main/pkm/detach-save")]
    public async Task<ActionResult<DataDTO>> MainPkmDetachSave([FromQuery] string[] pkmIds)
    {
        var flags = await StorageService.MainPkmDetachSaves(pkmIds);

        return await DataDTO.FromDataUpdateFlags(flags);
    }

    [HttpPost("main/pkm-version")]
    public async Task<ActionResult<DataDTO>> MainCreatePkmVersion([BindRequired] string pkmId, [BindRequired] byte generation)
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

    [HttpDelete("main/pkm-version")]
    public async Task<ActionResult<DataDTO>> MainDeletePkmVersion([FromQuery] string[] pkmVersionIds)
    {
        var flags = await StorageService.MainPkmVersionsDelete(pkmVersionIds);

        return await DataDTO.FromDataUpdateFlags(flags);
    }

    [HttpDelete("save/{saveId}/pkm")]
    public async Task<ActionResult<DataDTO>> SaveDeletePkms(uint saveId, [FromQuery] string[] pkmIds)
    {
        var flags = await StorageService.SaveDeletePkms(saveId, pkmIds);

        return await DataDTO.FromDataUpdateFlags(flags);
    }

    [HttpPut("save/{saveId}/pkm/{pkmId}")]
    public async Task<ActionResult<DataDTO>> SaveEditPkm(uint saveId, string pkmId, [BindRequired] EditPkmVersionPayload payload)
    {
        var flags = await StorageService.SaveEditPkm(saveId, pkmId, payload);

        return await DataDTO.FromDataUpdateFlags(flags);
    }

    [HttpPut("pkm/evolve")]
    public async Task<ActionResult<DataDTO>> EvolvePkms([FromQuery] string[] ids, uint? saveId)
    {
        var flags = await StorageService.EvolvePkms(saveId, ids);

        return await DataDTO.FromDataUpdateFlags(flags);
    }

    [HttpPut("pkm/sort")]
    public async Task<ActionResult<DataDTO>> SortPkms(uint? saveId, [BindRequired] int fromBoxId, [BindRequired] int toBoxId, [BindRequired] bool leaveEmptySlot)
    {
        var flags = await StorageService.SortPkms(saveId, fromBoxId, toBoxId, leaveEmptySlot);

        return await DataDTO.FromDataUpdateFlags(flags);
    }

    [HttpPut("dex/sync")]
    public async Task<ActionResult<DataDTO>> DexSync([FromQuery] uint[] saveIds)
    {
        var flags = await StorageService.DexSync(saveIds);

        return await DataDTO.FromDataUpdateFlags(flags);
    }

    [HttpGet("pkm/available-moves")]
    public async Task<ActionResult<List<MoveItem>>> GetPkmAvailableMoves(uint? saveId, string pkmId)
    {
        return await StorageService.GetPkmAvailableMoves(saveId, pkmId);
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
