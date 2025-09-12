using System.Buffers.Binary;
using PKHeX.Core;

public class Dex3XDService : DexGenService<SAV3XD>
{
    protected override DexItemDTO CreateDexItem(ushort species, SAV3XD save, uint saveId)
    {

        var allPkms = save.GetAllPKM();
        var ownedPkm = allPkms.Find(pkm => pkm.Species == species);

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

        return new DexItemDTO
        {
            Id = $"{species}_{saveId}",
            Species = species,
            SaveId = saveId,
            Types = [pi.Type1, pi.Type2],
            Abilities = [.. abilities.ToArray().Distinct()],
            BaseStats = baseStats,
            IsOnlyMale = pi.OnlyMale,
            IsOnlyFemale = pi.OnlyFemale,
            IsGenderless = pi.Genderless,
            IsAnySeen = ownedPkm != null,
            IsCaught = ownedPkm != null,
            IsOwned = ownedPkm != null,
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
