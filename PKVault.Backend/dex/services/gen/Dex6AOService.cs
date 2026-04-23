using PKHeX.Core;

public class Dex6AOService(SAV6AO save) : DexGenService(save)
{
    private readonly LanguageID[] AllLanguages = [LanguageID.Japanese, LanguageID.English, LanguageID.French, LanguageID.Italian, LanguageID.German, LanguageID.Spanish, LanguageID.Korean];

    protected override DexItemForm GetDexItemForm(ushort species, bool isOwned, bool isOwnedShiny, byte form, Gender gender)
    {
        var pi = save.Personal.GetFormEntry(species, form);

        var dex = save.Zukan;

        var (formIndex, formCount) = dex.GetFormIndex(species);

        var isSeenBase = dex.GetSeen(species, gender == Gender.Female ? 1 : 0);
        var isSeenShinyBase = dex.GetSeen(species, gender == Gender.Female ? 3 : 2);

        var isSeenForm = formCount > 0 && dex.GetFormFlag(formIndex + form, 0);
        var isSeenShinyForm = formCount > 0 && dex.GetFormFlag(formIndex + form, 1);
        
        var isCaught = isOwned || save.GetCaught(species);
        var isSeenShiny = isOwnedShiny || (formCount > 0 ? isSeenShinyForm : isSeenShinyBase);
        var isSeen = isSeenShiny || isCaught || (formCount > 0 ? isSeenForm : isSeenBase);

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
        return AllLanguages.Where((lang) => save.Zukan.GetLanguageFlag(species, lang));
    }

    public override async Task EnableSpeciesForm(EnableSpeciesFormPayload payload)
    {
        if (!save.Personal.IsPresentInGame(payload.Species, payload.Form))
            return;

        if (payload.IsSeen)
        {
            save.Zukan.SetSeen(payload.Species, payload.Gender == Gender.Female ? 1 : 0);
            save.Zukan.SetDisplayed(payload.Species, payload.Gender == Gender.Female ? 1 : 0);
        }

        if (payload.IsSeenShiny)
        {
            save.Zukan.SetSeen(payload.Species, payload.Gender == Gender.Female ? 3 : 2);
            save.Zukan.SetDisplayed(payload.Species, payload.Gender == Gender.Female ? 3 : 2);
        }

        if (payload.IsCaught)
            save.Zukan.SetCaught(payload.Species, true);

        var (formIndex, formCount) = save.Zukan.GetFormIndex(payload.Species);

        if (formCount > 0)
        {
            if (payload.IsSeen)
            {
                save.Zukan.SetFormFlag(formIndex + payload.Form, 0, true);
                save.Zukan.SetFormDisplayed(formIndex, false);
            }

            if (payload.IsSeenShiny)
            {
                save.Zukan.SetFormFlag(formIndex + payload.Form, 1, true);
                save.Zukan.SetFormDisplayed(formIndex, true);
            }
        }

        var safeLanguages = payload.Languages.Where(AllLanguages.Contains);
        if (!safeLanguages.Any())
        {
            safeLanguages = [GetSaveLanguage()];
        }

        foreach (var lang in safeLanguages)
        {
            save.Zukan.SetLanguageFlag(payload.Species, lang);
        }
    }
}
