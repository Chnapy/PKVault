using PKHeX.Core;

public class Dex9SVService(SAV9SV save) : DexGenService(save)
{
    protected override DexItemForm GetDexItemForm(ushort species, List<PKM> ownedPkms, byte form, Gender gender)
    {
        var pi = save.Personal.GetFormEntry(species, form);

        var isOwned = ownedPkms.Count > 0;
        var isOwnedShiny = ownedPkms.Any(pkm => pkm.IsShiny);

        bool isSeen;
        bool isSeenShiny;
        bool isCaught;

        byte formToUse = species == (ushort)Species.Alcremie
            ? (byte)(form / 7)
            : form;

        if (save.SaveRevision == 0)
        // paldea
        {
            var dex = save.Zukan.DexPaldea;
            var entry = dex.Get(species);

            var isFormSeen = entry.GetIsFormSeen(formToUse);

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

            var isFormSeen = entry.GetSeenForm(formToUse);
            var isFormCaught = entry.GetObtainedForm(formToUse);

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

    public override void EnableSpeciesForm(ushort species, byte form, Gender gender, bool isSeen, bool isSeenShiny, bool isCaught)
    {
        if (!save.Personal.IsPresentInGame(species, form))
            return;

        byte formToUse = species == (ushort)Species.Alcremie
            ? (byte)(form / 7)
            : form;

        if (save.SaveRevision == 0)
        // paldea
        {
            var entry = save.Zukan.DexPaldea.Get(species);

            if (isSeen)
            {
                entry.SetSeen(true);
                entry.SetIsFormSeen(formToUse, true);
                entry.SetIsGenderSeen((byte)gender, true);
            }

            if (isSeenShiny)
                entry.SetSeenIsShiny(true);

            if (isCaught)
                entry.SetCaught(true);
        }
        // kitami
        else
        {
            var entry = save.Zukan.DexKitakami.Get(species);

            if (isSeen)
            {
                entry.SetSeenForm(formToUse, true);
                entry.SetIsGenderSeen((byte)gender, true);
            }

            if (isSeenShiny)
                entry.SetIsModelSeen(true, true);

            if (isCaught)
                entry.SetObtainedForm(formToUse, true);
        }
    }
}
