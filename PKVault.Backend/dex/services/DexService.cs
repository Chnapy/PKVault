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

        await Task.WhenAll(
            saveDict.Values.ToList().Select(save => UpdateDexWithSave(dex, save.Save))
        );

        time();

        return dex;
    }

    private static async Task<bool> UpdateDexWithSave(Dictionary<int, Dictionary<uint, DexItemDTO>> dex, SaveFile save)
    {
        static bool notHandled(SaveFile save)
        {
            Console.WriteLine("Save version/gen not handled: " + save.Version + "/" + save.Generation);
            return false;
        }

        var success = save switch
        {
            SAV1 sav1 => await new Dex123Service().UpdateDexWithSave(dex, sav1),
            SAV2 sav2 => await new Dex123Service().UpdateDexWithSave(dex, sav2),
            SAV3 sav3 => await new Dex123Service().UpdateDexWithSave(dex, sav3),
            SAV3XD sav3XD => await new Dex3XDService().UpdateDexWithSave(dex, sav3XD),
            SAV3Colosseum sav3Colo => await new Dex3ColoService().UpdateDexWithSave(dex, sav3Colo),
            SAV4 sav4 => await new Dex4Service().UpdateDexWithSave(dex, sav4),
            SAV5 sav5 => await new Dex5Service().UpdateDexWithSave(dex, sav5),
            SAV6XY xy => await new Dex6XYService().UpdateDexWithSave(dex, xy),
            SAV6AO ao => await new Dex6AOService().UpdateDexWithSave(dex, ao),
            SAV7b lgpe => await new Dex7bService().UpdateDexWithSave(dex, lgpe),
            SAV7 sav7 => await new Dex7Service().UpdateDexWithSave(dex, sav7),
            SAV8SWSH ss => await new Dex8SWSHService().UpdateDexWithSave(dex, ss),
            SAV8BS bs => await new Dex8BSService().UpdateDexWithSave(dex, bs),
            SAV8LA la => await new Dex8LAService().UpdateDexWithSave(dex, la),
            SAV9SV sv => await new Dex9SVService().UpdateDexWithSave(dex, sv),
            _ => notHandled(save),
        };

        return success;
    }
}
