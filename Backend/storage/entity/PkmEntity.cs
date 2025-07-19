
using System.Text.Json;

public class PkmEntity : IWithId, ICloneable<PkmEntity>
{
    public static PkmEntity FromDTO(PkmDTO dto)
    {
        return new PkmEntity
        {
            Id = dto.Id,
            BoxId = dto.BoxId,
            BoxIndex = dto.BoxIndex,
            SaveId = dto.SaveId
        };
    }

    // public static List<PkmEntity> GetAllEntities(long? boxId)
    // {
    //     if (!File.Exists(filePath))
    //     {
    //         Console.WriteLine("Pkm DB file not existing: creating.");
    //         string emptyJson = JsonSerializer.Serialize(new List<PkmEntity>());

    //         string? directory = Path.GetDirectoryName(filePath);
    //         if (!string.IsNullOrEmpty(directory))
    //         {
    //             Directory.CreateDirectory(directory);
    //         }

    //         File.WriteAllText(filePath, emptyJson);
    //     }

    //     string json = File.ReadAllText(filePath);
    //     var list = JsonSerializer.Deserialize<List<PkmEntity>>(json) ?? new List<PkmEntity>();

    //     if (boxId != null)
    //     {
    //         return list.FindAll(item => item.BoxId == boxId);
    //     }

    //     return list;
    // }

    // public static PkmEntity? GetEntity(long id)
    // {
    //     return GetAllEntities(null).Find(entity => entity.Id == id);
    // }

    // public static PkmEntity? DeleteEntity(long id)
    // {
    //     Console.WriteLine("Delete pkm entity " + id);

    //     var initialList = GetAllEntities(null);
    //     var removedEntity = initialList.Find(entity => entity.Id == id);
    //     if (removedEntity == null)
    //     {
    //         return null;
    //     }

    //     var finalList = initialList.FindAll(entity => entity.Id != id);

    //     File.WriteAllText(filePath, JsonSerializer.Serialize(finalList));

    //     return removedEntity;
    // }

    // public static PkmEntity WriteEntity(PkmEntity entity)
    // {
    //     Console.WriteLine("Write new pkm entity.");

    //     var list = GetAllEntities(null)
    //     .FindAll(entity => entity.Id != entity.Id);
    //     list.Add(entity);

    //     File.WriteAllText(filePath, JsonSerializer.Serialize(list));

    //     return entity;
    // }

    public long Id { get; set; }

    public uint BoxId { get; set; }

    public uint BoxIndex { get; set; }

    public uint? SaveId { get; set; }

    public PkmEntity Clone()
    {
        return JsonSerializer.Deserialize<PkmEntity>(
            JsonSerializer.Serialize(this)
        )!;
    }
}
