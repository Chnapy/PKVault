using PKHeX.Core;

public class Dex8LAService(SAV8LA save) : DexGenService(save)
{
    protected override DexItemForm GetDexItemForm(ushort species, bool isOwned, bool isOwnedShiny, byte form, Gender gender)
    {
        var pi = save.Personal.GetFormEntry(species, form);

        // if (species == 76)
        // {
        //     Console.WriteLine($"GROLEM {species}/{form}/{gender} types={pi.Type1}/{pi.Type2} forms.count={save.Personal[species].FormCount}");
        // }

        var dex = save.Blocks.PokedexSave;
        var seenWild = dex.GetPokeSeenInWildFlags(species, form);
        var obtain = dex.GetPokeObtainFlags(species, form);
        var caughtWild = dex.GetPokeCaughtInWildFlags(species, form);

        int[] baseGendersIndex = gender == Gender.Female ? [1, 3] : [0, 2];
        int[] shinyGendersIndex = gender == Gender.Female ? [5, 7] : [4, 6];

        var isCaughtShiny = isOwnedShiny || shinyGendersIndex.Any(i => (caughtWild & (1 << i)) != 0) || shinyGendersIndex.Any(i => (obtain & (1 << i)) != 0);
        var isCaught = isCaughtShiny || isOwned || baseGendersIndex.Any(i => (caughtWild & (1 << i)) != 0) || baseGendersIndex.Any(i => (obtain & (1 << i)) != 0);

        var isSeenShiny = isOwnedShiny || isCaughtShiny || shinyGendersIndex.Any(i => (seenWild & (1 << i)) != 0);
        var isSeen = isSeenShiny || isOwned || isCaught || baseGendersIndex.Any(i => (seenWild & (1 << i)) != 0);

        return new DexItemForm(
            Id: DexLoader.GetId(species, form, gender),
            Species: species,
            Form: form,
            Gender: gender,
            Types: GetTypes(pi),
            Abilities: GetAbilities(pi),
            BaseStats: GetBaseStats(pi),
            IsSeen: isSeen,
            IsSeenShiny: isSeenShiny,
            IsCaught: isCaught,
            IsOwned: isOwned,
            IsOwnedShiny: isOwnedShiny
        );
    }

    protected override IEnumerable<LanguageID> GetDexLanguages(ushort species)
    {
        return [];
    }

    public override async Task EnableSpeciesForm(ushort species, byte form, Gender gender, bool isSeen, bool isSeenShiny, bool isCaught, LanguageID[] languages)
    {
        if (!save.Personal.IsPresentInGame(species, form))
            return;

        int[] baseGendersIndex = gender == Gender.Female ? [1, 3] : [0, 2];
        int[] shinyGendersIndex = gender == Gender.Female ? [5, 7] : [4, 6];

        if (isSeen)
            save.Blocks.PokedexSave.SetPokeSeenInWildFlags(species, form, (byte)(1 << baseGendersIndex[0]));

        if (isSeenShiny)
            save.Blocks.PokedexSave.SetPokeSeenInWildFlags(species, form, (byte)(1 << shinyGendersIndex[0]));

        if (isCaught)
            save.Blocks.PokedexSave.SetPokeCaughtInWildFlags(species, form, (byte)(1 << baseGendersIndex[0]));

        // TODO isCaughtShiny
        // TODO alpha
    }
}
