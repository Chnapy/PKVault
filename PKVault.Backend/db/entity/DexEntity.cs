using PKHeX.Core;

public class DexEntity : IEntity
{
    public override required string Id { get; init; }
    public required ushort Species { get; set; }
    public required List<DexEntityForm> Forms { get; set; }
}

public record DexEntityForm(
    byte Form,
    GameVersion Version,
    Gender Gender,
    bool IsCaught,
    bool IsCaughtShiny
);
