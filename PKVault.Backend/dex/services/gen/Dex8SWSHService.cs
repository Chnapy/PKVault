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

        // var isCaughtGigantamax = Dex.GetCaughtGigantamax1(species) || Dex.GetCaughtGigantamaxed(species);
        
        var isCaught = isOwned || Dex.GetCaught(species);
        var isSeenShiny = isOwnedShiny || isSeenShinyForm;
        var isSeen = isCaught || isSeenShiny || isSeenForm;

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
            IsSeenAlpha: false,
            IsCaught: isCaught,
            IsOwned: isOwned,
            IsOwnedShiny: isOwnedShiny
        );
    }

    protected override IEnumerable<LanguageID> GetDexLanguages(ushort species)
    {
        return AllLanguages.Where((lang) => save.Blocks.Zukan.GetIsLanguageObtained(species, (int)lang));
    }

    public override async Task EnableSpeciesForm(EnableSpeciesFormPayload payload)
    {
        if (!save.Personal.IsPresentInGame(payload.Species, payload.Form))
            return;

        if (payload.IsSeen)
        {
            save.Blocks.Zukan.SetSeenRegion(payload.Species, payload.Form, payload.Gender == Gender.Female ? 1 : 0, true);
            save.Blocks.Zukan.SetFormDisplayed(payload.Species, payload.Form);
            save.Blocks.Zukan.SetGenderDisplayed(payload.Species, payload.Gender == Gender.Female ? (uint)1 : 0);
        }

        if (payload.IsSeenShiny)
        {
            save.Blocks.Zukan.SetSeenRegion(payload.Species, payload.Form, payload.Gender == Gender.Female ? 3 : 2, true);
            save.Blocks.Zukan.SetDisplayShiny(payload.Species);
        }

        if (payload.IsCaught)
            save.Blocks.Zukan.SetCaught(payload.Species, true);

        var safeLanguages = payload.Languages.Where(AllLanguages.Contains);
        if (!safeLanguages.Any())
        {
            safeLanguages = [GetSaveLanguage()];
        }

        foreach (var lang in safeLanguages)
        {
            save.Blocks.Zukan.SetIsLanguageObtained(payload.Species, (int)lang);
        }
    }
}
