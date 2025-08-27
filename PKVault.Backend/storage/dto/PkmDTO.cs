public class PkmDTO : IWithId<string>
{
    public static PkmDTO FromEntity(PkmEntity entity)
    {
        return new PkmDTO
        {
            PkmEntity = entity,
        };
    }

    public string Id { get { return PkmEntity.Id; } }

    public uint BoxId { get { return PkmEntity.BoxId; } }

    public uint BoxSlot { get { return PkmEntity.BoxSlot; } }

    public uint? SaveId { get { return PkmEntity.SaveId; } }

    // public List<uint> CompatibleGenerations { get; set; }

    public required PkmEntity PkmEntity;
}
