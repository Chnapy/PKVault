using PKHeX.Core;

public class Dex8SWSHService : DexGenService<SAV8SWSH>
{
    protected override DexItemForm GetDexItemForm(ushort species, SAV8SWSH save, List<PKM> ownedPkms, byte form, Gender gender)
    {
        var Dex = save.Blocks.Zukan;

        var pi = save.Personal.GetFormEntry(species, form);

        var isOwned = ownedPkms.Count > 0;
        var isSeen = isOwned || Dex.GetSeen(species);
        var isOwnedShiny = ownedPkms.Any(pkm => pkm.IsShiny);
        var isSeenShiny = isOwnedShiny;

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
            IsCaught = ownedPkms.Count > 0 || Dex.GetCaught(species),
            IsOwned = isOwned,
            IsOwnedShiny = isOwnedShiny,
        };
    }
}
