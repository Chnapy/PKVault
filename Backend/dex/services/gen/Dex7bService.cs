using PKHeX.Core;

public class Dex7bService : DexGenService<SAV7b>
{
    protected override DexItemDTO CreateDexItem(ushort species, SAV7b save, uint saveId)
    {

        var allPkms = save.GetAllPKM();
        var ownedPkm = allPkms.Find(pkm => pkm.Species == species && !pkm.IsEgg);

        var pi = save.Personal[species];

        var isSeenM = save.Zukan.GetSeen(species, 0);
        var isSeenF = save.Zukan.GetSeen(species, 1);
        var isSeenMS = save.Zukan.GetSeen(species, 2);
        var isSeenFS = save.Zukan.GetSeen(species, 3);
        var isAnySeen = isSeenM || isSeenF || isSeenMS || isSeenFS;

        return new DexItemDTO
        {
            Id = $"{species}_{saveId}",
            Species = species,
            SaveId = saveId,
            SpeciesName = GameInfo.Strings.Species[species],
            Type1 = pi.Type1,
            Type2 = pi.Type2,
            IsOnlyMale = pi.OnlyMale,
            IsOnlyFemale = pi.OnlyFemale,
            IsGenderless = pi.Genderless,
            IsSeenM = isSeenM,
            IsSeenF = isSeenF,
            IsSeenMS = isSeenMS,
            IsSeenFS = isSeenFS,
            IsAnySeen = isAnySeen,
            IsCaught = save.GetCaught(species),
            IsOwned = ownedPkm != null,
            IsLangJa = save.Zukan.GetLanguageFlag(species - 1, 0),
            IsLangEn = save.Zukan.GetLanguageFlag(species - 1, 1),
            IsLangFr = save.Zukan.GetLanguageFlag(species - 1, 2),
            IsLangIt = save.Zukan.GetLanguageFlag(species - 1, 3),
            IsLangDe = save.Zukan.GetLanguageFlag(species - 1, 4),
            IsLangEs = save.Zukan.GetLanguageFlag(species - 1, 5),
            IsLangKo = save.Zukan.GetLanguageFlag(species - 1, 6),
            IsLangCh = save.Zukan.GetLanguageFlag(species - 1, 7),
            IsLangCh2 = save.Zukan.GetLanguageFlag(species - 1, 8)
        };
    }
}
