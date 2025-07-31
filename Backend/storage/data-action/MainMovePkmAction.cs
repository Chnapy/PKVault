using PKHeX.Core;

public class MainMovePkmAction : DataAction
{
    private readonly string id;
    private readonly uint boxId;
    private readonly uint boxSlot;

    public MainMovePkmAction(string _id, uint _boxId, uint _boxSlot)
    {
        id = _id;
        boxId = _boxId;
        boxSlot = _boxSlot;
    }

    public override void Execute(DataEntityLoaders loaders)
    {
        var entity = loaders.pkmLoader.GetEntity(id);
        if (entity == default)
        {
            throw new Exception("Pkm not found");
        }

        var entityAlreadyPresent = loaders.pkmLoader.GetAllEntities().Find(entity => entity.Id != id &&
        entity.BoxId == boxId && entity.BoxSlot == boxSlot
        );
        if (entityAlreadyPresent != null)
        {
            throw new Exception($"Pkm already present in slot, boxId={boxId}, boxSlot={boxSlot}");
        }

        entity.BoxId = boxId;
        entity.BoxSlot = boxSlot;

        loaders.pkmLoader.WriteEntity(entity);
    }
}
