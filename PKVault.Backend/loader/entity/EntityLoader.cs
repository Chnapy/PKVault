
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
        return [.. await Task.WhenAll(GetAllEntities().Values.Select(entityToDto))];
    }

    public abstract Dictionary<string, E> GetAllEntities();

    public abstract void SetAllEntities(Dictionary<string, E> entities);

    public async Task<DTO?> GetDto(string id)
    {
        var entity = GetEntity(id);
        return entity == null ? default : await entityToDto(entity);
    }

    public E? GetEntity(string id)
    {
        var entities = GetAllEntities();
        if (entities.TryGetValue(id, out var value))
        {
            return value;
        }
        return default;
    }

    public virtual bool DeleteEntity(string id)
    {
        Console.WriteLine($"Delete entity id={id}");

        var entityToRemove = GetEntity(id);
        if (entityToRemove == null)
        {
            return false;
        }

        var entities = GetAllEntities();
        entities.Remove(id);
        SetAllEntities(entities);

        OnDelete?.Invoke(entityToRemove);

        return true;
    }

    public virtual void WriteDto(DTO dto)
    {
        Console.WriteLine($"{dto.GetType().Name} - Write id={dto.Id} - Entity id={dtoToEntity(dto).Id}");

        var entities = GetAllEntities();
        entities[dto.Id] = dtoToEntity(dto);
        SetAllEntities(entities);

        OnWrite?.Invoke(dto);
    }
}
