using PKHeX.Core;

public class Dex3XDService(SAV3XD save) : DexGenService(save)
{
    protected override DexItemForm GetDexItemForm(ushort species, List<ImmutablePKM> ownedPkms, byte form, Gender gender)
    {
        var pi = save.Personal.GetFormEntry(species, form);

        // TODO all memo part dont work (wrong values)

        // Span<ushort> subLength = stackalloc ushort[16];
        // int[] subOffsets = new int[16];
        // for (int i = 0; i < 16; i++)
        // {
        //     subLength[i] = BinaryPrimitives.ReadUInt16BigEndian(save.Data.AsSpan(0x20 + (2 * i)));
        //     subOffsets[i] = BinaryPrimitives.ReadUInt16BigEndian(save.Data.AsSpan(0x40 + (4 * i))) | (BinaryPrimitives.ReadUInt16BigEndian(save.Data.AsSpan(0x40 + (4 * i) + 2)) << 16);
        // }

        // var Memo = subOffsets[5] + 0xA8;

        // var memo = new StrategyMemo(save.Data.AsSpan(Memo, subLength[5]), xd: true);

        // var entry = memo.GetEntry(species);

        var isOwned = ownedPkms.Count > 0;
        var isSeen = isOwned || save.GetSeen(species);
        var isOwnedShiny = ownedPkms.Any(pkm => pkm.IsShiny);

        return new DexItemForm
        {
            Form = form,
            Gender = gender,
            Types = GetTypes(pi),
            Abilities = GetAbilities(pi),
            BaseStats = GetBaseStats(pi),
            IsSeen = isSeen,
            IsSeenShiny = false,
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

    // private PKM? FindPKM(ushort species, SaveFile save)
    // {

    //     for (var i = 0; i < 6; i++)
    //     {
    //         var partyPkm = save.GetPartySlotAtIndex(i);
    //         if (partyPkm.Species == species)
    //         {
    //             return partyPkm;
    //         }
    //     }

    //     for (var i = 0; i < 8; i++)
    //     {
    //         for (var j = 0; j < 30; j++)
    //         {
    //             var boxPkm = save.GetBoxSlotAtIndex(i, j);
    //             if (boxPkm.Species == species)
    //             {
    //                 return boxPkm;
    //             }
    //         }
    //     }

    //     return null;
    // }

}
