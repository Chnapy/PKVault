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

        // Console.WriteLine(string.Join(',', PKHexUtils.StringsFR.Types));

        // var logtime = LogUtil.Time($"Get full dex for {LocalSaveService.SaveById.Count} saves (max-species={maxSpecies})");

        Dictionary<int, Dictionary<uint, DexItemDTO>> dex = [];
        for (var i = 0; i < maxSpecies; i++)
        {
            dex.Add(i + 1, []);
        }

        await Task.WhenAll(
            saveDict.Values.ToList().Select(save => UpdateDexWithSave(dex, save.Save))
        );

        // logtime();

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
            SAV6XY xy => notHandled(xy),
            SAV6AO xy => notHandled(xy),
            SAV7 sav7 => notHandled(sav7),
            SAV7b lgpe => await new Dex7bService().UpdateDexWithSave(dex, lgpe),
            SAV8SWSH ss => notHandled(ss),
            SAV8BS bs => notHandled(bs),
            SAV8LA la => notHandled(la),
            SAV9SV sv => notHandled(sv),
            _ => notHandled(save),
        };

        return success;
    }
}
