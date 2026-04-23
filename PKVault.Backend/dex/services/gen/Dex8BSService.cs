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

        var isCaught = isOwned || state == ZukanState8b.Caught;

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
        return AllLanguages.Where((_, i) => save.Zukan.GetLanguageFlag(species, i));
    }

    public override async Task EnableSpeciesForm(EnableSpeciesFormPayload payload)
    {
        if (!save.Personal.IsPresentInGame(payload.Species, payload.Form))
            return;

        var pk = new PK8
        {
            Species = payload.Species,
            Form = payload.Form,
            Gender = (byte)payload.Gender,
            Language = save.Language
        };
        pk.SetIsShiny(payload.IsSeenShiny);

        if (payload.IsSeen || payload.IsCaught)
            save.Zukan.SetDex(pk);

        if (payload.IsSeen)
            save.Zukan.SetState(payload.Species, ZukanState8b.Seen);

        if (payload.IsCaught)
            save.Zukan.SetState(payload.Species, ZukanState8b.Caught);

        var formCount = Zukan8b.GetFormCount(payload.Species);

        if (formCount > 0)
        {
            if (payload.IsSeen)
                save.Zukan.SetHasFormFlag(payload.Species, payload.Form, false, true);

            if (payload.IsSeenShiny)
                save.Zukan.SetHasFormFlag(payload.Species, payload.Form, true, true);
        }

        var safeLanguages = payload.Languages.Where(AllLanguages.Contains);
        if (!safeLanguages.Any())
        {
            safeLanguages = [GetSaveLanguage()];
        }

        foreach (var lang in safeLanguages)
        {
            var langIndex = AllLanguages.IndexOf(lang);
            save.Zukan.SetLanguageFlag(payload.Species, langIndex, true);
        }
    }
}
