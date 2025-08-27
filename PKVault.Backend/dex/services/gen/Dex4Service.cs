using PKHeX.Core;

public class Dex4Service : DexGenService<SAV4>
{
    protected override DexItemDTO CreateDexItem(ushort species, SAV4 save, uint saveId)
    {

        var allPkms = save.GetAllPKM();
        var ownedPkm = allPkms.Find(pkm => pkm.Species == species && !pkm.IsEgg);

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
            Id = $"{species}_{saveId}",
            Species = species,
            SaveId = saveId,
            SpeciesName = GameInfo.Strings.Species[species],
            Type1 = pi.Type1,
            Type2 = pi.Type2,
            Abilities = [.. abilities.ToArray().Distinct()],
            BaseStats = baseStats,
            IsOnlyMale = pi.OnlyMale,
            IsOnlyFemale = pi.OnlyFemale,
            IsGenderless = pi.Genderless,
            IsAnySeen = save.Dex.GetSeen(species),
            IsCaught = save.Dex.GetCaught(species),
            IsOwned = ownedPkm != null,
            IsLangJa = save.Dex.HasLanguage(species) && save.Dex.GetLanguageBitIndex(species, 0),
            IsLangEn = save.Dex.HasLanguage(species) && save.Dex.GetLanguageBitIndex(species, 1),
            IsLangFr = save.Dex.HasLanguage(species) && save.Dex.GetLanguageBitIndex(species, 2),
            IsLangIt = save.Dex.HasLanguage(species) && save.Dex.GetLanguageBitIndex(species, 3),
            IsLangDe = save.Dex.HasLanguage(species) && save.Dex.GetLanguageBitIndex(species, 4),
            IsLangEs = save.Dex.HasLanguage(species) && save.Dex.GetLanguageBitIndex(species, 5),
        };
    }
}
