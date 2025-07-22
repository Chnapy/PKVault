
public class EntityMemoryLoader<D> : EntityLoader<D> where D : IWithId, ICloneable<D>
{
    private List<D> entities;

    public EntityMemoryLoader(List<D> _entities)
    {
        // var cloneList = new List<D>();
        // _entities.ForEach(entity => cloneList.Add(entity.Clone()));
        entities = _entities;//.ToImmutableList();
    }

    public override List<D> GetAllEntities()
    {
        return entities.ToList();
    }

    public override void SetAllEntities(List<D> nextEntities)
    {
        entities = nextEntities;
    }


}
