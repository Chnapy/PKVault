using PKHeX.Core;

public class Dex8SWSHService : DexGenService<SAV8SWSH>
{
    protected override DexItemForm GetDexItemForm(ushort species, SAV8SWSH save, List<PKM> ownedPkms, byte form, Gender gender)
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
}
