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
    public EntityContext Context { get; set; }
    public byte Generation { get; set; }
    public required Gender Gender { get; set; }
    public required List<byte> Types { get; set; }
    public required int[] Abilities { get; set; }
    public required int[] BaseStats { get; set; }
    public required bool IsCaught { get; set; }
    public required bool IsCaughtShiny { get; set; }
}
