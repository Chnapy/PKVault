using PKHeX.Core;

public class DexFormEntity : IEntity
{
    public override required string Id { get; init; }
    public required ushort Species { get; init; }
    public required byte Form { get; init; }
    public required Gender Gender { get; init; }
    public required GameVersion Version { get; set; }
    public required bool IsCaught { get; set; }
    public required bool IsCaughtShiny { get; set; }
}
