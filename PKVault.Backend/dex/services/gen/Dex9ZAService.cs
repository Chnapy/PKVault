using PKHeX.Core;

public class Dex9ZAService(SAV9ZA save) : DexGenService(save)
{
    private readonly LanguageID[] AllLanguages = [
        LanguageID.Japanese, LanguageID.English, LanguageID.French, LanguageID.Italian, LanguageID.German, LanguageID.Spanish, LanguageID.Korean,
        LanguageID.ChineseS, LanguageID.ChineseT, LanguageID.SpanishL
    ];

    protected override DexItemForm GetDexItemForm(ushort species, bool isOwned, bool isOwnedShiny, byte form, Gender gender)
    {
        var pi = save.Personal.GetFormEntry(species, form);

        var entry = save.Zukan.GetEntry(species);

        var isSeenShiny = isOwnedShiny || entry.GetIsShinySeen(form);

        var isSeenM = entry.GetIsGenderSeen(0) || entry.GetIsGenderSeen(2);
        var isSeenF = entry.GetIsGenderSeen(1);

        var isSeen = isOwned || isSeenShiny || (entry.GetIsFormSeen(form) && (gender == Gender.Female ? isSeenF : isSeenM));
        var isCaught = isSeen && (isOwned || entry.GetIsFormCaught(form));

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
        return AllLanguages.Where((lang) => save.Zukan.GetEntry(species).GetLanguageFlag((int)lang));
    }

    public override async Task EnableSpeciesForm(ushort species, byte form, Gender gender, bool isSeen, bool isSeenShiny, bool isCaught, LanguageID[] languages)
    {
        if (!save.Personal.IsPresentInGame(species, form))
            return;

        var entry = save.Zukan.GetEntry(species);

        if (isSeen)
        {
            entry.SetIsGenderSeen((byte)gender, true);
            entry.SetIsFormSeen(form, true);

            if (FormInfo.IsMegaForm(species, form))
                entry.SetIsSeenMega(0, true);

            if (Zukan9a.IsMegaFormXY(species, save.SaveRevision) || Zukan9a.IsMegaFormZA(species, save.SaveRevision))
                entry.SetIsSeenMega(1, true);
            else if (species is (ushort)Species.Magearna or (ushort)Species.Meowstic)
                entry.SetIsSeenMega(1, true);
            else if (species == (ushort)Species.Tatsugiri)
                entry.SetIsSeenMega(form < 3 ? form : (byte)Math.Clamp(form - 3, 0, 3), true);

            // if (isAlpha)
            //     entry.SetIsSeenAlpha(true);

            entry.DisplayForm = form;
            entry.SetDisplayGender(gender, species, form);

            if (Zukan9a.GetFormExtraFlags(species, out var value))
            {
                entry.SetIsFormsSeen(value);
                entry.SetIsFormsCaught(value);
            }
        }

        if (isSeenShiny)
        {
            entry.SetIsShinySeen(form, true);
            if (save.Zukan.GetFormExtraFlagsShinySeen(species, form, out var value))
                entry.SetIsShinySeen(value);

            entry.SetDisplayIsShiny(true);
        }

        if (isCaught)
        {
            entry.SetIsFormCaught(form, true);
        }

        var safeLanguages = languages.Where(AllLanguages.Contains);
        if (!safeLanguages.Any())
        {
            safeLanguages = [GetSaveLanguage()];
        }

        foreach (var lang in safeLanguages)
        {
            entry.SetLanguageFlag((int)lang, true);
        }
    }
}
