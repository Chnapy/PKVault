
using PKHeX.Core;

namespace PKVault.Core;

public record DexLocationDTO(
    ushort Species,
    EntityContext Context,
    GameVersion Version,
    // location -> encounterWithMethod -> Item[]
    Dictionary<string, Dictionary<string, List<DexLocationItem>>> Locations
);

public record DexLocationItem(
    HashSet<byte> Forms,
    string EncounterType,
    string EncounterWithMethod,
    bool IsEgg,
    bool IsShiny,
    string? Location,
    // string? EggLocation,
    HashSet<DexLevelRange> Levels,
    AbilityPermission AbilitiesAllowed
// int? FixedBall,
// Shiny ShinyProbability
) : IEquatable<DexLocationItem>
{
    public virtual bool Equals(DexLocationItem? other)
    {
        if (other is null) return false;
        if (ReferenceEquals(this, other)) return true;

        return Forms.SetEquals(other.Forms)
            && EncounterType == other.EncounterType
            && EncounterWithMethod == other.EncounterWithMethod
            && IsEgg == other.IsEgg
            && IsShiny == other.IsShiny
            && Location == other.Location
            && Levels.SetEquals(other.Levels)
            && AbilitiesAllowed == other.AbilitiesAllowed;
    }

    public override int GetHashCode()
    {
        var hash = new HashCode();

        foreach (var f in Forms.Order())
            hash.Add(f);
        hash.Add(EncounterType);
        hash.Add(EncounterWithMethod);
        hash.Add(IsEgg);
        hash.Add(IsShiny);
        hash.Add(Location);
        foreach (var l in Levels.Order())
            hash.Add(l);
        hash.Add(AbilitiesAllowed);

        return hash.ToHashCode();
    }
};

public record DexLevelRange(byte LevelMin, byte LevelMax);
