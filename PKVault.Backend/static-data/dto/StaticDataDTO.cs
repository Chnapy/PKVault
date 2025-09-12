
using PKHeX.Core;

public class StaticDataDTO
{
    public required Dictionary<int, StaticVersion> Versions { get; set; }
    public required Dictionary<int, StaticSpecies> Species { get; set; }
    public required Dictionary<int, StaticStat> Stats { get; set; }
    public required Dictionary<int, StaticType> Types { get; set; }
    public required Dictionary<int, StaticMove> Moves { get; set; }
    public required Dictionary<int, StaticNature> Natures { get; set; }
    public required Dictionary<int, StaticAbility> Abilities { get; set; }
    public required Dictionary<int, StaticItem> Items { get; set; }
}

public struct StaticVersion
{
    public GameVersion Id { get; set; }
    public string Name { get; set; }
    public byte Generation { get; set; }
}

public struct StaticSpecies
{
    public int Id { get; set; }
    public string Name { get; set; }
    public uint Generation { get; set; }
    public GenderType[] Genders { get; set; }
    public string SpriteDefault { get; set; }
    public string SpriteShiny { get; set; }
    // public int[] AvailableMoves { get; set; }
}

public struct StaticStat
{
    public int Id { get; set; }
    public string Name { get; set; }
}

public struct StaticType
{
    public int Id { get; set; }
    public string Name { get; set; }
}

public struct StaticMove
{
    public int Id { get; set; }
    public string Name { get; set; }
    public StaticMoveGeneration[] DataUntilGeneration { get; set; }
}

public struct StaticMoveGeneration
{
    public uint UntilGeneration { get; set; }
    public int Type { get; set; }
    public MoveCategory Category { get; set; }
    public int? Power { get; set; }
}

public struct StaticNature
{
    public int Id { get; set; }
    public string Name { get; set; }
    public int? IncreasedStatIndex { get; set; }
    public int? DecreasedStatIndex { get; set; }
}

public struct StaticAbility
{
    public int Id { get; set; }
    public string Name { get; set; }
}

public struct StaticItem
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Sprite { get; set; }
}

public enum MoveCategory
{
    PHYSICAL,
    SPECIAL,
    STATUS
}

public enum GenderType
{
    MALE,
    FEMALE,
}
