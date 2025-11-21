using PKHeX.Core;

public class Dex9ZAService : DexGenService<SAV9ZA>
{
    protected override DexItemForm GetDexItemForm(ushort species, SAV9ZA save, List<PKM> ownedPkms, byte form, Gender gender)
    {
        var pi = save.Personal.GetFormEntry(species, form);

        var isOwned = ownedPkms.Count > 0;
        var isOwnedShiny = ownedPkms.Any(pkm => pkm.IsShiny);

        var entry = save.Zukan.GetEntry(species);

        var isSeenShiny = isOwnedShiny || entry.GetIsShinySeen(form);

        var isSeenM = entry.GetIsGenderSeen(0) || entry.GetIsGenderSeen(2);
        var isSeenF = entry.GetIsGenderSeen(1);

        var isSeen = isOwned || isSeenShiny || (entry.GetIsFormSeen(form) && (gender == Gender.Female ? isSeenF : isSeenM));
        var isCaught = isSeen && (isOwned || entry.GetIsFormCaught(form));

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
