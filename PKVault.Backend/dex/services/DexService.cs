using PKHeX.Core;

public class DexService
{
    public static async Task<Dictionary<ushort, Dictionary<uint, DexItemDTO>>> GetDex()
    {
        var saveDict = (await StorageService.GetLoader()).loaders.saveLoadersDict;
        if (saveDict.Count == 0)
        {
            return [];
        }

        return await GetDex([.. saveDict.Keys]);
    }

    public static async Task<Dictionary<ushort, Dictionary<uint, DexItemDTO>>> GetDex(uint[] saveIds)
    {
        if (saveIds.Length == 0)
        {
            return [];
        }

        var saveLoadersDict = (await StorageService.GetLoader()).loaders.saveLoadersDict;

        var saves = saveIds.Select(id => saveLoadersDict[id]).ToList();

        var staticData = await StaticDataService.GetStaticData();

        var maxSpecies = saves.Max(save => save.Save.MaxSpeciesID);

        var time = LogUtil.Time($"Update Dex with {saves.Count} saves (max-species={maxSpecies})");

        Dictionary<ushort, Dictionary<uint, DexItemDTO>> dex = [];

        saves.ForEach(save => UpdateDexWithSave(dex, save.Save, staticData));

        time();

        return dex;
    }

    private static bool UpdateDexWithSave(Dictionary<ushort, Dictionary<uint, DexItemDTO>> dex, SaveFile save, StaticDataDTO staticData)
    {
        var service = GetDexService(save);
        var success = service?.UpdateDexWithSave(dex, staticData) ?? false;

        return success;
    }

    public static DexGenService? GetDexService<S>(S save) where S : SaveFile
    {
        static DexGenService? notHandled(SaveFile save)
        {
            Console.WriteLine("Save version/gen not handled: " + save.Version + "/" + save.Generation);
            return null;
        }

        return save switch
        {
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
