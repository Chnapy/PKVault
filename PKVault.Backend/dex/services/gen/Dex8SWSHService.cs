using PKHeX.Core;

public class Dex8SWSHService(SAV8SWSH save) : DexGenService(save)
{
    protected override DexItemForm GetDexItemForm(ushort species, List<ImmutablePKM> ownedPkms, byte form, Gender gender)
    {
        var Dex = save.Blocks.Zukan;

        var pi = save.Personal.GetFormEntry(species, form);

        var isOwned = ownedPkms.Count > 0;
        var isOwnedShiny = ownedPkms.Any(pkm => pkm.IsShiny);

        var isSeenForm = Dex.GetSeenRegion(species, form, gender == Gender.Female ? 1 : 0);
        var isSeenShinyForm = Dex.GetSeenRegion(species, form, gender == Gender.Female ? 3 : 2);

        var isSeenShiny = isOwnedShiny || isSeenShinyForm;
        var isSeen = isOwned || isSeenShiny || isSeenForm;

        return new DexItemForm(
            Form: form,
            Gender: gender,
            Types: GetTypes(pi),
            Abilities: GetAbilities(pi),
            BaseStats: GetBaseStats(pi),
            IsSeen: isSeen,
            IsSeenShiny: isSeenShiny,
            IsCaught: isSeen && (ownedPkms.Count > 0 || Dex.GetCaught(species)),
            IsOwned: isOwned,
            IsOwnedShiny: isOwnedShiny
        );
    }

    public override async Task EnableSpeciesForm(ushort species, byte form, Gender gender, bool isSeen, bool isSeenShiny, bool isCaught)
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
