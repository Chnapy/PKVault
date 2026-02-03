using PKHeX.Core;

public class Dex7bService(SAV7b save) : DexGenService(save)
{
    private readonly LanguageID[] AllLanguages = [
        LanguageID.Japanese, LanguageID.English, LanguageID.French, LanguageID.Italian, LanguageID.German, LanguageID.Spanish, LanguageID.Korean,
        LanguageID.ChineseS, LanguageID.ChineseT
    ];

    protected override DexItemForm GetDexItemForm(ushort species, bool isOwned, bool isOwnedShiny, byte form, Gender gender)
    {
        var pi = save.Personal.GetFormEntry(species, form);

        var isSeenShiny = isOwnedShiny || save.Zukan.GetSeen(species, gender == Gender.Female ? 3 : 2);
        var isSeen = isSeenShiny || isOwned || save.Zukan.GetSeen(species, gender == Gender.Female ? 1 : 0);

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
        return AllLanguages.Where((_, i) => save.Zukan.GetLanguageFlag(species - 1, i));
    }

    public override async Task EnableSpeciesForm(ushort species, byte form, Gender gender, bool isSeen, bool isSeenShiny, bool isCaught, LanguageID[] languages)
    {
        if (!save.Personal.IsPresentInGame(species, form))
            return;

        if (isSeen)
            save.Zukan.SetSeen(species, gender == Gender.Female ? 1 : 0, true);

        if (isSeenShiny)
            save.Zukan.SetSeen(species, gender == Gender.Female ? 3 : 2, true);

        if (isCaught)
            save.Zukan.SetCaught(species, true);

        var safeLanguages = languages.Where(AllLanguages.Contains);
        if (!safeLanguages.Any())
        {
            safeLanguages = [GetSaveLanguage()];
        }

        foreach (var lang in safeLanguages)
        {
            var langIndex = AllLanguages.IndexOf(lang);
            save.Zukan.SetLanguageFlag(species - 1, langIndex, true);
        }
    }
}
