using PKHeX.Core;

public class Dex9ZAService(SAV9ZA save) : DexGenService(save)
{
    protected override DexItemForm GetDexItemForm(ushort species, List<ImmutablePKM> ownedPkms, byte form, Gender gender)
    {
        var pi = save.Personal.GetFormEntry(species, form);

        var isOwned = ownedPkms.Count > 0;
        var isOwnedShiny = ownedPkms.Any(pkm => pkm.IsShiny);

        var entry = save.Zukan.GetEntry(species);

        var isSeenShiny = isOwnedShiny || entry.GetIsShinySeen(form);

        var isSeenM = entry.GetIsGenderSeen(0) || entry.GetIsGenderSeen(2);
        var isSeenF = entry.GetIsGenderSeen(1);

        var isSeen = isOwned || isSeenShiny || (entry.GetIsFormSeen(form) && (gender == Gender.Female ? isSeenF : isSeenM));
        var isCaught = isSeen && (isOwned || entry.GetIsFormCaught(form));

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

        var entry = save.Zukan.GetEntry(species);

        if (isSeen)
        {
            entry.SetIsGenderSeen((byte)gender, true);
            entry.SetIsFormSeen(form, true);
        }

        if (isSeenShiny)
        {
            entry.SetIsShinySeen(form, true);
        }

        if (isCaught)
        {
            entry.SetIsFormCaught(form, true);
        }
    }
}
