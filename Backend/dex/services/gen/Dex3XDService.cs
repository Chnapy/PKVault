using System.Buffers.Binary;
using PKHeX.Core;

public class Dex3XDService : DexGenService<SAV3XD>
{
    protected override DexItemDTO CreateDexItem(ushort species, SAV3XD save, uint saveId)
    {

        var allPkms = save.GetAllPKM();
        var ownedPkm = allPkms.Find(pkm => pkm.Species == species);

        var pi = save.Personal[species];

        Span<ushort> subLength = stackalloc ushort[16];
        int[] subOffsets = new int[16];
        for (int i = 0; i < 16; i++)
        {
            subLength[i] = BinaryPrimitives.ReadUInt16BigEndian(save.Data.AsSpan(0x20 + (2 * i)));
            subOffsets[i] = BinaryPrimitives.ReadUInt16BigEndian(save.Data.AsSpan(0x40 + (4 * i))) | (BinaryPrimitives.ReadUInt16BigEndian(save.Data.AsSpan(0x40 + (4 * i) + 2)) << 16);
        }

        var Memo = subOffsets[5] + 0xA8;

        var memo = new StrategyMemo(save.Data.AsSpan(Memo, subLength[5]), xd: true);

        var entry = memo.GetEntry(species);

        return new DexItemDTO
        {
            Id = $"{species}_{saveId}",
            Species = species,
            SaveId = saveId,
            SpeciesName = GameInfo.Strings.Species[species],
            Type1 = pi.Type1,
            Type2 = pi.Type2,
            IsOnlyMale = pi.OnlyMale,
            IsOnlyFemale = pi.OnlyFemale,
            IsGenderless = pi.Genderless,
            IsAnySeen = entry.Seen || ownedPkm != null,
            IsCaught = entry.Owned || ownedPkm != null,
            IsOwned = entry.Owned || ownedPkm != null,
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
