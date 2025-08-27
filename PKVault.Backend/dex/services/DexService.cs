using PKHeX.Core;

public class DexService
{
    static Dictionary<int, Dictionary<uint, DexItemDTO>> persistedDex = [];

    public static Dictionary<int, Dictionary<uint, DexItemDTO>> GetPersistedDex()
    {
        return persistedDex;
    }

    public static void ClearDex()
    {
        persistedDex.Clear();
    }

    public static async Task<bool> UpdateDexWithSave(SaveFile save)
    {
        var notHandled = (SaveFile save) =>
        {
            Console.WriteLine("Save version/gen not handled: " + save.Version + "/" + save.Generation);
            return false;
        };

        var success = save switch
        {
            SAV1 sav1 => await new Dex123Service().UpdateDexWithSave(persistedDex, sav1),
            SAV2 sav2 => await new Dex123Service().UpdateDexWithSave(persistedDex, sav2),
            SAV3 sav3 => await new Dex123Service().UpdateDexWithSave(persistedDex, sav3),
            SAV3XD sav3XD => await new Dex3XDService().UpdateDexWithSave(persistedDex, sav3XD),
            SAV3Colosseum sav3Colo => await new Dex3ColoService().UpdateDexWithSave(persistedDex, sav3Colo),
            SAV4 sav4 => await new Dex4Service().UpdateDexWithSave(persistedDex, sav4),
            SAV5 sav5 => await new Dex5Service().UpdateDexWithSave(persistedDex, sav5),
            SAV6XY xy => notHandled(xy),
            SAV6AO xy => notHandled(xy),
            SAV7 sav7 => notHandled(sav7),
            SAV7b lgpe => await new Dex7bService().UpdateDexWithSave(persistedDex, lgpe),
            SAV8SWSH ss => notHandled(ss),
            SAV8BS bs => notHandled(bs),
            SAV8LA la => notHandled(la),
            SAV9SV sv => notHandled(sv),
            _ => notHandled(save),
        };

        return success;
    }

    public static void DeleteDexWithSave(SaveFile save)
    {
        DexGenService<SaveFile>.DeleteDexWithSave(persistedDex, save);
    }
}
