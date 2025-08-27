using PKHeX.Core;

public class SaveMovePkmAction : DataAction
{
    public uint saveId { get; }
    private readonly string id;
    // private readonly BoxType boxType;
    private readonly int boxId;
    private readonly int boxSlot;

    public SaveMovePkmAction(uint _saveId, string _id, int _boxId, int _boxSlot)
    {
        saveId = _saveId;
        id = _id;
        // boxType = _boxType;
        boxId = _boxId;
        boxSlot = _boxSlot;
    }

    public override DataActionPayload GetPayload()
    {
        return new DataActionPayload
        {
            type = DataActionType.SAVE_MOVE_PKM,
            parameters = [saveId, id, boxId, boxSlot]
        };
    }

    public override async Task Execute(DataEntityLoaders loaders)
    {
        var saveLoaders = loaders.saveLoadersDict[saveId];

        var dto = saveLoaders.Pkms.GetDto(id);
        if (dto == default)
        {
            throw new Exception("Save Pkm not found");
        }

        var entityAlreadyPresent = saveLoaders.Pkms.GetAllDtos().Find(entity => entity.Id != id &&
            entity.Box == boxId && entity.BoxSlot == boxSlot
        );
        if (entityAlreadyPresent != null)
        {
            throw new Exception($"Save Pkm already present in slot, boxId={boxId}, boxSlot={boxSlot}");
        }

        await saveLoaders.Pkms.DeleteDto(dto.Id);

        // dto.BoxType = boxType;
        dto.Box = boxId;
        dto.BoxSlot = boxSlot;

        await saveLoaders.Pkms.WriteDto(dto);
    }
}
