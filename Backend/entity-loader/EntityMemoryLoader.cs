
public class EntityMemoryLoader<D> : EntityLoader<D> where D : IWithId, ICloneable<D>
{
    private List<D> entities;

    public EntityMemoryLoader(List<D> _entities)
    {
        var cloneList = new List<D>();
        _entities.ForEach(entity => cloneList.Add(entity.Clone()));
        entities = cloneList;//.ToImmutableList();
    }

    public override List<D> GetAllEntities()
    {
        // var cloneList = new List<D>();
        // entities.ForEach(entity => cloneList.Add(entity.Clone()));
        // return cloneList;
        return entities.ToList();
    }

    public override void SetAllEntities(List<D> nextEntities)
    {
        entities = nextEntities;
    }


}
