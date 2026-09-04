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

    [HttpGet("pkm/legality")]
    public async Task<Dictionary<string, PkmLegalityDTO>> GetPkmsLegality(string[] pkmIds, uint? saveId)
    {
        var pkmsLegality = await storageQueryService.GetPkmsLegality(pkmIds, saveId);

        return pkmsLegality;
    }

    [HttpPut("move/pkm")]
    public async Task<DataDTO> MovePkm(
        string[] pkmIds, uint? sourceSaveId,
        uint? targetSaveId, string targetBoxId, int[] targetBoxSlots,
        bool attached
    )
    {
        var flags = await actionService.MovePkm(pkmIds, sourceSaveId, targetSaveId, targetBoxId, targetBoxSlots, attached);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPut("move/pkm/bank")]
    public async Task<DataDTO> MovePkmBank(
        string[] pkmIds, uint? sourceSaveId,
        string bankId,
        bool attached
    )
    {
        var flags = await actionService.MovePkmBank(pkmIds, sourceSaveId, bankId, attached);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPost("main/box")]
    public async Task<DataDTO> CreateMainBox(string bankId)
    {
        var flags = await actionService.MainCreateBox(bankId);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPut("main/box/{boxId}")]
    public async Task<DataDTO> UpdateMainBox(
        string boxId, string boxName, int order, string bankId,
        int slotCount, BoxType type
    )
    {
        var flags = await actionService.MainUpdateBox(boxId, boxName, order, bankId, slotCount, type);

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

    [HttpPut("main/bank/{bankId}")]
    public async Task<DataDTO> UpdateMainBank(string bankId,
        string bankName, bool isDefault, int order,
        BankEntity.BankView view)
    {
        var flags = await actionService.MainUpdateBank(bankId, bankName, isDefault, order, view);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpDelete("main/bank/{bankId}")]
    public async Task<DataDTO> DeleteMainBank(string bankId)
    {
        var flags = await actionService.MainDeleteBank(bankId);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPut("main/pkm/detach-save")]
    public async Task<DataDTO> MainPkmDetachSave(string[] pkmVariantIds)
    {
        var flags = await actionService.MainPkmDetachSaves(pkmVariantIds);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPost("main/pkm-version")]
    public async Task<DataDTO> MainCreatePkmVariant(string pkmVariantId, EntityContext context)
    {
        var flags = await actionService.MainCreatePkmVariant(pkmVariantId, context);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPut("main/pkm-version/{pkmVariantId}")]
    public async Task<DataDTO> MainEditPkmVariant(string pkmVariantId, EditPkmVariantPayload payload)
    {
        var flags = await actionService.MainEditPkmVariant(pkmVariantId, payload);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpDelete("main/pkm-version")]
    public async Task<DataDTO> MainDeletePkmVariant(string[] pkmVariantIds, bool deleteAllRelatedVariants)
    {
        var flags = await actionService.MainPkmVariantsDelete(pkmVariantIds, deleteAllRelatedVariants);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpDelete("save/{saveId}/pkm")]
    public async Task<DataDTO> SaveDeletePkms(uint saveId, string[] pkmIds)
    {
        var flags = await actionService.SaveDeletePkms(saveId, pkmIds);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPut("save/{saveId}/pkm/{pkmId}")]
    public async Task<DataDTO> SaveEditPkm(uint saveId, string pkmId, EditPkmVariantPayload payload)
    {
        var flags = await actionService.SaveEditPkm(saveId, pkmId, payload);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPut("pkm/evolve")]
    public async Task<DataDTO> EvolvePkms(string[] ids, uint? saveId)
    {
        var flags = await actionService.EvolvePkms(saveId, ids);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPut("pkm/sort")]
    public async Task<DataDTO> SortPkms(uint? saveId, int fromBoxId, int toBoxId, string pokedexName, bool leaveEmptySlot)
    {
        var flags = await actionService.SortPkms(saveId, fromBoxId, toBoxId, pokedexName, leaveEmptySlot);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpPut("dex/sync")]
    public async Task<DataDTO> DexSync(uint[] saveIds)
    {
        var flags = await actionService.DexSync(saveIds);

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
