using PKHeX.Core;

public abstract class DexGenService<Save> where Save : SaveFile
{
    public bool UpdateDexWithSave(Dictionary<int, Dictionary<uint, DexItemDTO>> persistedDex, Save save, uint saveId)
    {
        Console.WriteLine($"Update Dex with save {saveId} (save-type={save.GetType().Name}) (max-species={save.MaxSpeciesID})");
        for (ushort i = 1; i < save.MaxSpeciesID + 1; i++)
        {
            var item = CreateDexItem(i, save, saveId);
            // if (item.IsAnySeen || item.IsSeenM || item.IsSeenF || item.IsSeenMS || item.IsSeenFS || item.IsCaught || item.IsOwned)
            // {
            persistedDex[i] = persistedDex.GetValueOrDefault(i, new Dictionary<uint, DexItemDTO>());

            persistedDex[i][saveId] = item;
            // }
        }
        Console.WriteLine($"Update Dex with save {saveId} finished");

        return true;
    }

    protected abstract DexItemDTO CreateDexItem(ushort species, Save save, uint saveId);
}
