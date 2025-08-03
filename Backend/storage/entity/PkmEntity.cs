
using System.Text.Json;

public class PkmEntity : IWithId<string>, ICloneable<PkmEntity>
{
    public static PkmEntity FromDTO(PkmDTO dto)
    {
        return new PkmEntity
        {
            Id = dto.Id,
            BoxId = dto.BoxId,
            BoxSlot = dto.BoxSlot,
            SaveId = dto.SaveId,
            Species = dto.Species,
            IsShiny = dto.IsShiny,
            Nickname = dto.Nickname,
            OTName = dto.OTName
        };
    }

    public string Id { get; set; }

    public uint BoxId { get; set; }

    public uint BoxSlot { get; set; }

    public uint? SaveId { get; set; }

    public ushort Species { get; set; }

    public string Nickname { get; set; }

    public bool IsShiny { get; set; }

    public string OTName { get; set; }

    public PkmEntity Clone()
    {
        return JsonSerializer.Deserialize<PkmEntity>(
            JsonSerializer.Serialize(this)
        )!;
    }
}
