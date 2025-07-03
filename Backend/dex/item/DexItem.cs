using PKHeX.Core;

public class DexItem
{
    public static DexItem fromSaveFile7b(SAV7b sav, ushort species)
    {
        var allPkms = sav.GetAllPKM();
        var ownedPkm = allPkms.Find(pkm => pkm.Species == species);

        var pi = sav.Personal[species];

        // Console.WriteLine(JsonSerializer.Serialize(saveFile, new JsonSerializerOptions
        // {
        //     WriteIndented = true,
        //     TypeInfoResolver = new DefaultJsonTypeInfoResolver()
        // }));
        // Console.WriteLine("SaveFile: " + sav.Generation
        // + " " + allPkms.Count
        // + " " + sav.MaxSpeciesID
        //  + " " + $"{6:000}-{GameInfo.Strings.Species[6]}"
        //  + " " + sav.GetCaught(6)
        //  + " " + sav.Personal[6].Type1
        //  + " " + sav.Zukan.GetLanguageFlag(6, 2)
        //  + " " + sav.Zukan.GetSeen(6, 1)
        //  + " " + sav.IsShiny(6));

        return new DexItem
        {
            Species = species,
            Generation = sav.Generation,
            SpeciesName = GameInfo.Strings.Species[species],
            Type1 = pi.Type1,
            Type2 = pi.Type2,
            IsOnlyMale = pi.OnlyMale,
            IsOnlyFemale = pi.OnlyFemale,
            IsGenderless = pi.Genderless,
            IsSeenM = sav.Zukan.GetSeen(species, 0),
            IsSeenF = sav.Zukan.GetSeen(species, 1),
            IsSeenMS = sav.Zukan.GetSeen(species, 2),
            IsSeenFS = sav.Zukan.GetSeen(species, 3),
            IsCaught = sav.GetCaught(species),
            IsOwned = ownedPkm != null,
            IsLangJa = sav.Zukan.GetLanguageFlag(species - 1, 0),
            IsLangEn = sav.Zukan.GetLanguageFlag(species - 1, 1),
            IsLangFr = sav.Zukan.GetLanguageFlag(species - 1, 2),
            IsLangIt = sav.Zukan.GetLanguageFlag(species - 1, 3),
            IsLangDe = sav.Zukan.GetLanguageFlag(species - 1, 4),
            IsLangEs = sav.Zukan.GetLanguageFlag(species - 1, 5),
            IsLangKo = sav.Zukan.GetLanguageFlag(species - 1, 6),
            IsLangCh = sav.Zukan.GetLanguageFlag(species - 1, 7),
            IsLangCh2 = sav.Zukan.GetLanguageFlag(species - 1, 8)
        };
    }

    public ushort Species { get; set; }
    public byte Generation { get; set; }
    public string SpeciesName { get; set; }
    public byte Type1 { get; set; }
    public byte Type2 { get; set; }
    public bool IsOnlyMale { get; set; }
    public bool IsOnlyFemale { get; set; }
    public bool IsGenderless { get; set; }
    public bool IsSeenM { get; set; }
    public bool IsSeenF { get; set; }
    public bool IsSeenMS { get; set; }
    public bool IsSeenFS { get; set; }
    // public bool IsAnySeen { get; set; }
    // public bool IsDisplayedM { get; set; }
    // public bool IsDisplayedF { get; set; }
    // public bool IsDisplayedMS { get; set; }
    // public bool IsDisplayedFS { get; set; }
    // public bool IsAnyDisplayed { get; set; }
    public bool IsCaught { get; set; }
    public bool IsOwned { get; set; }
    public bool IsLangJa { get; set; }
    public bool IsLangEn { get; set; }
    public bool IsLangFr { get; set; }
    public bool IsLangIt { get; set; }
    public bool IsLangDe { get; set; }
    public bool IsLangEs { get; set; }
    public bool IsLangKo { get; set; }
    public bool IsLangCh { get; set; }
    public bool IsLangCh2 { get; set; }
}
