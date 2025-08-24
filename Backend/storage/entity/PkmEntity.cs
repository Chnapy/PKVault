public class PkmEntity : IWithId<string>
{
    public required string Id { get; set; }

    public required uint BoxId { get; set; }

    public required uint BoxSlot { get; set; }

    public required uint? SaveId { get; set; }
}
