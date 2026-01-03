using PKHeX.Core;

public class Dex123Service(SaveFile save) : DexGenService(save)
{
    protected override DexItemForm GetDexItemForm(ushort species, List<PKM> ownedPkms, byte form, Gender gender)
    {
        var pi = save.Personal.GetFormEntry(species, form);

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

        var isOwned = ownedPkms.Count > 0;
        var isSeen = isOwned || save.GetSeen(species);
        var isOwnedShiny = ownedPkms.Any(pkm => pkm.IsShiny);

        return new DexItemForm
        {
            Form = form,
            Gender = gender,
            Types = [
                save.Generation <= 2 ? GetG12Type(pi.Type1) : pi.Type1,
                save.Generation <= 2 ? GetG12Type(pi.Type2) : pi.Type2
            ],
            Abilities = [.. abilities.ToArray().Distinct()],
            BaseStats = baseStats,
            IsSeen = isSeen,
            IsSeenShiny = false,    // TODO
            IsCaught = ownedPkms.Count > 0 || save.GetCaught(species),
            IsOwned = isOwned,
            IsOwnedShiny = isOwnedShiny,
        };
    }

    public override void EnableSpeciesForm(ushort species, byte form, Gender gender, bool isSeen, bool isSeenShiny, bool isCaught)
    {
        if (!save.Personal.IsPresentInGame(species, form))
            return;

        if (isSeen)
            save.SetSeen(species, true);

        if (isCaught)
            save.SetCaught(species, true);
    }

    public static byte GetG12Type(byte type)
    {
        return type switch
        {
            7 => 6,
            8 => 7,
            9 => 8,
            20 => 9,
            21 => 10,
            22 => 11,
            23 => 12,
            24 => 13,
            25 => 14,
            26 => 15,
            27 => 16,
            _ => type,
        };
    }
}
