using PKHeX.Core;

public class Dex8BSService(SAV8BS save) : DexGenService(save)
{
    private readonly LanguageID[] AllLanguages = [
        LanguageID.Japanese, LanguageID.English, LanguageID.French, LanguageID.Italian, LanguageID.German, LanguageID.Spanish, LanguageID.Korean,
        LanguageID.ChineseS, LanguageID.ChineseT
    ];

    protected override DexItemForm GetDexItemForm(ushort species, bool isOwned, bool isOwnedShiny, byte form, Gender gender)
    {
        var pi = save.Personal.GetFormEntry(species, form);

        var dex = save.Zukan;

        var state = dex.GetState(species);

        var formCount = Zukan8b.GetFormCount(species);

        dex.GetGenderFlags(species, out var isSeenM, out var isSeenF, out var isSeenMS, out var isSeenFS);

        var isSeenBase = gender == Gender.Female ? isSeenF : isSeenM;
        var isSeenShinyBase = gender == Gender.Female ? isSeenFS : isSeenMS;

        var isSeenForm = formCount > 0 && dex.GetHasFormFlag(species, form, false);
        var isSeenShinyForm = formCount > 0 && dex.GetHasFormFlag(species, form, true);

        var isSeenShiny = isOwnedShiny || (formCount > 0 ? isSeenShinyForm : isSeenShinyBase);
        var isSeen = isSeenShiny || isOwned || (formCount > 0 ? isSeenForm : isSeenBase);

        var isCaught = isSeen && state == ZukanState8b.Caught;

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
            IsCaught: isCaught,
            IsOwned: isOwned,
            IsOwnedShiny: isOwnedShiny
        );
    }

    protected override IEnumerable<LanguageID> GetDexLanguages(ushort species)
    {
        return AllLanguages.Where((_, i) => save.Zukan.GetLanguageFlag(species, i));
    }

    public override async Task EnableSpeciesForm(ushort species, byte form, Gender gender, bool isSeen, bool isSeenShiny, bool isCaught, LanguageID[] languages)
    {
        if (!save.Personal.IsPresentInGame(species, form))
            return;

        var pk = new PK8
        {
            Species = species,
            Form = form,
            Gender = (byte)gender,
            Language = save.Language
        };
        pk.SetIsShiny(isSeenShiny);

        if (isSeen || isCaught)
            save.Zukan.SetDex(pk);

        if (isSeen)
            save.Zukan.SetState(species, ZukanState8b.Seen);

        if (isCaught)
            save.Zukan.SetState(species, ZukanState8b.Caught);

        var formCount = Zukan8b.GetFormCount(species);

        if (formCount > 0)
        {
            if (isSeen)
                save.Zukan.SetHasFormFlag(species, form, false, true);

            if (isSeenShiny)
                save.Zukan.SetHasFormFlag(species, form, true, true);
        }

        var safeLanguages = languages.Where(AllLanguages.Contains);
        if (!safeLanguages.Any())
        {
            safeLanguages = [GetSaveLanguage()];
        }

        foreach (var lang in safeLanguages)
        {
            var langIndex = AllLanguages.IndexOf(lang);
            save.Zukan.SetLanguageFlag(species, langIndex, true);
        }
    }
}
