using PKHeX.Core;

public abstract class DexGenService<Save> where Save : SaveFile
{
    public static void DeleteDexWithSave(Dictionary<int, Dictionary<uint, DexItemDTO>> persistedDex, Save save)
    {
        Console.WriteLine($"Delete Dex with save {save.ID32} (save-type={save.GetType().Name}) (max-species={save.MaxSpeciesID})");
        for (ushort i = 1; i < save.MaxSpeciesID + 1; i++)
        {
            persistedDex.TryGetValue(i, out var dict);
            dict?.Remove(save.ID32);
        }
        Console.WriteLine($"Delete Dex with save {save.ID32} finished");
    }

    public bool UpdateDexWithSave(Dictionary<int, Dictionary<uint, DexItemDTO>> persistedDex, Save save)
    {
        Console.WriteLine($"Update Dex with save {save.ID32} (save-type={save.GetType().Name}) (max-species={save.MaxSpeciesID})");
        for (ushort i = 1; i < save.MaxSpeciesID + 1; i++)
        {
            var item = CreateDexItem(i, save, save.ID32);
            // if (item.IsAnySeen || item.IsSeenM || item.IsSeenF || item.IsSeenMS || item.IsSeenFS || item.IsCaught || item.IsOwned)
            // {
            persistedDex[i] = persistedDex.GetValueOrDefault(i, new Dictionary<uint, DexItemDTO>());

            persistedDex[i][save.ID32] = item;
            // }
        }
        Console.WriteLine($"Update Dex with save {save.ID32} finished");

        return true;
    }

    protected abstract DexItemDTO CreateDexItem(ushort species, Save save, uint saveId);
}
