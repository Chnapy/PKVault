using System.Text.Json;
using System.Text.Json.Serialization.Metadata;

public abstract class EntityLoader<DTO, E> : IEntityLoader<DTO, E> where DTO : IWithId where E : IEntity
{
    protected IFileIOService fileIOService;

    protected Dictionary<string, E>? entitiesById = null;
    private DataUpdateFlagsState<string> flags = new();

    public string FilePath { get; }
    public bool HasWritten { get; set; } = false;
    protected JsonTypeInfo<Dictionary<string, E>> DictJsonContext;

    public EntityLoader(
        IFileIOService _fileIOService,
        string filePath, JsonTypeInfo<Dictionary<string, E>> dictJsonContext
    )
    {
        fileIOService = _fileIOService;
        FilePath = MatcherUtil.NormalizePath(filePath);
        DictJsonContext = dictJsonContext;
    }

    protected abstract DTO GetDTOFromEntity(E entity);

    public List<DTO> GetAllDtos()
    {
        return [.. GetAllEntities().Values.Select(GetDTOFromEntity)];
    }

    public virtual Dictionary<string, E> GetAllEntities()
    {
        entitiesById ??= GetFileContent();
        return entitiesById;
    }

    public byte[] SerializeToUtf8Bytes() => JsonSerializer.SerializeToUtf8Bytes(GetAllEntities(), DictJsonContext);

    private Dictionary<string, E> GetFileContent()
    {
        try
        {
            return fileIOService.ReadJSONFile(FilePath, DictJsonContext, []);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine(ex);
            throw new Exception(
                $"An error happened with file: {FilePath}"
                + "\nFile might be malformed, you can delete it to reset data, or report the issue."
                + $"\n{ex.GetType()}: {ex.Message}"
            );
        }
    }

    public DTO? GetDto(string id)
    {
        var entity = GetEntity(id);
        return entity == null ? default : GetDTOFromEntity(entity);
    }

    public E? GetEntity(string id)
    {
        if (GetAllEntities().TryGetValue(id, out var value))
        {
            return value;
        }
        return default;
    }

    public virtual bool DeleteEntity(string id)
    {
        var deleted = GetAllEntities().Remove(id);
        if (deleted)
        {
            Console.WriteLine($"Deleted id={id}");

            flags.Ids.Add(id);
            HasWritten = true;
        }

        return deleted;
    }

    public virtual E WriteEntity(E entity)
    {
        Console.WriteLine($"{entity.GetType().Name} - Write id={entity.Id}");

        GetAllEntities()[entity.Id] = entity;

        flags.Ids.Add(entity.Id);
        HasWritten = true;

        return entity;
    }

    public void SetFlags(DataUpdateFlagsState<string> _flags)
    {
        flags = _flags;
    }

    public virtual async Task WriteToFile()
    {
        if (!HasWritten)
        {
            Console.WriteLine($"No write changes, ignore file {FilePath}");
            return;
        }

        Console.WriteLine($"Write entities to {FilePath}");

        await fileIOService.WriteJSONFileAsync(FilePath, DictJsonContext, entitiesById ?? []);
    }

    public abstract int GetLastSchemaVersion();
}
