using System.Text.Json;

public class EntityJSONLoader<DTO, E>(
    string filePath,
    Func<DTO, E> dtoToEntity,
    Func<E, Task<DTO>> entityToDto
    ) : EntityLoader<DTO, E>(dtoToEntity, entityToDto) where DTO : IWithId<string> where E : IWithId<string>
{
    public override List<E> GetAllEntities()
    {
        if (!File.Exists(filePath))
        {
            Console.WriteLine($"Entity DB file not existing: creating {filePath}");
            string emptyJson = JsonSerializer.Serialize(new List<E>());

            string? directory = Path.GetDirectoryName(filePath);
            if (!string.IsNullOrEmpty(directory))
            {
                Directory.CreateDirectory(directory);
            }

            File.WriteAllText(filePath, emptyJson);
        }

        string json = File.ReadAllText(filePath);
        return JsonSerializer.Deserialize<List<E>>(json) ?? [];
    }

    public override void SetAllEntities(List<E> entities)
    {
        Console.WriteLine($"Write entities to {filePath}");

        File.WriteAllText(filePath, JsonSerializer.Serialize(entities));

        HasWritten = true;
    }
}
