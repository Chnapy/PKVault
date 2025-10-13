using System.Buffers.Binary;
using PKHeX.Core;

public class Dex3ColoService : DexGenService<SAV3Colosseum>
{
    protected override DexItemForm GetDexItemForm(ushort species, SAV3Colosseum save, List<PKM> ownedPkms, byte form, Gender gender)
    {
        var pi = save.Personal[species];

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

        // Span<ushort> subLength = stackalloc ushort[16];
        // int[] subOffsets = new int[16];
        // for (int i = 0; i < 16; i++)
        // {
        //     subLength[i] = BinaryPrimitives.ReadUInt16BigEndian(save.Data.AsSpan(0x20 + (2 * i)));
        //     subOffsets[i] = BinaryPrimitives.ReadUInt16BigEndian(save.Data.AsSpan(0x40 + (4 * i))) | (BinaryPrimitives.ReadUInt16BigEndian(save.Data.AsSpan(0x40 + (4 * i) + 2)) << 16);
        // }

        // var Memo = subOffsets[5] + 0xA8;

        // var memo = new StrategyMemo(save.Data.AsSpan(Memo, subLength[5]), xd: false);

        // var entry = memo.GetEntry(species);

        var isOwned = ownedPkms.Count > 0;
        var isSeen = isOwned || save.GetSeen(species);
        var isOwnedShiny = ownedPkms.Any(pkm => pkm.IsShiny);

        return new DexItemForm
        {
            Form = form,
            Gender = gender,
            Types = [pi.Type1, pi.Type2],
            Abilities = [.. abilities.ToArray().Distinct()],
            BaseStats = baseStats,
            IsSeen = isSeen,
            IsSeenShiny = false,
            IsCaught = ownedPkms.Count > 0 || save.GetCaught(species),
            IsOwned = isOwned,
            IsOwnedShiny = isOwnedShiny,
        };
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
