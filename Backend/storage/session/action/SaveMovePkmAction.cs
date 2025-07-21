using PKHeX.Core;

public class SaveMovePkmAction : IWithSaveId
{
    public uint saveId { get; }
    private readonly long id;
    private readonly int boxId;
    private readonly int boxSlot;

    public SaveMovePkmAction(uint _saveId, long _id, int _boxId, int _boxSlot)
    {
        saveId = _saveId;
        id = _id;
        boxId = _boxId;
        boxSlot = _boxSlot;
    }

    public void Execute(SaveLoaders saveLoaders)
    {
        var dto = saveLoaders.Pkms.GetEntity(id);
        if (dto == default)
        {
            throw new Exception("Save Pkm not found");
        }

        var entityAlreadyPresent = saveLoaders.Pkms.GetAllEntities().Find(entity => entity.Id != id &&
        entity.Box == boxId && entity.BoxSlot == boxSlot
        );
        if (entityAlreadyPresent != null)
        {
            throw new Exception($"Save Pkm already present in slot, boxId={boxId}, boxSlot={boxSlot}");
        }

        dto.Box = boxId;
        dto.BoxSlot = boxSlot;

        saveLoaders.Pkms.WriteEntity(dto);
    }
}
