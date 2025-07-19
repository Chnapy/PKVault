
using System.Text.Json;

public class BoxEntity : IWithId, ICloneable<BoxEntity>
{
    static readonly string filePath = "db/box.json";

    public static List<BoxEntity> GetAllBoxEntities()
    {
        if (!File.Exists(filePath))
        {
            Console.WriteLine("Box DB file not existing: creating.");
            string emptyJson = JsonSerializer.Serialize(new List<BoxEntity>());

            string? directory = Path.GetDirectoryName(filePath);
            if (!string.IsNullOrEmpty(directory))
            {
                Directory.CreateDirectory(directory);
            }

            File.WriteAllText(filePath, emptyJson);
        }

        string json = File.ReadAllText(filePath);
        return JsonSerializer.Deserialize<List<BoxEntity>>(json) ?? new List<BoxEntity>();
    }

    public static BoxEntity? GetEntity(uint id)
    {
        return GetAllBoxEntities().Find(entity => entity.Id == id);
    }

    public static BoxEntity? DeleteEntity(uint id)
    {
        Console.WriteLine("Delete box entity " + id);

        var initialList = GetAllBoxEntities();
        var removedEntity = initialList.Find(entity => entity.Id == id);
        if (removedEntity == null)
        {
            return null;
        }

        var finalList = initialList.FindAll(entity => entity.Id != id);

        File.WriteAllText(filePath, JsonSerializer.Serialize(finalList));

        return removedEntity;
    }

    public static void WriteEntity(BoxEntity entity)
    {
        Console.WriteLine("Write new box entity.");

        var list = GetAllBoxEntities()
        .FindAll(entity => entity.Id != entity.Id);
        list.Add(entity);

        File.WriteAllText(filePath, JsonSerializer.Serialize(list));
    }

    public long Id { get; set; }

    public string Name { get; set; }

    public uint Order { get; set; }

    public BoxEntity Clone()
    {
        return JsonSerializer.Deserialize<BoxEntity>(
            JsonSerializer.Serialize(this)
        )!;
    }
}
