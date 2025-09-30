using PKHeX.Core;

public class Dex7bService : DexGenService<SAV7b>
{
    protected override DexItemDTO CreateDexItem(ushort species, SAV7b save, List<PKM> ownedPkms)
    {
        var isOwnedShiny = ownedPkms.Any(pkm => pkm.IsShiny);

        var pi = save.Personal[species];

        var isSeenM = save.Zukan.GetSeen(species, 0);
        var isSeenF = save.Zukan.GetSeen(species, 1);
        var isSeenMS = save.Zukan.GetSeen(species, 2);
        var isSeenFS = save.Zukan.GetSeen(species, 3);
        var isAnySeen = isSeenM || isSeenF || isSeenMS || isSeenFS;

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
            IsSeenM = isSeenM,
            IsSeenF = isSeenF,
            IsSeenMS = isSeenMS,
            IsSeenFS = isSeenFS,
            IsAnySeen = isAnySeen,
            IsCaught = save.GetCaught(species),
            IsOwned = ownedPkms.Count > 0,
            IsOwnedShiny = isOwnedShiny,
            // IsLangJa = save.Zukan.GetLanguageFlag(species - 1, 0),
            // IsLangEn = save.Zukan.GetLanguageFlag(species - 1, 1),
            // IsLangFr = save.Zukan.GetLanguageFlag(species - 1, 2),
            // IsLangIt = save.Zukan.GetLanguageFlag(species - 1, 3),
            // IsLangDe = save.Zukan.GetLanguageFlag(species - 1, 4),
            // IsLangEs = save.Zukan.GetLanguageFlag(species - 1, 5),
            // IsLangKo = save.Zukan.GetLanguageFlag(species - 1, 6),
            // IsLangCh = save.Zukan.GetLanguageFlag(species - 1, 7),
            // IsLangCh2 = save.Zukan.GetLanguageFlag(species - 1, 8)
        };
    }
}
