public record BoxDTO(
    string Id,
    BoxType Type,
    string Name,
    int SlotCount,
    int Order,
    string? BankId
) : IWithId
{
    public int IdInt => int.Parse(Id);

    public bool CanSaveWrite => Type == BoxType.Box;

    public bool CanSaveReceivePkm => Type == BoxType.Party || Type == BoxType.Box;
}

public enum BoxType : int
{
    Box = 0,
    Party = -1,

    /// <summary> Battle Box </summary>
    BattleBox = -2,
    /// <summary> Daycare </summary>
    Daycare = -3,
    /// <summary> Global Trade Station (GTS) </summary>
    GTS = -4,

    /// <summary> Fused Legendary Storage </summary>
    Fused = -5,

    /// <summary> Underground area wild Pokémon cache </summary>
    /// <remarks>
    /// <see cref="GameVersion.BD"/>
    /// <see cref="GameVersion.SP"/>
    /// </remarks>
    Underground = -6,
    /// <summary> Poké Pelago (Gen7) </summary>
    Resort = -7,
    /// <summary> Ride Legendary Slot (S/V) </summary>
    Ride = -8,

    /// <summary> Shiny Overworld Cache </summary>
    Shiny = -9,

    /// <summary> Battle Agency (Gen7) </summary>
    BattleAgency = -10,

    /// <summary> Gen4 HeartGold/SoulSilver pedometer accessory upload </summary>
    Pokéwalker = -11,
}
