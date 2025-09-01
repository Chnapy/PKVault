using PKHeX.Core;

public class SaveMovePkmAction(uint saveId, string id, int boxId, int boxSlot) : DataAction
{
    public uint SaveId { get; } = saveId;

    public override DataActionPayload GetPayload()
    {
        return new DataActionPayload
        {
            type = DataActionType.SAVE_MOVE_PKM,
            parameters = [SaveId, id, boxId, boxSlot]
        };
    }

    public override async Task Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        var saveLoaders = loaders.saveLoadersDict[SaveId];

        var dto = await saveLoaders.Pkms.GetDto(id);
        if (dto == default)
        {
            throw new Exception("Save Pkm not found");
        }

        var entityAlreadyPresent = await saveLoaders.Pkms.GetDto(boxId, boxSlot);
        if (entityAlreadyPresent != null)
        {
            throw new Exception($"Save Pkm already present in slot, boxId={boxId}, boxSlot={boxSlot}");
        }

        // await saveLoaders.Pkms.DeleteDto(dto.Id);

        dto.Box = boxId;
        dto.BoxSlot = boxSlot;

        await saveLoaders.Pkms.WriteDto(dto);

        flags.Saves.Add(new()
        {
            SaveId = SaveId,
            SavePkms = true
        });
    }
}
