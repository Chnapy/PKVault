using PKHeX.Core;

public class Dex8LAService(SAV8LA save) : DexGenService(save)
{
    protected override DexItemForm GetDexItemForm(ushort species, bool isOwned, bool isOwnedShiny, byte form, Gender gender)
    {
        var pi = save.Personal.GetFormEntry(species, form);

        // if (species == 76)
        // {
        //     log.LogInformation($"GROLEM {species}/{form}/{gender} types={pi.Type1}/{pi.Type2} forms.count={save.Personal[species].FormCount}");
        // }

        var dex = save.Blocks.PokedexSave;
        var seenWild = dex.GetPokeSeenInWildFlags(species, form);
        var obtain = dex.GetPokeObtainFlags(species, form);
        var caughtWild = dex.GetPokeCaughtInWildFlags(species, form);

        int[] baseGendersIndex = gender == Gender.Female ? [1, 3] : [0, 2];
        int[] shinyGendersIndex = gender == Gender.Female ? [5, 7] : [4, 6];
        int[] alphaGendersIndex = gender == Gender.Female ? [3, 7] : [2, 6];

        var isCaughtShiny = isOwnedShiny || shinyGendersIndex.Any(i => (caughtWild & (1 << i)) != 0) || shinyGendersIndex.Any(i => (obtain & (1 << i)) != 0);
        var isCaughtAlpha = alphaGendersIndex.Any(i => (caughtWild & (1 << i)) != 0) || alphaGendersIndex.Any(i => (obtain & (1 << i)) != 0);
        var isCaught = isCaughtShiny || isOwned || baseGendersIndex.Any(i => (caughtWild & (1 << i)) != 0) || baseGendersIndex.Any(i => (obtain & (1 << i)) != 0);

        var isSeenShiny = isOwnedShiny || isCaughtShiny || shinyGendersIndex.Any(i => (seenWild & (1 << i)) != 0);
        var isSeenAlpha = isCaughtAlpha || alphaGendersIndex.Any(i => (seenWild & (1 << i)) != 0);
        var isSeen = isSeenShiny || isCaught || baseGendersIndex.Any(i => (seenWild & (1 << i)) != 0);

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
            IsSeenAlpha: isSeenAlpha,
            IsCaught: isCaught,
            IsOwned: isOwned,
            IsOwnedShiny: isOwnedShiny
        );
    }

    protected override IEnumerable<LanguageID> GetDexLanguages(ushort species)
    {
        return [];
    }

    public override async Task EnableSpeciesForm(EnableSpeciesFormPayload payload)
    {
        if (!save.Personal.IsPresentInGame(payload.Species, payload.Form))
            return;

        int[] baseGendersIndex = payload.Gender == Gender.Female ? [1, 3] : [0, 2];
        int[] shinyGendersIndex = payload.Gender == Gender.Female ? [5, 7] : [4, 6];
        int[] alphaGendersIndex = payload.Gender == Gender.Female ? [3, 7] : [2, 6];

        if (payload.IsSeen)
            save.Blocks.PokedexSave.SetPokeSeenInWildFlags(payload.Species, payload.Form, (byte)(1 << baseGendersIndex[0]));

        if (payload.IsSeenShiny)
            save.Blocks.PokedexSave.SetPokeSeenInWildFlags(payload.Species, payload.Form, (byte)(1 << shinyGendersIndex[0]));

        if (payload.IsSeenAlpha)
            save.Blocks.PokedexSave.SetPokeSeenInWildFlags(payload.Species, payload.Form, (byte)(1 << alphaGendersIndex[0]));

        if (payload.IsCaught)
            save.Blocks.PokedexSave.SetPokeCaughtInWildFlags(payload.Species, payload.Form, (byte)(1 << baseGendersIndex[0]));
    }
}
