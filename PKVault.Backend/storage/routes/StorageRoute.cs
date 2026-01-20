using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace PKVault.Backend.storage.routes;

[ApiController]
[Route("api/[controller]")]
public class StorageController(DataService dataService, ILoadersService loadersService, StorageQueryService storageQueryService, ActionService actionService) : ControllerBase
{
    [HttpGet("main/bank")]
    public async Task<ActionResult<List<BankDTO>>> GetMainBanks()
    {
        var list = await storageQueryService.GetMainBanks();

        return list;
    }

    [HttpGet("main/box")]
    public async Task<ActionResult<List<BoxDTO>>> GetMainBoxes()
    {
        var list = await storageQueryService.GetMainBoxes();

        return list;
    }

    // [HttpGet("main/pkm")]
    // public async Task<ActionResult<List<PkmDTO>>> GetMainPkms()
    // {
    //     var list = await storageQueryService.GetMainPkms();

    //     return list;
    // }

    // TODO return dict for perf
    [HttpGet("main/pkm-version")]
    public async Task<ActionResult<List<PkmVersionDTO>>> GetMainPkmVersions()
    {
        var list = await storageQueryService.GetMainPkmVersions();

        return list;
    }

    [HttpGet("save/{saveId}/box")]
    public async Task<ActionResult<List<BoxDTO>>> GetSaveBoxes(uint saveId)
    {
        var saveBoxes = await storageQueryService.GetSaveBoxes(saveId);

        return saveBoxes;
    }

    [HttpGet("save/{saveId}/pkm")]
    public async Task<ActionResult<List<PkmSaveDTO>>> GetSavePkms(uint saveId)
    {
        var savePkms = await storageQueryService.GetSavePkms(saveId);

        return savePkms;
    }

    [HttpGet("pkm/legality")]
    public async Task<ActionResult<Dictionary<string, PkmLegalityDTO>>> GetPkmsLegality([FromQuery] string[] pkmIds, uint? saveId)
    {
        var pkmsLegality = await storageQueryService.GetPkmsLegality(pkmIds, saveId);

        return pkmsLegality;
    }

    [HttpPut("move/pkm")]
    public async Task<ActionResult<DataDTO>> MovePkm(
        [FromQuery] string[] pkmIds, uint? sourceSaveId,
        uint? targetSaveId, [BindRequired] int targetBoxId, [FromQuery] int[] targetBoxSlots,
        bool attached
    )
    {
        var flags = await actionService.MovePkm(pkmIds, sourceSaveId, targetSaveId, targetBoxId, targetBoxSlots, attached);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPut("move/pkm/bank")]
    public async Task<ActionResult<DataDTO>> MovePkmBank(
        [FromQuery] string[] pkmIds, uint? sourceSaveId,
        string bankId,
        bool attached
    )
    {
        var flags = await actionService.MovePkmBank(pkmIds, sourceSaveId, bankId, attached);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPost("main/box")]
    public async Task<ActionResult<DataDTO>> CreateMainBox([BindRequired] string bankId)
    {
        var flags = await actionService.MainCreateBox(bankId);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPut("main/box/{boxId}")]
    public async Task<ActionResult<DataDTO>> UpdateMainBox(
        string boxId, [BindRequired] string boxName, [BindRequired] int order, [BindRequired] string bankId,
        [BindRequired] int slotCount, [BindRequired] BoxType type
    )
    {
        var flags = await actionService.MainUpdateBox(boxId, boxName, order, bankId, slotCount, type);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpDelete("main/box/{boxId}")]
    public async Task<ActionResult<DataDTO>> DeleteMainBox(string boxId)
    {
        var flags = await actionService.MainDeleteBox(boxId);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPost("main/bank")]
    public async Task<ActionResult<DataDTO>> CreateMainBank()
    {
        var flags = await actionService.MainCreateBank();

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPut("main/bank/{bankId}")]
    public async Task<ActionResult<DataDTO>> UpdateMainBank(string bankId,
        [BindRequired] string bankName, [BindRequired] bool isDefault, [BindRequired] int order,
        [BindRequired] BankEntity.BankView view)
    {
        var flags = await actionService.MainUpdateBank(bankId, bankName, isDefault, order, view);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpDelete("main/bank/{bankId}")]
    public async Task<ActionResult<DataDTO>> DeleteMainBank(string bankId)
    {
        var flags = await actionService.MainDeleteBank(bankId);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPut("main/pkm/detach-save")]
    public async Task<ActionResult<DataDTO>> MainPkmDetachSave([FromQuery] string[] pkmIds)
    {
        var flags = await actionService.MainPkmDetachSaves(pkmIds);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPost("main/pkm-version")]
    public async Task<ActionResult<DataDTO>> MainCreatePkmVersion([BindRequired] string pkmId, [BindRequired] byte generation)
    {
        var flags = await actionService.MainCreatePkmVersion(pkmId, generation);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPut("main/pkm-version/{pkmVersionId}")]
    public async Task<ActionResult<DataDTO>> MainEditPkmVersion(string pkmVersionId, [BindRequired] EditPkmVersionPayload payload)
    {
        var flags = await actionService.MainEditPkmVersion(pkmVersionId, payload);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpDelete("main/pkm-version")]
    public async Task<ActionResult<DataDTO>> MainDeletePkmVersion([FromQuery] string[] pkmVersionIds)
    {
        var flags = await actionService.MainPkmVersionsDelete(pkmVersionIds);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpDelete("save/{saveId}/pkm")]
    public async Task<ActionResult<DataDTO>> SaveDeletePkms(uint saveId, [FromQuery] string[] pkmIds)
    {
        var flags = await actionService.SaveDeletePkms(saveId, pkmIds);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPut("save/{saveId}/pkm/{pkmId}")]
    public async Task<ActionResult<DataDTO>> SaveEditPkm(uint saveId, string pkmId, [BindRequired] EditPkmVersionPayload payload)
    {
        var flags = await actionService.SaveEditPkm(saveId, pkmId, payload);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPut("pkm/evolve")]
    public async Task<ActionResult<DataDTO>> EvolvePkms([FromQuery] string[] ids, uint? saveId)
    {
        var flags = await actionService.EvolvePkms(saveId, ids);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPut("pkm/sort")]
    public async Task<ActionResult<DataDTO>> SortPkms(uint? saveId, [BindRequired] int fromBoxId, [BindRequired] int toBoxId, [BindRequired] bool leaveEmptySlot)
    {
        var flags = await actionService.SortPkms(saveId, fromBoxId, toBoxId, leaveEmptySlot);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPut("dex/sync")]
    public async Task<ActionResult<DataDTO>> DexSync([FromQuery] uint[] saveIds)
    {
        var flags = await actionService.DexSync(saveIds);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpGet("pkm/available-moves")]
    public async Task<ActionResult<List<MoveItem>>> GetPkmAvailableMoves(uint? saveId, string pkmId)
    {
        return await actionService.GetPkmAvailableMoves(saveId, pkmId);
    }

    [HttpGet("action")]
    public ActionResult<List<DataActionPayload>> GetActions()
    {
        return loadersService.GetActionPayloadList();
    }

    [HttpDelete("action")]
    public async Task<ActionResult<DataDTO>> DeleteActions([BindRequired] int actionIndexToRemoveFrom)
    {
        var flags = await actionService.RemoveDataActionsAndReset(actionIndexToRemoveFrom);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPost("action/save")]
    public async Task<ActionResult<DataDTO>> Save()
    {
        var flags = await actionService.Save();

        return await dataService.CreateDataFromUpdateFlags(flags);
    }
}
