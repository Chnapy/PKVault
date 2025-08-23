
using PKHeX.Core;

public class PkmDTO : IWithId<string>
{
    public static PkmDTO FromEntity(PkmEntity entity, SaveFile? save)
    {
        return new PkmDTO
        {
            PkmEntity = entity,
            Save = save,
        };
    }

    public string Id { get { return PkmEntity.Id; } }

    public uint BoxId { get { return PkmEntity.BoxId; } }

    public uint BoxSlot { get { return PkmEntity.BoxSlot; } }

    public uint? SaveId { get { return Save?.ID32; } }

    // public List<uint> CompatibleGenerations { get; set; }

    public required PkmEntity PkmEntity;

    public required SaveFile? Save;
}
