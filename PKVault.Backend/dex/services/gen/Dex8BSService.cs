using PKHeX.Core;

public class Dex8BSService(SAV8BS save) : DexGenService(save)
{
    protected override DexItemForm GetDexItemForm(ushort species, List<PKM> ownedPkms, byte form, Gender gender)
    {
        var pi = save.Personal.GetFormEntry(species, form);

        var dex = save.Zukan;

        var state = dex.GetState(species);

        var formCount = Zukan8b.GetFormCount(species);

        dex.GetGenderFlags(species, out var isSeenM, out var isSeenF, out var isSeenMS, out var isSeenFS);

        var isOwned = ownedPkms.Count > 0;
        var isOwnedShiny = ownedPkms.Any(pkm => pkm.IsShiny);

        var isSeenBase = gender == Gender.Female ? isSeenF : isSeenM;
        var isSeenShinyBase = gender == Gender.Female ? isSeenFS : isSeenMS;

        var isSeenForm = formCount > 0 && dex.GetHasFormFlag(species, form, false);
        var isSeenShinyForm = formCount > 0 && dex.GetHasFormFlag(species, form, true);

        var isSeenShiny = isOwnedShiny || (formCount > 0 ? isSeenShinyForm : isSeenShinyBase);
        var isSeen = isSeenShiny || isOwned || (formCount > 0 ? isSeenForm : isSeenBase);

        var isCaught = isSeen && state == ZukanState8b.Caught;

        return new DexItemForm
        {
            Form = form,
            Gender = gender,
            Types = GetTypes(pi),
            Abilities = GetAbilities(pi),
            BaseStats = GetBaseStats(pi),
            IsSeen = isSeen,
            IsSeenShiny = isSeenShiny,
            IsCaught = isCaught,
            IsOwned = isOwned,
            IsOwnedShiny = isOwnedShiny,
        };
    }

    public override void EnableSpeciesForm(ushort species, byte form, Gender gender, bool isSeen, bool isSeenShiny, bool isCaught)
    {
        if (!save.Personal.IsPresentInGame(species, form))
            return;

        var pk = new PK8
        {
            Species = species,
            Form = form,
            Gender = (byte)gender,
            Language = save.Language
        };
        pk.SetIsShiny(isSeenShiny);

        if (isSeen || isCaught)
            save.Zukan.SetDex(pk);

        if (isSeen)
            save.Zukan.SetState(species, ZukanState8b.Seen);

        if (isCaught)
            save.Zukan.SetState(species, ZukanState8b.Caught);

        var formCount = Zukan8b.GetFormCount(species);

        if (formCount > 0)
        {
            if (isSeen)
                save.Zukan.SetHasFormFlag(species, form, false, true);

            if (isSeenShiny)
                save.Zukan.SetHasFormFlag(species, form, true, true);
        }
    }
}
