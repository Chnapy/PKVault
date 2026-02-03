using PKHeX.Core;

public class Dex8SWSHService(SAV8SWSH save) : DexGenService(save)
{
    private readonly LanguageID[] AllLanguages = [
        LanguageID.Japanese, LanguageID.English, LanguageID.French, LanguageID.Italian, LanguageID.German, LanguageID.Spanish, LanguageID.Korean,
        LanguageID.ChineseS, LanguageID.ChineseT
    ];

    protected override DexItemForm GetDexItemForm(ushort species, bool isOwned, bool isOwnedShiny, byte form, Gender gender)
    {
        var Dex = save.Blocks.Zukan;

        var pi = save.Personal.GetFormEntry(species, form);

        var isSeenForm = Dex.GetSeenRegion(species, form, gender == Gender.Female ? 1 : 0);
        var isSeenShinyForm = Dex.GetSeenRegion(species, form, gender == Gender.Female ? 3 : 2);

        var isSeenShiny = isOwnedShiny || isSeenShinyForm;
        var isSeen = isOwned || isSeenShiny || isSeenForm;

        return new DexItemForm(
            Id: DexLoader.GetId(species, form, gender),
            Species: species,
            Form: form,
            Gender: gender,
            Types: GetTypes(pi),
            Abilities: GetAbilities(pi),
            BaseStats: GetBaseStats(pi),
            IsSeen: isSeen,
            IsSeenShiny: isSeenShiny,
            IsCaught: isSeen && (isOwned || Dex.GetCaught(species)),
            IsOwned: isOwned,
            IsOwnedShiny: isOwnedShiny
        );
    }

    protected override IEnumerable<LanguageID> GetDexLanguages(ushort species)
    {
        return AllLanguages.Where((lang) => save.Blocks.Zukan.GetIsLanguageObtained(species, (int)lang));
    }

    public override async Task EnableSpeciesForm(ushort species, byte form, Gender gender, bool isSeen, bool isSeenShiny, bool isCaught, LanguageID[] languages)
    {
        if (!save.Personal.IsPresentInGame(species, form))
            return;

        if (isSeen)
        {
            save.Blocks.Zukan.SetSeenRegion(species, form, gender == Gender.Female ? 1 : 0, true);
            save.Blocks.Zukan.SetFormDisplayed(species, form);
            save.Blocks.Zukan.SetGenderDisplayed(species, gender == Gender.Female ? (uint)1 : 0);
        }

        if (isSeenShiny)
        {
            save.Blocks.Zukan.SetSeenRegion(species, form, gender == Gender.Female ? 3 : 2, true);
            save.Blocks.Zukan.SetDisplayShiny(species);
        }

        if (isCaught)
            save.Blocks.Zukan.SetCaught(species, true);

        var safeLanguages = languages.Where(AllLanguages.Contains);
        if (!safeLanguages.Any())
        {
            safeLanguages = [GetSaveLanguage()];
        }

        foreach (var lang in safeLanguages)
        {
            save.Blocks.Zukan.SetIsLanguageObtained(species, (int)lang);
        }
    }
}
