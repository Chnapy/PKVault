using PKHeX.Core;

public class DexService(LoadersService loadersService, StaticDataService staticDataService)
{
    public async Task<Dictionary<ushort, Dictionary<uint, DexItemDTO>>> GetDex()
    {
        var saveDict = (await loadersService.GetLoaders()).saveLoadersDict;
        if (saveDict.Count == 0)
        {
            return [];
        }

        return await GetDex([FakeSaveFile.Default.ID32, .. saveDict.Keys]);
    }

    public async Task<Dictionary<ushort, Dictionary<uint, DexItemDTO>>> GetDex(uint[] saveIds)
    {
        if (saveIds.Length == 0)
        {
            return [];
        }

        var loaders = await loadersService.GetLoaders();

        var saveLoadersDict = loaders.saveLoadersDict;

        var saves = saveIds.Select(id => id == FakeSaveFile.Default.ID32 ? FakeSaveFile.Default : saveLoadersDict[id].Save).ToList();

        var staticData = await staticDataService.GetStaticData();

        var maxSpecies = saves.Max(save => save.MaxSpeciesID);

        var time = LogUtil.Time($"Update Dex with {saves.Count} saves (max-species={maxSpecies})");

        Dictionary<ushort, Dictionary<uint, DexItemDTO>> dex = [];

        saves.ForEach(save => UpdateDexWithSave(dex, save, staticData, loaders));

        time();

        return dex;
    }

    private static bool UpdateDexWithSave(Dictionary<ushort, Dictionary<uint, DexItemDTO>> dex, SaveFile save, StaticDataDTO staticData, DataEntityLoaders loaders)
    {
        var service = GetDexService(save, loaders);

        // var time = LogUtil.Time($"Update Dex with save {save.ID32} {save.Version}");
        var success = service?.UpdateDexWithSave(dex, staticData) ?? false;
        // time();

        return success;
    }

    public static DexGenService? GetDexService<S>(S save, DataEntityLoaders loaders) where S : SaveFile
    {
        static DexGenService? notHandled(SaveFile save)
        {
            Console.WriteLine("Save version/gen not handled: " + save.Version + "/" + save.Generation);
            return null;
        }

        return save switch
        {
            FakeSaveFile => new DexMainService(loaders),
            SAV1 sav1 => new Dex123Service(sav1),
            SAV2 sav2 => new Dex123Service(sav2),
            SAV3 sav3 => new Dex123Service(sav3),
            SAV3XD sav3XD => new Dex3XDService(sav3XD),
            SAV3Colosseum sav3Colo => new Dex3ColoService(sav3Colo),
            SAV4 sav4 => new Dex4Service(sav4),
            SAV5 sav5 => new Dex5Service(sav5),
            SAV6XY xy => new Dex6XYService(xy),
            SAV6AO ao => new Dex6AOService(ao),
            SAV7b lgpe => new Dex7bService(lgpe),
            SAV7 sav7 => new Dex7Service(sav7),
            SAV8SWSH ss => new Dex8SWSHService(ss),
            SAV8BS bs => new Dex8BSService(bs),
            SAV8LA la => new Dex8LAService(la),
            SAV9SV sv => new Dex9SVService(sv),
            SAV9ZA za => new Dex9ZAService(za),
            _ => notHandled(save),
        };
    }
}
