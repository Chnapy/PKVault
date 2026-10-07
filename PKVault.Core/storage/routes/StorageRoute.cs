using PKHeX.Core;

namespace PKVault.Core.storage.routes;

[Route("api/[controller]")]
public class StorageController(DataService dataService, StorageQueryService storageQueryService, ActionService actionService, ISessionService sessionService)
{
    [HttpGet("main/bank")]
    public async Task<List<BankDTO>> GetMainBanks()
    {
        var list = await storageQueryService.GetMainBanks();

        return list;
    }

    [HttpGet("main/pkm-version")]
    public async Task<List<PkmVariantDTO>> GetMainPkmVariants()
    {
        var list = await storageQueryService.GetMainPkmVariants();

        return list;
    }

    [HttpGet("box")]
    public async Task<List<BoxDTO>> GetBoxes(uint? saveId = null)
    {
        var boxes = saveId == null
            ? await storageQueryService.GetMainBoxes()
            : await storageQueryService.GetSaveBoxes((uint)saveId);

        return boxes;
    }

    [HttpGet("save/{saveId}/pkm")]
    public async Task<List<PkmSaveDTO>> GetSavePkms(uint saveId)
    {
        var savePkms = await storageQueryService.GetSavePkms(saveId);

        return savePkms;
    }

    [HttpGet("inventory")]
    public async Task<Dictionary<string, InventoryItemDTO>> GetInventoryItems(uint? saveId = null)
    {
        return saveId == null
            ? await storageQueryService.GetMainInventory()
            : await storageQueryService.GetSaveInventory((uint)saveId);
    }

    [HttpGet("pkm/legality")]
    public async Task<Dictionary<string, PkmLegalityDTO>> GetPkmsLegality(string[] pkmIds, uint? saveId)
    {
        var pkmsLegality = await storageQueryService.GetPkmsLegality(pkmIds, saveId);

        return pkmsLegality!;
    }

    [HttpGet("main/pkm-version/{pkmVariantId}/diff")]
    public async Task<Dictionary<string, Tuple<string, string>>> GetMainPkmVariantDiff(string pkmVariantId)
    {
        return await storageQueryService.GetMainPkmVariantDiff(pkmVariantId);
    }

    [HttpPut("move/pkm")]
    public async Task<DataDTO> MovePkm(MovePkmActionInput input)
    {
        var flags = await actionService.MovePkm(input);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPut("move/pkm/bank")]
    public async Task<DataDTO> MovePkmBank(MovePkmBankActionInput input)
    {
        var flags = await actionService.MovePkmBank(input);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPut("move/item")]
    public async Task<DataDTO> MoveItem(MoveItemActionInput input)
    {
        var flags = await actionService.MoveItem(input);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPut("move/item/bank")]
    public async Task<DataDTO> MoveItemBank(MoveItemBankActionInput input)
    {
        var flags = await actionService.MoveItemBank(input);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPost("main/box")]
    public async Task<DataDTO> CreateMainBox(string bankId)
    {
        var flags = await actionService.MainCreateBox(new(bankId, null));

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPut("main/box")]
    public async Task<DataDTO> UpdateMainBox(MainUpdateBoxActionInput input)
    {
        var flags = await actionService.MainUpdateBox(input);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpDelete("main/box/{boxId}")]
    public async Task<DataDTO> DeleteMainBox(string boxId)
    {
        var flags = await actionService.MainDeleteBox(boxId);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPost("main/bank")]
    public async Task<DataDTO> CreateMainBank()
    {
        var flags = await actionService.MainCreateBank();

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPut("main/bank")]
    public async Task<DataDTO> UpdateMainBank(MainUpdateBankActionInput input)
    {
        var flags = await actionService.MainUpdateBank(input);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpDelete("main/bank/{bankId}")]
    public async Task<DataDTO> DeleteMainBank(string bankId)
    {
        var flags = await actionService.MainDeleteBank(bankId);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPut("main/pkm/detach-save")]
    public async Task<DataDTO> MainPkmDetachSave(DetachPkmSaveActionInput input)
    {
        var flags = await actionService.MainPkmDetachSaves(input);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPost("main/pkm-version")]
    public async Task<DataDTO> MainCreatePkmVariant(string pkmVariantId, EntityContext context)
    {
        var flags = await actionService.MainCreatePkmVariant(new(pkmVariantId, context));

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPut("main/pkm-version")]
    public async Task<DataDTO> MainEditPkmVariant(EditPkmVariantActionInput input)
    {
        var flags = await actionService.MainEditPkmVariant(input);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpDelete("main/pkm-version")]
    public async Task<DataDTO> MainDeletePkmVariant(DeletePkmVariantActionInput input)
    {
        var flags = await actionService.MainPkmVariantsDelete(input);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPut("main/pkm-version/{pkmVariantId}/main")]
    public async Task<DataDTO> MainSetPkmVariantMain(string pkmVariantId)
    {
        var flags = await actionService.MainSetPkmVariantMain(pkmVariantId);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpDelete("save/pkm")]
    public async Task<DataDTO> SaveDeletePkms(SaveDeletePkmActionInput input)
    {
        var flags = await actionService.SaveDeletePkms(input);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPut("save/pkm")]
    public async Task<DataDTO> SaveEditPkm(EditPkmSaveActionInput input)
    {
        var flags = await actionService.SaveEditPkm(input);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPut("pkm/evolve")]
    public async Task<DataDTO> EvolvePkms(EvolvePkmActionInput input)
    {
        var flags = await actionService.EvolvePkms(input);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPut("pkm/sort")]
    public async Task<DataDTO> SortPkms(SortPkmActionInput input)
    {
        var flags = await actionService.SortPkms(input);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPut("dex/sync")]
    public async Task<DataDTO> DexSync(DexSyncActionInput input)
    {
        var flags = await actionService.DexSync(input);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpGet("pkm/available-moves")]
    public async Task<List<MoveItem>> GetPkmAvailableMoves(uint? saveId, string pkmId)
    {
        return await actionService.GetPkmAvailableMoves(saveId, pkmId);
    }

    [HttpGet("action")]
    public List<DataActionPayload> GetActions()
    {
        return sessionService.GetActionPayloadList();
    }

    [HttpDelete("action")]
    public async Task<DataDTO> DeleteActions(int actionIndexToRemoveFrom)
    {
        var flags = await actionService.RemoveDataActionsAndReset(actionIndexToRemoveFrom);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPost("action/save")]
    public async Task<DataDTO> Save()
    {
        var flags = await actionService.Save();

        return await dataService.CreateDataFromUpdateFlags(flags);
    }
}
