
using System.Text.Json;
using PKHeX.Core;

public class SaveInfosEntity
{
    static readonly string filePath = "db/saveInfos.json";

    public static SaveInfosEntity FromSave(SaveFile save, string filepath, long timestamp)
    {
        var saveId = save.ID32;

        return new SaveInfosEntity
        {
            SaveId = saveId,
            Filepath = filepath,
            Timestamp = timestamp,
        };
    }

    public static List<SaveInfosEntity> GetAllSaveInfosEntity()
    {
        if (!File.Exists(filePath))
        {
            Console.WriteLine("SaveInfos DB file not existing: creating.");
            string emptyJson = JsonSerializer.Serialize(new List<SaveInfosEntity>());

            string? directory = Path.GetDirectoryName(filePath);
            if (!string.IsNullOrEmpty(directory))
            {
                Directory.CreateDirectory(directory);
            }

            File.WriteAllText(filePath, emptyJson);
        }

        string json = File.ReadAllText(filePath);
        return JsonSerializer.Deserialize<List<SaveInfosEntity>>(json) ?? new List<SaveInfosEntity>();
    }

    public static SaveInfosEntity? GetSaveInfosEntity(uint saveId)
    {
        return GetAllSaveInfosEntity().Find(entity => entity.SaveId == saveId);
    }

    public static List<SaveInfosEntity> GetLastSaveInfosEntity()
    {
        var allEntities = GetAllSaveInfosEntity().OrderByDescending(entity => entity.Timestamp).ToList();
        var saveIds = new List<uint>();

        return allEntities.FindAll(entity =>
        {
            if (saveIds.Contains(entity.SaveId))
            {
                return false;
            }
            saveIds.Add(entity.SaveId);
            return true;
        });
    }

    public static SaveInfosEntity? DeleteEntity(uint saveId, long timestamp)
    {
        Console.WriteLine("Delete save-infos entity " + saveId);

        var initialList = GetAllSaveInfosEntity();
        var removedEntity = initialList.Find(entity => entity.SaveId == saveId && entity.Timestamp == timestamp);
        if (removedEntity == null)
        {
            return null;
        }

        var finalList = initialList.FindAll(entity => entity.SaveId != saveId || entity.Timestamp != timestamp);

        File.WriteAllText(filePath, JsonSerializer.Serialize(finalList));

        return removedEntity;
    }

    public static List<SaveInfosEntity> WriteEntity(SaveInfosEntity entity)
    {
        Console.WriteLine("Write new save-infos entity.");

        var samePartialIdMaxSaves = 2;

        var initialList = GetAllSaveInfosEntity();
        initialList.Add(entity);

        var otherEntities = initialList.FindAll(value => value.SaveId != entity.SaveId);
        var relatedEntities = initialList.FindAll(value => value.SaveId == entity.SaveId)
        .OrderByDescending(value => value.Timestamp).ToList();

        var finalRelatedEntities = relatedEntities.Count > samePartialIdMaxSaves
        ? relatedEntities.Take(samePartialIdMaxSaves).ToList()
        : relatedEntities;

        var entitiesToRemove = relatedEntities.TakeLast(relatedEntities.Count - samePartialIdMaxSaves).ToList();

        var finalList = otherEntities.Concat(finalRelatedEntities).ToList();

        File.WriteAllText(filePath, JsonSerializer.Serialize(finalList));

        return entitiesToRemove;
    }

    public uint SaveId { get; set; }

    public string Filepath { get; set; }

    public long Timestamp { get; set; }
}
