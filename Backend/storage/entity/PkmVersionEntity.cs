
using System.Text.Json;

public class PkmVersionEntity : IWithId, ICloneable<PkmVersionEntity>
{
    static readonly string filePath = "db/pkm-version.json";

    public static List<PkmVersionEntity> GetAllEntities(uint? pkmId)
    {
        if (!File.Exists(filePath))
        {
            Console.WriteLine("Pkm-version DB file not existing: creating.");
            string emptyJson = JsonSerializer.Serialize(new List<PkmVersionEntity>());

            string? directory = Path.GetDirectoryName(filePath);
            if (!string.IsNullOrEmpty(directory))
            {
                Directory.CreateDirectory(directory);
            }

            File.WriteAllText(filePath, emptyJson);
        }

        string json = File.ReadAllText(filePath);
        var list = JsonSerializer.Deserialize<List<PkmVersionEntity>>(json) ?? new List<PkmVersionEntity>();

        if (pkmId != null)
        {
            return list.FindAll(pkmVersion => pkmVersion.PkmId == pkmId);
        }

        return list;
    }

    public static PkmVersionEntity? GetEntity(uint id)
    {
        return GetAllEntities(null).Find(entity => entity.Id == id);
    }

    public static PkmVersionEntity? DeleteEntity(uint id)
    {
        Console.WriteLine("Delete pkm-version entity " + id);

        var initialList = GetAllEntities(null);
        var removedEntity = initialList.Find(entity => entity.Id == id);
        if (removedEntity == null)
        {
            return null;
        }

        var finalList = initialList.FindAll(entity => entity.Id != id);

        File.WriteAllText(filePath, JsonSerializer.Serialize(finalList));

        return removedEntity;
    }

    public static void WriteEntity(PkmVersionEntity entity)
    {
        Console.WriteLine("Write new pkm-version entity.");

        var list = GetAllEntities(null)
        .FindAll(entity => entity.Id != entity.Id);
        list.Add(entity);

        File.WriteAllText(filePath, JsonSerializer.Serialize(list));
    }

    public long Id { get; set; }

    public long PkmId { get; set; }

    public uint Generation { get; set; }

    // public uint? SaveId { get; set; }

    public string Filepath { get; set; }

    public PkmVersionEntity Clone()
    {
        return JsonSerializer.Deserialize<PkmVersionEntity>(
            JsonSerializer.Serialize(this)
        )!;
    }
}
