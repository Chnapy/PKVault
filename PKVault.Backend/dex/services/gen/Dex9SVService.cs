using PKHeX.Core;

public class Dex9SVService(SAV9SV save) : DexGenService(save)
{
    protected override DexItemForm GetDexItemForm(ushort species, bool isOwned, bool isOwnedShiny, byte form, Gender gender)
    {
        var pi = save.Personal.GetFormEntry(species, form);

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
            IsCaught: isCaught,
            IsOwned: isOwned,
            IsOwnedShiny: isOwnedShiny
        );
    }

    public override async Task EnableSpeciesForm(ushort species, byte form, Gender gender, bool isSeen, bool isSeenShiny, bool isCaught)
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
