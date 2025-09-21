using PKHeX.Core;

public class Dex4Service : DexGenService<SAV4>
{
    protected override DexItemDTO CreateDexItem(ushort species, SAV4 save, List<PKM> ownedPkms)
    {
        var isOwnedShiny = ownedPkms.Any(pkm => pkm.IsShiny);

        var pi = save.Personal[species];

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
            IsAnySeen = save.Dex.GetSeen(species),
            IsCaught = save.Dex.GetCaught(species),
            IsOwned = ownedPkms.Count > 0,
            IsOwnedShiny = isOwnedShiny,
            IsLangJa = save.Dex.HasLanguage(species) && save.Dex.GetLanguageBitIndex(species, 0),
            IsLangEn = save.Dex.HasLanguage(species) && save.Dex.GetLanguageBitIndex(species, 1),
            IsLangFr = save.Dex.HasLanguage(species) && save.Dex.GetLanguageBitIndex(species, 2),
            IsLangIt = save.Dex.HasLanguage(species) && save.Dex.GetLanguageBitIndex(species, 3),
            IsLangDe = save.Dex.HasLanguage(species) && save.Dex.GetLanguageBitIndex(species, 4),
            IsLangEs = save.Dex.HasLanguage(species) && save.Dex.GetLanguageBitIndex(species, 5),
        };
    }
}
