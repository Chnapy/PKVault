using PKHeX.Core;

public class DexEntity : IWithId<string>
{
    public required string Id { get; set; }
    public required ushort Species { get; set; }
    public required List<DexEntityForm> Forms { get; set; }
}

public class DexEntityForm
{
    public required byte Form { get; set; }
    public required GameVersion Version { get; set; }
    public required Gender Gender { get; set; }
    public required bool IsCaught { get; set; }
    public required bool IsCaughtShiny { get; set; }
}
