using PKHeX.Core;

public class Dex7bService(SAV7b save) : DexGenService(save)
{
    protected override DexItemForm GetDexItemForm(ushort species, bool isOwned, bool isOwnedShiny, byte form, Gender gender)
    {
        var pi = save.Personal.GetFormEntry(species, form);

        var isSeenShiny = isOwnedShiny || save.Zukan.GetSeen(species, gender == Gender.Female ? 3 : 2);
        var isSeen = isSeenShiny || isOwned || save.Zukan.GetSeen(species, gender == Gender.Female ? 1 : 0);

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
            IsCaught: isSeen && save.GetCaught(species),
            IsOwned: isOwned,
            IsOwnedShiny: isOwnedShiny
        );
    }

    public override async Task EnableSpeciesForm(ushort species, byte form, Gender gender, bool isSeen, bool isSeenShiny, bool isCaught)
    {
        if (!save.Personal.IsPresentInGame(species, form))
            return;

        if (isSeen)
            save.Zukan.SetSeen(species, gender == Gender.Female ? 1 : 0, true);

        if (isSeenShiny)
            save.Zukan.SetSeen(species, gender == Gender.Female ? 3 : 2, true);

        if (isCaught)
            save.Zukan.SetCaught(species, true);
    }
}
