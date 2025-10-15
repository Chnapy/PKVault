using PKHeX.Core;

public class Dex8BSService : DexGenService<SAV8BS>
{
    protected override DexItemForm GetDexItemForm(ushort species, SAV8BS save, List<PKM> ownedPkms, byte form, Gender gender)
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
            IsCaught = isCaught,
            IsOwned = isOwned,
            IsOwnedShiny = isOwnedShiny,
        };
    }
}
