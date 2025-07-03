using PKHeX.Core;

public class Dex7bService : DexGenService<SAV7b>
{
    protected override DexItem CreateDexItem(ushort species, SAV7b save, uint saveId)
    {

        var allPkms = save.GetAllPKM();
        var ownedPkm = allPkms.Find(pkm => pkm.Species == species);

        var pi = save.Personal[species];

        return new DexItem
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
            IsSeenM = save.Zukan.GetSeen(species, 0),
            IsSeenF = save.Zukan.GetSeen(species, 1),
            IsSeenMS = save.Zukan.GetSeen(species, 2),
            IsSeenFS = save.Zukan.GetSeen(species, 3),
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
