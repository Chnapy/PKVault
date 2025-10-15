using PKHeX.Core;

public class Dex8LAService : DexGenService<SAV8LA>
{
    protected override DexItemForm GetDexItemForm(ushort species, SAV8LA save, List<PKM> ownedPkms, byte form, Gender gender)
    {
        var pi = save.Personal.GetFormEntry(species, form);

        var dex = save.Blocks.PokedexSave;
        var seenWild = dex.GetPokeSeenInWildFlags(species, form);
        var obtain = dex.GetPokeObtainFlags(species, form);
        var caughtWild = dex.GetPokeCaughtInWildFlags(species, form);

        var isOwned = ownedPkms.Count > 0;
        var isOwnedShiny = ownedPkms.Any(pkm => pkm.IsShiny);

        int[] baseGendersIndex = gender == Gender.Female ? [1, 3] : [0, 2];
        int[] shinyGendersIndex = gender == Gender.Female ? [5, 7] : [4, 6];

        var isCaughtShiny = isOwnedShiny || shinyGendersIndex.Any(i => (caughtWild & (1 << i)) != 0) || shinyGendersIndex.Any(i => (obtain & (1 << i)) != 0);
        var isCaught = isCaughtShiny || isOwned || baseGendersIndex.Any(i => (caughtWild & (1 << i)) != 0) || baseGendersIndex.Any(i => (obtain & (1 << i)) != 0);

        var isSeenShiny = isOwnedShiny || isCaughtShiny || shinyGendersIndex.Any(i => (seenWild & (1 << i)) != 0);
        var isSeen = isSeenShiny || isOwned || isCaught || baseGendersIndex.Any(i => (seenWild & (1 << i)) != 0);

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
