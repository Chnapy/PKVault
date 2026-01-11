using PKHeX.Core;

public class Dex7Service(SAV7 save) : DexGenService(save)
{
    protected override DexItemForm GetDexItemForm(ushort species, List<ImmutablePKM> ownedPkms, byte form, Gender gender)
    {
        var pi = save.Personal.GetFormEntry(species, form);

        var isOwned = ownedPkms.Count > 0;
        var isOwnedShiny = ownedPkms.Any(pkm => pkm.IsShiny);
        var isSeenShiny = isOwnedShiny || save.Zukan.GetSeen(species, gender == Gender.Female ? 3 : 2);
        var isSeen = isSeenShiny || isOwned || save.Zukan.GetSeen(species, gender == Gender.Female ? 1 : 0);

        return new DexItemForm
        {
            Form = form,
            Gender = gender,
            Types = GetTypes(pi),
            Abilities = GetAbilities(pi),
            BaseStats = GetBaseStats(pi),
            IsSeen = isSeen,
            IsSeenShiny = isSeenShiny,
            IsCaught = isSeen && save.GetCaught(species),
            IsOwned = isOwned,
            IsOwnedShiny = isOwnedShiny,
            // IsLangJa = save.Zukan.GetLanguageFlag(species - 1, 0),
            // IsLangEn = save.Zukan.GetLanguageFlag(species - 1, 1),
            // IsLangFr = save.Zukan.GetLanguageFlag(species - 1, 2),
            // IsLangIt = save.Zukan.GetLanguageFlag(species - 1, 3),
            // IsLangDe = save.Zukan.GetLanguageFlag(species - 1, 4),
            // IsLangEs = save.Zukan.GetLanguageFlag(species - 1, 5),
            // IsLangKo = save.Zukan.GetLanguageFlag(species - 1, 6),
            // IsLangCh = save.Zukan.GetLanguageFlag(species - 1, 7),
            // IsLangCh2 = save.Zukan.GetLanguageFlag(species - 1, 8)
        };
    }

    public override void EnableSpeciesForm(ushort species, byte form, Gender gender, bool isSeen, bool isSeenShiny, bool isCaught)
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
