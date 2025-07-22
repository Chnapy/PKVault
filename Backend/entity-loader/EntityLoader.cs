
public abstract class EntityLoader<D> where D : IWithId
{
    public abstract List<D> GetAllEntities();

    public abstract void SetAllEntities(List<D> entities);

    public D? GetEntity(long id)
    {
        return GetAllEntities().Find(entity => entity.Id == id);
    }

    public virtual D? DeleteEntity(long id)
    {
        Console.WriteLine($"Delete entity id={id}");

        var initialList = GetAllEntities();
        var removedEntity = initialList.Find(entity => entity.Id == id);
        if (removedEntity == null)
        {
            return default;
        }

        var finalList = initialList.FindAll(entity => entity.Id != id);

        SetAllEntities(finalList);

        return removedEntity;
    }

    public virtual D WriteEntity(D entity)
    {
        Console.WriteLine($"Write new entity {entity.GetType().Name} id={entity.Id}");

        // Console.WriteLine($"old-list count={GetAllEntities().Count}");

        var list = GetAllEntities()
        .FindAll(item => item.Id != entity.Id);
        list.Add(entity);

        SetAllEntities(list);

        // Console.WriteLine($"new-list count={GetAllEntities().Count}");

        return entity;
    }
}
