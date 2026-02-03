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

        var isSeen = isOwned || (forms.Length > 0 ? formSeen.Contains(form) : speciesSeen);

        return new DexItemForm(
            Id: DexLoader.GetId(species, form, gender),
            Species: species,
            Form: form,
            Gender: gender,
            Types: GetTypes(pi),
            Abilities: GetAbilities(pi),
            BaseStats: GetBaseStats(pi),
            IsSeen: isSeen,
            IsSeenShiny: false,
            IsCaught: isSeen && (isOwned || save.GetCaught(species)),
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

    public override async Task EnableSpeciesForm(ushort species, byte form, Gender gender, bool isSeen, bool isSeenShiny, bool isCaught, LanguageID[] languages)
    {
        if (!save.Personal.IsPresentInGame(species, form))
            return;

        if (isSeen)
        {
            save.Dex.SetSeen(species, true);
            save.Dex.SetSeenGender(species, (byte)gender);
        }

        if (isCaught)
            save.Dex.SetCaught(species, true);

        var forms = save.Dex.GetForms(species);
        if (!forms.Contains(form) && isSeen)
        {
            forms = [.. forms, form];
            // forms array should be cleaned (remove 255 values and duplicates)
            forms = [.. forms.Where(f => f != byte.MaxValue).Distinct().Order()];
            save.Dex.SetForms(species, forms);
        }

        if (isSeen)
        {
            SetDexForms(species, form, (byte)gender);
        }

        var safeLanguages = languages.Where(AllLanguages.Contains);
        if (!safeLanguages.Any())
        {
            safeLanguages = [GetSaveLanguage()];
        }

        foreach (var lang in safeLanguages)
        {
            var langIndex = AllLanguages.IndexOf(lang);
            save.Dex.SetLanguage(species, langIndex);
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
