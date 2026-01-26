using PKHeX.Core;

public class Dex5Service(SAV5 save) : DexGenService(save)
{
    protected override DexItemForm GetDexItemForm(ushort species, List<ImmutablePKM> ownedPkms, byte form, Gender gender)
    {
        var pi = save.Personal.GetFormEntry(species, form);

        var dex = save.Zukan;

        var (formIndex, formCount) = dex.GetFormIndex(species);

        var isOwned = ownedPkms.Count > 0;
        var isOwnedShiny = ownedPkms.Any(pkm => pkm.IsShiny);

        var isSeenBase = dex.GetSeen(species, gender == Gender.Female ? 1 : 0);
        var isSeenShinyBase = dex.GetSeen(species, gender == Gender.Female ? 3 : 2);

        var isSeenForm = formCount > 0 && dex.GetFormFlag(formIndex + form, 0);
        var isSeenShinyForm = formCount > 0 && dex.GetFormFlag(formIndex + form, 1);

        var isSeenShiny = isOwnedShiny || (formCount > 0 ? isSeenShinyForm : isSeenShinyBase);
        var isSeen = isSeenShiny || isOwned || (formCount > 0 ? isSeenForm : isSeenBase);

        return new DexItemForm(
            Form: form,
            Gender: gender,
            Types: GetTypes(pi),
            Abilities: GetAbilities(pi),
            BaseStats: GetBaseStats(pi),
            IsSeen: isSeen,
            IsSeenShiny: isSeenShiny,
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
            save.Zukan.SetSeen(species, gender == Gender.Female ? 1 : 0, true);

        if (isSeenShiny)
            save.Zukan.SetSeen(species, gender == Gender.Female ? 3 : 2, true);

        if (isCaught)
            save.Zukan.SetCaught(species, true);

        var (formIndex, formCount) = save.Zukan.GetFormIndex(species);

        if (formCount > 0)
        {
            if (isSeen)
                save.Zukan.SetFormFlag(formIndex + form, 0, true);

            if (isSeenShiny)
                save.Zukan.SetFormFlag(formIndex + form, 1, true);
        }
    }
}
