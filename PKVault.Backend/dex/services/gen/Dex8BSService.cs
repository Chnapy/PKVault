using PKHeX.Core;

public class Dex8BSService : DexGenService<SAV8BS>
{
    protected override DexItemForm GetDexItemForm(ushort species, SAV8BS save, List<PKM> ownedPkms, byte form, Gender gender)
    {
        var pi = save.Personal.GetFormEntry(species, form);

        save.Zukan.GetGenderFlags(species, out var isSeenM, out var isSeenF, out var isSeenMS, out var isSeenFS);

        var isOwned = ownedPkms.Count > 0;
        var isSeen = isOwned || (gender == Gender.Female ? isSeenF : isSeenM);
        var isOwnedShiny = ownedPkms.Any(pkm => pkm.IsShiny);
        var isSeenShiny = isOwnedShiny || (gender == Gender.Female ? isSeenFS : isSeenMS);

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
            IsCaught = save.GetCaught(species),
            IsOwned = isOwned,
            IsOwnedShiny = isOwnedShiny,
        };
    }
}
