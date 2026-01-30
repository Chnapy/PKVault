using PKHeX.Core;

public class Dex4Service(SAV4 save) : DexGenService(save)
{
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

    public override async Task EnableSpeciesForm(ushort species, byte form, Gender gender, bool isSeen, bool isSeenShiny, bool isCaught)
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
