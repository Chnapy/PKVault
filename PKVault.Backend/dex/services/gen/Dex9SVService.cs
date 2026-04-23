using PKHeX.Core;

public class Dex9SVService(SAV9SV save) : DexGenService(save)
{
    private readonly LanguageID[] AllLanguages = [
        LanguageID.Japanese, LanguageID.English, LanguageID.French, LanguageID.Italian, LanguageID.German, LanguageID.Spanish, LanguageID.Korean,
        LanguageID.ChineseS, LanguageID.ChineseT
    ];

    protected override DexItemForm GetDexItemForm(ushort species, bool isOwned, bool isOwnedShiny, byte form, Gender gender)
    {
        var pi = save.Personal.GetFormEntry(species, form);

        bool isSeen;
        bool isSeenShiny;
        bool isCaught;

        byte formToUse = species == (ushort)Species.Alcremie
            ? (byte)(form / 7)
            : form;

        if (save.SaveRevision == 0)
        // paldea
        {
            var dex = save.Zukan.DexPaldea;
            var entry = dex.Get(species);

            var isFormSeen = entry.GetIsFormSeen(formToUse);

            var isSeenM = entry.GetIsGenderSeen(0) || entry.GetIsGenderSeen(2);
            var isSeenF = entry.GetIsGenderSeen(1);

            isCaught = isOwned || save.GetCaught(species);
            isSeenShiny = isOwnedShiny || entry.GetSeenIsShiny();
            isSeen = isCaught || isSeenShiny || (isFormSeen && (gender == Gender.Female ? isSeenF : isSeenM));
        }
        // kitami
        else
        {
            var dex = save.Zukan.DexKitakami;
            var entry = dex.Get(species);

            var isFormSeen = entry.GetSeenForm(formToUse);
            var isFormCaught = entry.GetObtainedForm(formToUse);

            var isSeenM = entry.GetIsGenderSeen(0) || entry.GetIsGenderSeen(2);
            var isSeenF = entry.GetIsGenderSeen(1);

            isCaught = isOwned || isFormCaught;
            isSeenShiny = isOwnedShiny || entry.GetIsModelSeen(true);
            isSeen = isCaught || isSeenShiny || (isFormSeen && (gender == Gender.Female ? isSeenF : isSeenM));
        }

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

        if (save.SaveRevision == 0)
        // paldea
        {
            return AllLanguages.Where((lang) =>
                save.Zukan.DexPaldea.Get(species).GetLanguageFlag(PokeDexEntry9Paldea.GetDexLangFlag((int)lang)));
        }
        // kitami
        else
        {
            return AllLanguages.Where((lang) =>
                save.Zukan.DexKitakami.Get(species).GetLanguageFlag(PokeDexEntry9Kitakami.GetDexLangFlag((int)lang)));
        }
    }

    public override async Task EnableSpeciesForm(EnableSpeciesFormPayload payload)
    {
        if (!save.Personal.IsPresentInGame(payload.Species, payload.Form) || payload.Species > save.MaxSpeciesID)
            return;

        byte formToUse = payload.Species == (ushort)Species.Alcremie
            ? (byte)(payload.Form / 7)
            : payload.Form;

        if (save.SaveRevision == 0)
        // paldea
        {
            var entry = save.Zukan.DexPaldea.Get(payload.Species);
            if (!entry.IsKnown)
                entry.SetDisplayIsNew();

            if (payload.IsSeen)
            {
                entry.SetSeen(true);
                entry.SetIsFormSeen(formToUse, true);
                entry.SetIsGenderSeen((byte)payload.Gender, true);
                entry.SetDisplayForm(formToUse);
                entry.SetDisplayGender((byte)payload.Gender);
            }

            if (payload.IsSeenShiny)
            {
                entry.SetDisplayIsShiny();
                entry.SetSeenIsShiny();
            }

            if (payload.IsCaught)
                entry.SetCaught(true);

            var safeLanguages = payload.Languages.Where(AllLanguages.Contains);
            if (!safeLanguages.Any())
            {
                safeLanguages = [GetSaveLanguage()];
            }

            foreach (var lang in safeLanguages)
            {
                entry.SetLanguageFlag(PokeDexEntry9Paldea.GetDexLangFlag((int)lang), true);
            }
        }
        // kitami
        else
        {
            var entry = save.Zukan.DexKitakami.Get(payload.Species);

            if (payload.IsSeen)
            {
                entry.SetSeenForm(formToUse, true);
                entry.SetHeardForm(formToUse, true);
                entry.SetIsGenderSeen((byte)payload.Gender, true);
            }

            if (payload.IsSeenShiny)
                entry.SetIsModelSeen(true, true);

            if (payload.IsCaught)
                entry.SetObtainedForm(formToUse, true);

            var safeLanguages = payload.Languages.Where(AllLanguages.Contains);
            if (!safeLanguages.Any())
            {
                safeLanguages = [GetSaveLanguage()];
            }

            foreach (var lang in safeLanguages)
            {
                entry.SetLanguageFlag(PokeDexEntry9Kitakami.GetDexLangFlag((int)lang), true);
            }
        }
    }
}
