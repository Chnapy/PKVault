using PKHeX.Core;

public class Dex9SVService : DexGenService<SAV9SV>
{
    protected override DexItemDTO CreateDexItem(ushort species, SAV9SV save, List<PKM> ownedPkms)
    {
        var isOwnedShiny = ownedPkms.Any(pkm => pkm.IsShiny);

        var pi = save.Personal[species];

        var isAnySeen = save.Zukan.GetSeen(species);

        Span<int> abilities = stackalloc int[pi.AbilityCount];
        pi.GetAbilities(abilities);

        int[] baseStats = [
            pi.GetBaseStatValue(0),
            pi.GetBaseStatValue(1),
            pi.GetBaseStatValue(2),
            pi.GetBaseStatValue(4),
            pi.GetBaseStatValue(5),
            pi.GetBaseStatValue(3),
        ];

        return new DexItemDTO
        {
            Id = $"{species}_{save.ID32}",
            Species = species,
            SaveId = save.ID32,
            Types = [pi.Type1, pi.Type2],
            Abilities = [.. abilities.ToArray().Distinct()],
            BaseStats = baseStats,
            IsOnlyMale = pi.OnlyMale,
            IsOnlyFemale = pi.OnlyFemale,
            IsGenderless = pi.Genderless,
            IsAnySeen = isAnySeen,
            IsCaught = save.GetCaught(species),
            IsOwned = ownedPkms.Count > 0,
            IsOwnedShiny = isOwnedShiny
        };
    }
}
