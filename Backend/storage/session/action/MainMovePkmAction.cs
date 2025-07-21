using PKHeX.Core;

public class MainMovePkmAction
{
    private readonly long id;
    private readonly uint boxId;
    private readonly uint boxSlot;

    public MainMovePkmAction(long _id, uint _boxId, uint _boxSlot)
    {
        id = _id;
        boxId = _boxId;
        boxSlot = _boxSlot;
    }

    public void Execute(EntityLoader<PkmEntity> pkmLoader)
    {
        var entity = pkmLoader.GetEntity(id);
        if (entity == default)
        {
            throw new Exception("Pkm not found");
        }

        var entityAlreadyPresent = pkmLoader.GetAllEntities().Find(entity => entity.Id != id &&
        entity.BoxId == boxId && entity.BoxSlot == boxSlot
        );
        if (entityAlreadyPresent != null)
        {
            throw new Exception($"Pkm already present in slot, boxId={boxId}, boxSlot={boxSlot}");
        }

        entity.BoxId = boxId;
        entity.BoxSlot = boxSlot;

        pkmLoader.WriteEntity(entity);
    }
}
