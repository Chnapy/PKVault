using PKHeX.Core;

public class Dex123Service : DexGenService<SaveFile>
{
    protected override DexItemDTO CreateDexItem(ushort species, SaveFile save, uint saveId)
    {

        var allPkms = save.GetAllPKM();
        var ownedPkm = allPkms.Find(pkm => pkm.Species == species && !pkm.IsEgg);

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

        return new DexItemDTO
        {
            Id = $"{species}_{saveId}",
            Species = species,
            SaveId = saveId,
            Types = [
                save.Generation <= 2 ? GetG12Type(pi.Type1) : pi.Type1,
                save.Generation <= 2 ? GetG12Type(pi.Type2) : pi.Type2
            ],
            Abilities = [.. abilities.ToArray().Distinct()],
            BaseStats = baseStats,
            IsOnlyMale = pi.OnlyMale,
            IsOnlyFemale = pi.OnlyFemale,
            IsGenderless = pi.Genderless,
            IsAnySeen = ownedPkm != null || save.GetSeen(species),
            IsCaught = ownedPkm != null || save.GetCaught(species),
            IsOwned = ownedPkm != null,
        };
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
