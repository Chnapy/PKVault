using System.Text.Json;
using System.Text.Json.Serialization.Metadata;

public abstract class EntityLoader<DTO, E>(
    string filePath,
    JsonTypeInfo<Dictionary<string, E>> dictJsonContext
) where DTO : IWithId<string> where E : IWithId<string>
{
    protected Dictionary<string, E>? entitiesById = null;

    public bool HasWritten = false;

    protected abstract DTO GetDTOFromEntity(E entity);
    protected abstract E GetEntityFromDTO(DTO dto);

    public List<DTO> GetAllDtos()
    {
        return [.. GetAllEntities().Values.Select(GetDTOFromEntity)];
    }

    public virtual Dictionary<string, E> GetAllEntities()
    {
        entitiesById ??= GetFileContent();

        return entitiesById.ToDictionary();
    }

    private Dictionary<string, E> GetFileContent()
    {
        if (!File.Exists(filePath))
        {
            Console.WriteLine($"Entity DB file not existing: creating {filePath}");
            string emptyJson = JsonSerializer.Serialize([], dictJsonContext);

            string? directory = Path.GetDirectoryName(filePath);
            if (!string.IsNullOrEmpty(directory))
            {
                Directory.CreateDirectory(directory);
            }

            File.WriteAllText(filePath, emptyJson);
        }

        string json = File.ReadAllText(filePath);

        try
        {
            return JsonSerializer.Deserialize(json, dictJsonContext) ?? [];
        }
        catch (JsonException ex)
        {
            Console.Error.WriteLine(ex);
            File.Move(filePath, $"{filePath}.bkp", true);
            return GetFileContent();
        }
    }

    public virtual void SetAllEntities(Dictionary<string, E> entities)
    {
        entitiesById = entities.ToDictionary();

        HasWritten = true;
    }

    public DTO? GetDto(string id)
    {
        var entity = GetEntity(id);
        return entity == null ? default : GetDTOFromEntity(entity);
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

        return true;
    }

    public virtual void WriteDto(DTO dto)
    {
        Console.WriteLine($"{dto.GetType().Name} - Write id={dto.Id} - Entity id={GetEntityFromDTO(dto).Id}");

        var entities = GetAllEntities();
        entities[dto.Id] = GetEntityFromDTO(dto);
        SetAllEntities(entities);
    }

    public virtual void WriteToFile()
    {
        if (!HasWritten)
        {
            Console.WriteLine($"No write changes, ignore file {filePath}");
            return;
        }

        Console.WriteLine($"Write entities to {filePath}");

        File.WriteAllText(filePath, JsonSerializer.Serialize(entitiesById ?? [], dictJsonContext));
    }

    public void CreateBackupFile()
    {
        File.Copy(filePath, filePath + ".bkp", true);
    }
}
