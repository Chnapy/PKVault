using PKHeX.Core;

public class Dex9SVService : DexGenService<SAV9SV>
{
    protected override DexItemForm GetDexItemForm(ushort species, SAV9SV save, List<PKM> ownedPkms, byte form, Gender gender)
    {
        var pi = save.Personal.GetFormEntry(species, form);

        var kitamakiEntry = save.Zukan.DexKitakami.Get(species);
        var paldeaEntry = save.Zukan.DexPaldea.Get(species);

        var isSeenM = kitamakiEntry.GetIsGenderSeen(0) || kitamakiEntry.GetIsGenderSeen(2) || paldeaEntry.GetIsGenderSeen(0) || paldeaEntry.GetIsGenderSeen(2);
        var isSeenF = kitamakiEntry.GetIsGenderSeen(1) || paldeaEntry.GetIsGenderSeen(1);

        var isOwned = ownedPkms.Count > 0;
        var isSeen = isOwned || (gender == Gender.Female ? isSeenF : isSeenM);
        var isOwnedShiny = ownedPkms.Any(pkm => pkm.IsShiny);
        var isSeenShiny = isOwnedShiny || paldeaEntry.GetSeenIsShiny();

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
            IsCaught = ownedPkms.Count > 0 || save.GetCaught(species),
            IsOwned = isOwned,
            IsOwnedShiny = isOwnedShiny,
        };
    }
}
