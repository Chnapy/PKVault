using PKHeX.Core;

public class Dex7Service(SAV7 save) : DexGenService(save)
{
    private readonly LanguageID[] AllLanguages = [
        LanguageID.Japanese, LanguageID.English, LanguageID.French, LanguageID.Italian, LanguageID.German, LanguageID.Spanish, LanguageID.Korean,
        LanguageID.ChineseS, LanguageID.ChineseT
    ];

    protected override DexItemForm GetDexItemForm(ushort species, bool isOwned, bool isOwnedShiny, byte form, Gender gender)
    {
        var pi = save.Personal.GetFormEntry(species, form);

        var isCaught = isOwned || save.GetCaught(species);

        var isSeenShiny = isOwnedShiny || save.Zukan.GetSeen(species, gender == Gender.Female ? 3 : 2);
        var isSeen = isSeenShiny || isCaught || save.Zukan.GetSeen(species, gender == Gender.Female ? 1 : 0);

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
        return AllLanguages.Where((_, i) => save.Zukan.GetLanguageFlag(species - 1, i));
    }

    public override async Task EnableSpeciesForm(EnableSpeciesFormPayload payload)
    {
        if (!save.Personal.IsPresentInGame(payload.Species, payload.Form))
            return;

        if (payload.IsSeen)
        {
            save.Zukan.SetSeen(payload.Species, payload.Gender == Gender.Female ? 1 : 0, true);
            save.Zukan.SetDisplayed(payload.Species - 1, payload.Gender == Gender.Female ? 1 : 0, true);
        }

        if (payload.IsSeenShiny)
        {
            save.Zukan.SetSeen(payload.Species, payload.Gender == Gender.Female ? 3 : 2, true);
            save.Zukan.SetDisplayed(payload.Species - 1, payload.Gender == Gender.Female ? 3 : 2, true);
        }

        if (payload.IsCaught)
            save.Zukan.SetCaught(payload.Species, true);

        var safeLanguages = payload.Languages.Where(AllLanguages.Contains);
        if (!safeLanguages.Any())
        {
            safeLanguages = [GetSaveLanguage()];
        }

        foreach (var lang in safeLanguages)
        {
            var langIndex = AllLanguages.IndexOf(lang);
            save.Zukan.SetLanguageFlag(payload.Species - 1, langIndex, true);
        }
    }
}
