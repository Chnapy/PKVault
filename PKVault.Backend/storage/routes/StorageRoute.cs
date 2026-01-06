using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace PKVault.Backend.storage.routes;

[ApiController]
[Route("api/[controller]")]
public class StorageController(DataService dataService, StorageService storageService) : ControllerBase
{
    [HttpGet("main/bank")]
    public async Task<ActionResult<List<BankDTO>>> GetMainBanks()
    {
        var list = await storageService.GetMainBanks();

        return list;
    }

    [HttpGet("main/box")]
    public async Task<ActionResult<List<BoxDTO>>> GetMainBoxes()
    {
        var list = await storageService.GetMainBoxes();

        return list;
    }

    [HttpGet("main/pkm")]
    public async Task<ActionResult<List<PkmDTO>>> GetMainPkms()
    {
        var list = await storageService.GetMainPkms();

        return list;
    }

    // TODO return dict for perf
    [HttpGet("main/pkm-version")]
    public async Task<ActionResult<List<PkmVersionDTO>>> GetMainPkmVersions()
    {
        var list = await storageService.GetMainPkmVersions();

        return list;
    }

    [HttpGet("save/{saveId}/box")]
    public async Task<ActionResult<List<BoxDTO>>> GetSaveBoxes(uint saveId)
    {
        var saveBoxes = await storageService.GetSaveBoxes(saveId);

        return saveBoxes;
    }

    [HttpGet("save/{saveId}/pkm")]
    public async Task<ActionResult<List<PkmSaveDTO>>> GetSavePkms(uint saveId)
    {
        var savePkms = await storageService.GetSavePkms(saveId);

        return savePkms;
    }

    [HttpPut("move/pkm")]
    public async Task<ActionResult<DataDTO>> MovePkm(
        [FromQuery] string[] pkmIds, uint? sourceSaveId,
        uint? targetSaveId, [BindRequired] int targetBoxId, [FromQuery] int[] targetBoxSlots,
        bool attached
    )
    {
        var flags = await storageService.MovePkm(pkmIds, sourceSaveId, targetSaveId, targetBoxId, targetBoxSlots, attached);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPut("move/pkm/bank")]
    public async Task<ActionResult<DataDTO>> MovePkmBank(
        [FromQuery] string[] pkmIds, uint? sourceSaveId,
        string bankId,
        bool attached
    )
    {
        var flags = await storageService.MovePkmBank(pkmIds, sourceSaveId, bankId, attached);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPost("main/box")]
    public async Task<ActionResult<DataDTO>> CreateMainBox([BindRequired] string bankId)
    {
        var flags = await storageService.MainCreateBox(bankId);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPut("main/box/{boxId}")]
    public async Task<ActionResult<DataDTO>> UpdateMainBox(
        string boxId, [BindRequired] string boxName, [BindRequired] int order, [BindRequired] string bankId,
        [BindRequired] int slotCount, [BindRequired] BoxType type
    )
    {
        var flags = await storageService.MainUpdateBox(boxId, boxName, order, bankId, slotCount, type);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpDelete("main/box/{boxId}")]
    public async Task<ActionResult<DataDTO>> DeleteMainBox(string boxId)
    {
        var flags = await storageService.MainDeleteBox(boxId);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPost("main/bank")]
    public async Task<ActionResult<DataDTO>> CreateMainBank()
    {
        var flags = await storageService.MainCreateBank();

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPut("main/bank/{bankId}")]
    public async Task<ActionResult<DataDTO>> UpdateMainBank(string bankId,
        [BindRequired] string bankName, [BindRequired] bool isDefault, [BindRequired] int order,
        [BindRequired] BankEntity.BankView view)
    {
        var flags = await storageService.MainUpdateBank(bankId, bankName, isDefault, order, view);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpDelete("main/bank/{bankId}")]
    public async Task<ActionResult<DataDTO>> DeleteMainBank(string bankId)
    {
        var flags = await storageService.MainDeleteBank(bankId);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPut("main/pkm/detach-save")]
    public async Task<ActionResult<DataDTO>> MainPkmDetachSave([FromQuery] string[] pkmIds)
    {
        var flags = await storageService.MainPkmDetachSaves(pkmIds);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPost("main/pkm-version")]
    public async Task<ActionResult<DataDTO>> MainCreatePkmVersion([BindRequired] string pkmId, [BindRequired] byte generation)
    {
        var flags = await storageService.MainCreatePkmVersion(pkmId, generation);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPut("main/pkm-version/{pkmVersionId}")]
    public async Task<ActionResult<DataDTO>> MainEditPkmVersion(string pkmVersionId, [BindRequired] EditPkmVersionPayload payload)
    {
        var flags = await storageService.MainEditPkmVersion(pkmVersionId, payload);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpDelete("main/pkm-version")]
    public async Task<ActionResult<DataDTO>> MainDeletePkmVersion([FromQuery] string[] pkmVersionIds)
    {
        var flags = await storageService.MainPkmVersionsDelete(pkmVersionIds);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpDelete("save/{saveId}/pkm")]
    public async Task<ActionResult<DataDTO>> SaveDeletePkms(uint saveId, [FromQuery] string[] pkmIds)
    {
        var flags = await storageService.SaveDeletePkms(saveId, pkmIds);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPut("save/{saveId}/pkm/{pkmId}")]
    public async Task<ActionResult<DataDTO>> SaveEditPkm(uint saveId, string pkmId, [BindRequired] EditPkmVersionPayload payload)
    {
        var flags = await storageService.SaveEditPkm(saveId, pkmId, payload);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPut("pkm/evolve")]
    public async Task<ActionResult<DataDTO>> EvolvePkms([FromQuery] string[] ids, uint? saveId)
    {
        var flags = await storageService.EvolvePkms(saveId, ids);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPut("pkm/sort")]
    public async Task<ActionResult<DataDTO>> SortPkms(uint? saveId, [BindRequired] int fromBoxId, [BindRequired] int toBoxId, [BindRequired] bool leaveEmptySlot)
    {
        var flags = await storageService.SortPkms(saveId, fromBoxId, toBoxId, leaveEmptySlot);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPut("dex/sync")]
    public async Task<ActionResult<DataDTO>> DexSync([FromQuery] uint[] saveIds)
    {
        var flags = await storageService.DexSync(saveIds);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpGet("pkm/available-moves")]
    public async Task<ActionResult<List<MoveItem>>> GetPkmAvailableMoves(uint? saveId, string pkmId)
    {
        return await storageService.GetPkmAvailableMoves(saveId, pkmId);
    }

    [HttpGet("action")]
    public ActionResult<List<DataActionPayload>> GetActions()
    {
        return storageService.GetActionPayloadList();
    }

    [HttpDelete("action")]
    public async Task<ActionResult<DataDTO>> DeleteActions([BindRequired] int actionIndexToRemoveFrom)
    {
        var flags = await storageService.RemoveDataActionsAndReset(actionIndexToRemoveFrom);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPost("action/save")]
    public async Task<ActionResult<DataDTO>> Save()
    {
        var flags = await storageService.Save();

        return await dataService.CreateDataFromUpdateFlags(flags);
    }
}
