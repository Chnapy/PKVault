
public abstract class EntityLoader<DTO, E>(
    Func<DTO, E> dtoToEntity,
    Func<E, Task<DTO>> entityToDto
) where DTO : IWithId<string> where E : IWithId<string>
{
    public readonly Func<E, Task<DTO>> entityToDto = entityToDto;

    public Action<DTO>? OnWrite;
    public Action<E>? OnDelete;

    public bool HasWritten = false;

    public async Task<List<DTO>> GetAllDtos()
    {
        return [.. await Task.WhenAll(GetAllEntities().Select(entityToDto))];
    }

    public abstract List<E> GetAllEntities();

    public abstract void SetAllEntities(List<E> entities);

    public async Task<DTO?> GetDto(string id)
    {
        var entity = GetEntity(id);
        return entity == null ? default : await entityToDto(entity);
    }

    public E? GetEntity(string id)
    {
        return GetAllEntities().Find(entity => entity.Id == id);
    }

    public virtual void DeleteEntity(string id)
    {
        Console.WriteLine($"Delete entity id={id}");

        var initialList = GetAllEntities();
        var removedEntity = initialList.Find(entity => entity.Id == id);
        if (removedEntity == null)
        {
            return;
        }

        var finalList = initialList.FindAll(entity => entity.Id != id);

        SetAllEntities(finalList);

        OnDelete?.Invoke(removedEntity);
    }

    public virtual void WriteDto(DTO dto)
    {
        Console.WriteLine($"{dto.GetType().Name} - Write id={dto.Id}");

        var list = GetAllEntities()
        .FindAll(item => item.Id != dto.Id);
        list.Add(dtoToEntity(dto));

        SetAllEntities(list);

        OnWrite?.Invoke(dto);
    }
}
