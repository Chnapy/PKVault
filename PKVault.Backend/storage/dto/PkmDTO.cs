public record PkmDTO(
    string Id,
    uint BoxId,
    uint BoxSlot,
    uint? SaveId
) : IWithId
{
    public bool CanMoveToSave => SaveId == null;
    public bool CanMoveAttachedToSave => SaveId == null;
    public bool CanDelete => SaveId == null;
}
