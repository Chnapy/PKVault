public class PkmDTO : IWithId
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

    public bool CanMoveToSave { get => SaveId == null; }

    public bool CanMoveAttachedToSave { get => SaveId == null; }

    public bool CanDelete { get => SaveId == null; }

    public required PkmEntity PkmEntity;
}
