
public abstract class EntityLoader<DTO, E> where DTO : IWithId<string>
{
    public Action<DTO>? OnWrite;
    public bool HasWritten = false;

    public abstract List<DTO> GetAllDtos();

    public virtual List<E> GetAllEntities()
    {
        throw new Exception("Not implemented");
    }

    public abstract Task SetAllDtos(List<DTO> dtos);

    public DTO? GetDto(string id)
    {
        return GetAllDtos().Find(entity => entity.Id == id);
    }

    public virtual void DeleteDto(string id)
    {
        Console.WriteLine($"Delete entity id={id}");

        var initialList = GetAllDtos();
        var removedEntity = initialList.Find(entity => entity.Id == id);
        if (removedEntity == null)
        {
            return;
        }

        var finalList = initialList.FindAll(entity => entity.Id != id);

        SetAllDtos(finalList);
    }

    public virtual async Task WriteDto(DTO dto)
    {
        Console.WriteLine($"{dto.GetType().Name} - Write id={dto.Id}");

        var list = GetAllDtos()
        .FindAll(item => item.Id != dto.Id);
        list.Add(dto);

        await SetAllDtos(list);

        OnWrite?.Invoke(dto);
    }
}
