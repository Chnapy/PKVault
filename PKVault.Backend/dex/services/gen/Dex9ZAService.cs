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
        var isSeenAlpha = entry.GetIsSeenAlpha();
        // var isSeenMega = entry.GetIsSeenMega(0) || entry.GetIsSeenMega(1) || entry.GetIsSeenMega(2);

        var isSeenM = entry.GetIsGenderSeen(0) || entry.GetIsGenderSeen(2);
        var isSeenF = entry.GetIsGenderSeen(1);

        var isCaught = isOwned || entry.GetIsFormCaught(form);
        var isSeen = isCaught || isSeenShiny || (entry.GetIsFormSeen(form) && (gender == Gender.Female ? isSeenF : isSeenM));

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
            IsSeenAlpha: isSeenAlpha,
            IsCaught: isCaught,
            IsOwned: isOwned,
            IsOwnedShiny: isOwnedShiny
        );
    }

    protected override IEnumerable<LanguageID> GetDexLanguages(ushort species)
    {
        return AllLanguages.Where((lang) => save.Zukan.GetEntry(species).GetLanguageFlag((int)lang));
    }

    public override async Task EnableSpeciesForm(EnableSpeciesFormPayload payload)
    {
        if (!save.Personal.IsPresentInGame(payload.Species, payload.Form))
            return;

        var entry = save.Zukan.GetEntry(payload.Species);

        if (payload.IsSeen)
        {
            entry.SetIsGenderSeen((byte)payload.Gender, true);
            entry.SetIsFormSeen(payload.Form, true);

            if (FormInfo.IsMegaForm(payload.Species, payload.Form))
                entry.SetIsSeenMega(0, true);

            if (Zukan9a.IsMegaFormXY(payload.Species, save.SaveRevision) || Zukan9a.IsMegaFormZA(payload.Species, save.SaveRevision))
                entry.SetIsSeenMega(1, true);
            else if (payload.Species is (ushort)Species.Magearna or (ushort)Species.Meowstic)
                entry.SetIsSeenMega(1, true);
            else if (payload.Species == (ushort)Species.Tatsugiri)
                entry.SetIsSeenMega(payload.Form < 3 ? payload.Form : (byte)Math.Clamp(payload.Form - 3, 0, 3), true);

            if (payload.IsSeenAlpha)
                entry.SetIsSeenAlpha(true);

            entry.DisplayForm = payload.Form;
            entry.SetDisplayGender(payload.Gender, payload.Species, payload.Form);

            if (Zukan9a.GetFormExtraFlags(payload.Species, out var value))
            {
                entry.SetIsFormsSeen(value);
                entry.SetIsFormsCaught(value);
            }
        }

        if (payload.IsSeenShiny)
        {
            entry.SetIsShinySeen(payload.Form, true);
            if (save.Zukan.GetFormExtraFlagsShinySeen(payload.Species, payload.Form, out var value))
                entry.SetIsShinySeen(value);

            entry.SetDisplayIsShiny(true);
        }

        if (payload.IsCaught)
        {
            entry.SetIsFormCaught(payload.Form, true);
        }

        var safeLanguages = payload.Languages.Where(AllLanguages.Contains);
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
