using PKHeX.Core;

public class Dex4Service(SAV4 save) : DexGenService(save)
{
    public override DexItemForm GetDexItemForm(ushort species, List<PKM> ownedPkms, byte form, Gender gender)
    {
        var pi = save.Personal.GetFormEntry(species, form);

        Span<int> abilities = stackalloc int[pi.AbilityCount];
        pi.GetAbilities(abilities);

        int[] baseStats = [
            pi.GetBaseStatValue(0),
            pi.GetBaseStatValue(1),
            pi.GetBaseStatValue(2),
            pi.GetBaseStatValue(4),
            pi.GetBaseStatValue(5),
            pi.GetBaseStatValue(3),
        ];

        var forms = save.Dex.GetForms(species);

        var speciesSeen = save.Dex.GetSeen(species);
        var formSeen = forms.Where(f => speciesSeen && f != byte.MaxValue && f < forms.Length).Distinct().ToArray();

        var isOwned = ownedPkms.Count > 0;
        var isSeen = isOwned || (forms.Length > 0 ? formSeen.Contains(form) : speciesSeen);
        var isOwnedShiny = ownedPkms.Any(pkm => pkm.IsShiny);

        return new DexItemForm
        {
            Form = form,
            Gender = gender,
            Types = [pi.Type1, pi.Type2],
            Abilities = [.. abilities.ToArray().Distinct()],
            BaseStats = baseStats,
            IsSeen = isSeen,
            IsSeenShiny = false,
            IsCaught = isSeen && (isOwned || save.GetCaught(species)),
            IsOwned = isOwned,
            IsOwnedShiny = isOwnedShiny,
            // IsLangJa = save.Dex.HasLanguage(species) && save.Dex.GetLanguageBitIndex(species, 0),
            // IsLangEn = save.Dex.HasLanguage(species) && save.Dex.GetLanguageBitIndex(species, 1),
            // IsLangFr = save.Dex.HasLanguage(species) && save.Dex.GetLanguageBitIndex(species, 2),
            // IsLangIt = save.Dex.HasLanguage(species) && save.Dex.GetLanguageBitIndex(species, 3),
            // IsLangDe = save.Dex.HasLanguage(species) && save.Dex.GetLanguageBitIndex(species, 4),
            // IsLangEs = save.Dex.HasLanguage(species) && save.Dex.GetLanguageBitIndex(species, 5),
        };
    }

    public override void EnableSpeciesForm(ushort species, byte form, Gender gender, bool isSeen, bool isSeenShiny, bool isCaught)
    {
        if (!save.Personal.IsPresentInGame(species, form))
            return;

        if (isSeen)
            save.Dex.SetSeen(species, true);

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
    }
}
