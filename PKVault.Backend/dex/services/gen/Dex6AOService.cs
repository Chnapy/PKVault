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

        var isSeenShiny = isOwnedShiny || (formCount > 0 ? isSeenShinyForm : isSeenShinyBase);
        var isSeen = isSeenShiny || isOwned || (formCount > 0 ? isSeenForm : isSeenBase);

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
            IsCaught: isSeen && save.GetCaught(species),
            IsOwned: isOwned,
            IsOwnedShiny: isOwnedShiny
        );
    }

    protected override IEnumerable<LanguageID> GetDexLanguages(ushort species)
    {
        return AllLanguages.Where((lang) => save.Zukan.GetLanguageFlag(species, lang));
    }

    public override async Task EnableSpeciesForm(ushort species, byte form, Gender gender, bool isSeen, bool isSeenShiny, bool isCaught, LanguageID[] languages)
    {
        if (!save.Personal.IsPresentInGame(species, form))
            return;

        if (isSeen)
        {
            save.Zukan.SetSeen(species, gender == Gender.Female ? 1 : 0);
            save.Zukan.SetDisplayed(species, gender == Gender.Female ? 1 : 0);
        }

        if (isSeenShiny)
        {
            save.Zukan.SetSeen(species, gender == Gender.Female ? 3 : 2);
            save.Zukan.SetDisplayed(species, gender == Gender.Female ? 3 : 2);
        }

        if (isCaught)
            save.Zukan.SetCaught(species, true);

        var (formIndex, formCount) = save.Zukan.GetFormIndex(species);

        if (formCount > 0)
        {
            if (isSeen)
            {
                save.Zukan.SetFormFlag(formIndex + form, 0, true);
                save.Zukan.SetFormDisplayed(formIndex, false);
            }

            if (isSeenShiny)
            {
                save.Zukan.SetFormFlag(formIndex + form, 1, true);
                save.Zukan.SetFormDisplayed(formIndex, true);
            }
        }

        var safeLanguages = languages.Where(AllLanguages.Contains);
        if (!safeLanguages.Any())
        {
            safeLanguages = [GetSaveLanguage()];
        }

        foreach (var lang in safeLanguages)
        {
            save.Zukan.SetLanguageFlag(species, lang);
        }
    }
}
