using System.Text.Json;
using System.Text.Json.Serialization.Metadata;

public abstract class EntityLoader<DTO, E> : IEntityLoaderWrite where DTO : IWithId where E : IEntity
{
    protected Dictionary<string, E>? entitiesById = null;

    public string FilePath { get; }
    public bool HasWritten { get; set; } = false;
    protected JsonTypeInfo<Dictionary<string, E>> DictJsonContext;

    private DataUpdateFlagsState<string> flags = new();

    public EntityLoader(string filePath, JsonTypeInfo<Dictionary<string, E>> dictJsonContext)
    {
        FilePath = MatcherUtil.NormalizePath(filePath);
        DictJsonContext = dictJsonContext;
    }

    protected abstract DTO GetDTOFromEntity(E entity);
    protected abstract E GetEntityFromDTO(DTO dto);

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
        if (!File.Exists(FilePath))
        {
            Console.WriteLine($"Entity DB file not existing: creating {FilePath}");
            string emptyJson = JsonSerializer.Serialize([], DictJsonContext);

            string? directory = Path.GetDirectoryName(FilePath);
            if (!string.IsNullOrEmpty(directory))
            {
                Directory.CreateDirectory(directory);
            }

            File.WriteAllText(FilePath, emptyJson);
        }

        string json = File.ReadAllText(FilePath);

        try
        {
            return JsonSerializer.Deserialize(json, DictJsonContext) ?? [];
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

    public virtual void WriteEntity(E entity)
    {
        Console.WriteLine($"{entity.GetType().Name} - Write id={entity.Id}");

        GetAllEntities()[entity.Id] = entity;

        flags.Ids.Add(entity.Id);
        HasWritten = true;
    }

    public virtual void WriteDto(DTO dto)
    {
        WriteEntity(GetEntityFromDTO(dto));
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

        using var fileStream = File.Create(FilePath);
        await JsonSerializer.SerializeAsync(
            fileStream,
            entitiesById ?? [],
            DictJsonContext
        );
    }

    public abstract int GetLastSchemaVersion();

    public abstract void SetupInitialData(DataEntityLoaders loaders);

    public void MigrateGlobalEntities(DataEntityLoaders loaders)
    {
        var entities = GetAllEntities();
        if (entities.Count == 0)
        {
            return;
        }

        var firstItem = entities.First().Value;
        if (firstItem == null)
        {
            return;
        }

        if (firstItem.SchemaVersion == GetLastSchemaVersion())
        {
            return;
        }

        var migrateFn = GetMigrateFunc(firstItem.SchemaVersion) ?? throw new NotSupportedException($"Schema version {firstItem.SchemaVersion}");

        migrateFn(loaders);

        MigrateGlobalEntities(loaders);
    }

    protected abstract Action<DataEntityLoaders>? GetMigrateFunc(int currentSchemaVersion);

    public abstract void CleanData(DataEntityLoaders loaders);
}
