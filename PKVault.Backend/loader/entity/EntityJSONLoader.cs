using System.Text.Json;
using System.Text.Json.Serialization.Metadata;

public class EntityJSONLoader<DTO, E>(
    string filePath,
    Func<DTO, E> dtoToEntity,
    Func<E, DTO> entityToDto,
    JsonTypeInfo<Dictionary<string, E>> dictJsonContext
    ) : EntityLoader<DTO, E>(dtoToEntity, entityToDto) where DTO : IWithId<string> where E : IWithId<string>
{
    private Dictionary<string, E>? entitiesById = null;

    public override Dictionary<string, E> GetAllEntities()
    {
        entitiesById ??= GetFileContent();

        return entitiesById.ToDictionary();
    }

    public override void SetAllEntities(Dictionary<string, E> entities)
    {
        entitiesById = entities.ToDictionary();

        HasWritten = true;
    }

    public override void WriteToFile()
    {
        if (!HasWritten)
        {
            Console.WriteLine($"No write changes, ignore file {filePath}");
            return;
        }

        Console.WriteLine($"Write entities to {filePath}");

        File.WriteAllText(filePath, JsonSerializer.Serialize(entitiesById ?? [], dictJsonContext));
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
}
