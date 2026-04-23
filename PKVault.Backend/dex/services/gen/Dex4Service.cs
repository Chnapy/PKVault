using PKHeX.Core;

public class Dex4Service(SAV4 save) : DexGenService(save)
{
    private readonly LanguageID[] AllLanguages = [LanguageID.Japanese, LanguageID.English, LanguageID.French, LanguageID.Italian, LanguageID.German, LanguageID.Spanish];

    protected override DexItemForm GetDexItemForm(ushort species, bool isOwned, bool isOwnedShiny, byte form, Gender gender)
    {
        var pi = save.Personal.GetFormEntry(species, form);

        var forms = save.Dex.GetForms(species);

        var speciesSeen = save.Dex.GetSeen(species);
        var formSeen = forms.Where(f => speciesSeen && f != byte.MaxValue && f < forms.Length).Distinct().ToArray();

        var isCaught = isOwned || save.GetCaught(species);
        var isSeen = isCaught || (forms.Length > 0 ? formSeen.Contains(form) : speciesSeen);

        return new DexItemForm(
            Id: DexLoader.GetId(species, form, gender),
            Species: species,
            Form: form,
            Gender: gender,
            Types: GetTypes(pi),
            Abilities: GetAbilities(pi),
            BaseStats: GetBaseStats(pi),
            IsSeen: isSeen,
            IsSeenShiny: isOwnedShiny,
            IsSeenAlpha: false,
            IsCaught: isCaught,
            IsOwned: isOwned,
            IsOwnedShiny: isOwnedShiny
        );
    }

    protected override IEnumerable<LanguageID> GetDexLanguages(ushort species)
    {
        return save.Dex.HasLanguage(species)
            ? AllLanguages.Where((_, i) => save.Dex.GetLanguageBitIndex(species, i))
            : [];
    }

    public override async Task EnableSpeciesForm(EnableSpeciesFormPayload payload)
    {
        if (!save.Personal.IsPresentInGame(payload.Species, payload.Form))
            return;

        if (payload.IsSeen)
        {
            save.Dex.SetSeen(payload.Species, true);
            save.Dex.SetSeenGender(payload.Species, (byte)payload.Gender);
        }

        if (payload.IsCaught)
            save.Dex.SetCaught(payload.Species, true);

        var forms = save.Dex.GetForms(payload.Species);
        if (!forms.Contains(payload.Form) && payload.IsSeen)
        {
            forms = [.. forms, payload.Form];
            // forms array should be cleaned (remove 255 values and duplicates)
            forms = [.. forms.Where(f => f != byte.MaxValue).Distinct().Order()];
            save.Dex.SetForms(payload.Species, forms);
        }

        if (payload.IsSeen)
        {
            SetDexForms(payload.Species, payload.Form, (byte)payload.Gender);
        }

        var safeLanguages = payload.Languages.Where(AllLanguages.Contains);
        if (!safeLanguages.Any())
        {
            safeLanguages = [GetSaveLanguage()];
        }

        foreach (var lang in safeLanguages)
        {
            var langIndex = AllLanguages.IndexOf(lang);
            save.Dex.SetLanguage(payload.Species, langIndex);
        }
    }

    private void SetDexForms(ushort species, byte form, byte gender)
    {
        static bool TryInsertForm(Span<byte> forms, byte form)
        {
            if (forms.IndexOf(form) >= 0)
                return false; // already in list

            var FORM_NONE = byte.MaxValue;

            // insert at first empty
            var index = forms.IndexOf(FORM_NONE);
            if (index < 0)
                return false; // no free slots?

            forms[index] = form;
            return true;
        }

        if (species == (ushort)Species.Unown)
        {
            save.Dex.AddUnownForm(form);
            return;
        }

        var forms = save.Dex.GetForms(species);
        if (forms.Length == 0)
            return;

        if (species == (ushort)Species.Pichu && save is SAV4HGSS)
        {
            var formID = form == 1 ? (byte)2 : gender;
            if (TryInsertForm(forms, formID))
                save.Dex.SetForms(species, forms);
        }
        else
        {
            if (TryInsertForm(forms, form))
                save.Dex.SetForms(species, forms);
        }
    }
}
