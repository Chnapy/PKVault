using PKHeX.Core;

public class Dex123Service(SaveFile save) : DexGenService(save)
{
    protected override DexItemForm GetDexItemForm(ushort species, bool isOwned, bool isOwnedShiny, byte form, Gender gender)
    {
        var pi = save.Personal.GetFormEntry(species, form);

        var isSeen = isOwned || save.GetSeen(species);

        return new DexItemForm(
            Id: DexLoader.GetId(species, form, gender),
            Species: species,
            Form: form,
            Gender: gender,
            Types: GetTypes(pi),
            Abilities: GetAbilities(pi),
            BaseStats: GetBaseStats(pi),
            IsSeen: isSeen,
            IsSeenShiny: isOwnedShiny,
            IsSeenAlpha: false,
            IsCaught: isOwned || save.GetCaught(species),
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

        if (payload.IsSeen)
            save.SetSeen(payload.Species, true);

        if (payload.IsCaught)
            save.SetCaught(payload.Species, true);
    }
}
