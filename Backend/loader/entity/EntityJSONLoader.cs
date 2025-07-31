
using System.Text.Json;

public class EntityJSONLoader<D> : EntityLoader<D> where D : IWithId<string>
{
    private string filePath;

    public EntityJSONLoader(string _filePath)
    {
        filePath = _filePath;
    }

    public override List<D> GetAllEntities()
    {
        if (!File.Exists(filePath))
        {
            Console.WriteLine($"Entity DB file not existing: creating.");
            string emptyJson = JsonSerializer.Serialize(new List<D>());

            string? directory = Path.GetDirectoryName(filePath);
            if (!string.IsNullOrEmpty(directory))
            {
                Directory.CreateDirectory(directory);
            }

            File.WriteAllText(filePath, emptyJson);
        }

        string json = File.ReadAllText(filePath);
        var list = JsonSerializer.Deserialize<List<D>>(json) ?? new List<D>();

        return list;
    }

    public override void SetAllEntities(List<D> entities)
    {
        File.WriteAllText(filePath, JsonSerializer.Serialize(entities));
    }
}
