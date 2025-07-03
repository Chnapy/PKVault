using PKHeX.Core;

public class Dex123Service : DexGenService<SaveFile>
{
    protected override DexItem CreateDexItem(ushort species, SaveFile save, uint saveId)
    {

        var allPkms = save.GetAllPKM();
        var ownedPkm = allPkms.Find(pkm => pkm.Species == species);

        var pi = save.Personal[species];

        return new DexItem
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
            IsAnySeen = save.GetSeen(species),
            IsCaught = save.GetCaught(species),
            IsOwned = ownedPkm != null,
        };
    }
}
