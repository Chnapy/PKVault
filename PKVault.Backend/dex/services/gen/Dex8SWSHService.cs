using PKHeX.Core;

public class Dex8SWSHService(SAV8SWSH save) : DexGenService(save)
{
    public override DexItemForm GetDexItemForm(ushort species, List<PKM> ownedPkms, byte form, Gender gender)
    {
        var Dex = save.Blocks.Zukan;

        var pi = save.Personal.GetFormEntry(species, form);

        var isOwned = ownedPkms.Count > 0;
        var isOwnedShiny = ownedPkms.Any(pkm => pkm.IsShiny);

        var isSeenForm = Dex.GetSeenRegion(species, form, gender == Gender.Female ? 1 : 0);
        var isSeenShinyForm = Dex.GetSeenRegion(species, form, gender == Gender.Female ? 3 : 2);

        var isSeenShiny = isOwnedShiny || isSeenShinyForm;
        var isSeen = isOwned || isSeenShiny || isSeenForm;

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

        return new DexItemForm
        {
            Form = form,
            Gender = gender,
            Types = [pi.Type1, pi.Type2],
            Abilities = [.. abilities.ToArray().Distinct()],
            BaseStats = baseStats,
            IsSeen = isSeen,
            IsSeenShiny = isSeenShiny,
            IsCaught = isSeen && (ownedPkms.Count > 0 || Dex.GetCaught(species)),
            IsOwned = isOwned,
            IsOwnedShiny = isOwnedShiny,
        };
    }

    public override void EnableSpeciesForm(ushort species, byte form, Gender gender, bool isSeen, bool isSeenShiny, bool isCaught)
    {
        if (!save.Personal.IsPresentInGame(species, form))
            return;

        if (isSeen)
            save.Blocks.Zukan.SetSeenRegion(species, form, gender == Gender.Female ? 1 : 0, true);

        if (isSeenShiny)
            save.Blocks.Zukan.SetSeenRegion(species, form, gender == Gender.Female ? 3 : 2, true);

        if (isCaught)
            save.Blocks.Zukan.SetCaught(species, true);
    }
}
