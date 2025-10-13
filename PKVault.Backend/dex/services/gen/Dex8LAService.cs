using PKHeX.Core;

public class Dex8LAService : DexGenService<SAV8LA>
{
    protected override DexItemForm GetDexItemForm(ushort species, SAV8LA save, List<PKM> ownedPkms, byte form, Gender gender)
    {
        var pi = save.Personal.GetFormEntry(species, form);

        var Dex = save.Blocks.PokedexSave;
        var seenWild = Dex.GetPokeSeenInWildFlags(species, form);
        var obtain = Dex.GetPokeObtainFlags(species, form);
        var caughtWild = Dex.GetPokeCaughtInWildFlags(species, form);

        var isOwned = ownedPkms.Count > 0;
        var isSeen = isOwned || seenWild != 0;
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
            IsCaught = ownedPkms.Count > 0 || caughtWild != 0 || obtain != 0,
            IsOwned = isOwned,
            IsOwnedShiny = isOwnedShiny,
        };
    }
}
