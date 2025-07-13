using PKHeX.Core;

public class DexService
{
    static Dictionary<int, Dictionary<uint, DexItemDTO>> persistedDex = new Dictionary<int, Dictionary<uint, DexItemDTO>>();

    public static Dictionary<int, Dictionary<uint, DexItemDTO>> GetPersistedDex()
    {
        return persistedDex;
    }

    public static void ClearDex()
    {
        persistedDex.Clear();
    }

    public static bool UpdateDexWithSave(SaveFile save, SaveInfosEntity saveEntity)
    {
        var notHandled = (SaveFile save) =>
        {
            Console.WriteLine("Save version/gen not handled: " + save.Version + "/" + save.Generation);
            return false;
        };

        var success = save switch
        {
            SAV1 sav1 => new Dex123Service().UpdateDexWithSave(persistedDex, sav1, saveEntity.SaveId),
            SAV2 sav2 => new Dex123Service().UpdateDexWithSave(persistedDex, sav2, saveEntity.SaveId),
            SAV3 sav3 => new Dex123Service().UpdateDexWithSave(persistedDex, sav3, saveEntity.SaveId),
            SAV3XD sav3XD => new Dex3XDService().UpdateDexWithSave(persistedDex, sav3XD, saveEntity.SaveId),
            SAV4 sav4 => new Dex4Service().UpdateDexWithSave(persistedDex, sav4, saveEntity.SaveId),
            SAV5 sav5 => new Dex5Service().UpdateDexWithSave(persistedDex, sav5, saveEntity.SaveId),
            SAV6XY xy => notHandled(xy),
            SAV6AO xy => notHandled(xy),
            SAV7 sav7 => notHandled(sav7),
            SAV7b lgpe => new Dex7bService().UpdateDexWithSave(persistedDex, lgpe, saveEntity.SaveId),
            SAV8SWSH ss => notHandled(ss),
            SAV8BS bs => notHandled(bs),
            SAV8LA la => notHandled(la),
            SAV9SV sv => notHandled(sv),
            _ => notHandled(save),
        };

        return success;
    }
}
