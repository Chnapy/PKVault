using PKHeX.Core;

public class DexService
{
    public static async Task<Dictionary<int, Dictionary<uint, DexItemDTO>>> GetDex()
    {
        var saveDict = (await StorageService.GetLoader()).loaders.saveLoadersDict;
        if (saveDict.Count == 0)
        {
            return [];
        }

        var maxSpecies = saveDict.Values.Select(save => save.Save.MaxSpeciesID).Max();

        var time = LogUtil.Time($"Update Dex with {saveDict.Count} saves (max-species={maxSpecies})");

        Dictionary<int, Dictionary<uint, DexItemDTO>> dex = [];
        for (var i = 0; i < maxSpecies; i++)
        {
            dex.Add(i + 1, []);
        }

        saveDict.Values.ToList().ForEach(save => UpdateDexWithSave(dex, save.Save));

        time();

        return dex;
    }

    private static bool UpdateDexWithSave(Dictionary<int, Dictionary<uint, DexItemDTO>> dex, SaveFile save)
    {
        static bool notHandled(SaveFile save)
        {
            Console.WriteLine("Save version/gen not handled: " + save.Version + "/" + save.Generation);
            return false;
        }

        var success = save switch
        {
            SAV1 sav1 => new Dex123Service().UpdateDexWithSave(dex, sav1),
            SAV2 sav2 => new Dex123Service().UpdateDexWithSave(dex, sav2),
            SAV3 sav3 => new Dex123Service().UpdateDexWithSave(dex, sav3),
            SAV3XD sav3XD => new Dex3XDService().UpdateDexWithSave(dex, sav3XD),
            SAV3Colosseum sav3Colo => new Dex3ColoService().UpdateDexWithSave(dex, sav3Colo),
            SAV4 sav4 => new Dex4Service().UpdateDexWithSave(dex, sav4),
            SAV5 sav5 => new Dex5Service().UpdateDexWithSave(dex, sav5),
            SAV6XY xy => new Dex6XYService().UpdateDexWithSave(dex, xy),
            SAV6AO ao => new Dex6AOService().UpdateDexWithSave(dex, ao),
            SAV7b lgpe => new Dex7bService().UpdateDexWithSave(dex, lgpe),
            SAV7 sav7 => new Dex7Service().UpdateDexWithSave(dex, sav7),
            SAV8SWSH ss => new Dex8SWSHService().UpdateDexWithSave(dex, ss),
            SAV8BS bs => new Dex8BSService().UpdateDexWithSave(dex, bs),
            SAV8LA la => new Dex8LAService().UpdateDexWithSave(dex, la),
            SAV9SV sv => new Dex9SVService().UpdateDexWithSave(dex, sv),
            _ => notHandled(save),
        };

        return success;
    }
}
