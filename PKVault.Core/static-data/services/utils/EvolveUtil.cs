using PKHeX.Core;

namespace PKVault.Core;

/**
 * Helpers to walk an evolution chain using StaticEvolvesData.
 */
public static class EvolveUtil
{
    /**
     * Walk PreviousSpecies up to the root of the evolution chain.
     * Note: Shedinja is created from Ninjask exact same data, so it's treated as its own root.
     */
    public static ushort GetBaseSpecies(Dictionary<ushort, StaticEvolve> evolves, ushort species)
    {
        if (species == 0
            || species == (ushort)PKHeX.Core.Species.Shedinja
        )
        {
            return species;
        }

        var previousSpecies = evolves[species].PreviousSpecies;
        if (previousSpecies != null)
        {
            return GetBaseSpecies(evolves, (ushort)previousSpecies);
        }
        return species;
    }

    /**
     * True if species is ancestor itself, or a descendant of it through the evolution chain.
     */
    public static bool IsSameOrDescendantOf(Dictionary<ushort, StaticEvolve> evolves, ushort ancestor, ushort species)
    {
        if (species == ancestor)
        {
            return true;
        }

        if (species == 0
            || species == (ushort)PKHeX.Core.Species.Shedinja
        )
        {
            return false;
        }

        var previousSpecies = evolves[species].PreviousSpecies;
        if (previousSpecies == null)
        {
            return false;
        }

        return IsSameOrDescendantOf(evolves, ancestor, (ushort)previousSpecies);
    }
}
