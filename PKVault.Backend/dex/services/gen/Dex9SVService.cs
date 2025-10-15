using PKHeX.Core;

public class Dex9SVService : DexGenService<SAV9SV>
{
    protected override DexItemForm GetDexItemForm(ushort species, SAV9SV save, List<PKM> ownedPkms, byte form, Gender gender)
    {
        var pi = save.Personal.GetFormEntry(species, form);

        var isOwned = ownedPkms.Count > 0;
        var isOwnedShiny = ownedPkms.Any(pkm => pkm.IsShiny);

        bool isSeen;
        bool isSeenShiny;
        bool isCaught;

        if (save.SaveRevision == 0)
        // paldea
        {
            var dex = save.Zukan.DexPaldea;
            var entry = dex.Get(species);

            var isFormSeen = entry.GetIsFormSeen(form);

            var isSeenM = entry.GetIsGenderSeen(0) || entry.GetIsGenderSeen(2);
            var isSeenF = entry.GetIsGenderSeen(1);

            isSeenShiny = isOwnedShiny || entry.GetSeenIsShiny();
            isSeen = isOwned || isSeenShiny || (isFormSeen && (gender == Gender.Female ? isSeenF : isSeenM));
            isCaught = isSeen && (isOwned || save.GetCaught(species));
        }
        // kitami
        else
        {
            var dex = save.Zukan.DexKitakami;
            var entry = dex.Get(species);

            var isFormSeen = entry.GetSeenForm(form);
            var isFormCaught = entry.GetObtainedForm(form);

            var isSeenM = entry.GetIsGenderSeen(0) || entry.GetIsGenderSeen(2);
            var isSeenF = entry.GetIsGenderSeen(1);

            isSeenShiny = isOwnedShiny || entry.GetIsModelSeen(true);
            isSeen = isOwned || isSeenShiny || (isFormSeen && (gender == Gender.Female ? isSeenF : isSeenM));
            isCaught = isSeen && (isOwned || isFormCaught);
        }

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
