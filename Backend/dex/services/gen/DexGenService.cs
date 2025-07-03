using PKHeX.Core;

public abstract class DexGenService<Save> where Save : SaveFile
{
    public bool UpdateDexWithSave(Dictionary<int, Dictionary<uint, DexItem>> persistedDex, Save save, uint saveId)
    {
        for (ushort i = 1; i < save.MaxSpeciesID + 1; i++)
        {
            var item = CreateDexItem(i, save, saveId);
            if (item.IsAnySeen || item.IsSeenM || item.IsSeenF || item.IsSeenMS || item.IsSeenFS || item.IsCaught || item.IsOwned)
            {

                persistedDex[i] = persistedDex.GetValueOrDefault(i, new Dictionary<uint, DexItem>());

                persistedDex[i][saveId] = item;
            }
        }

        return true;
    }

    protected abstract DexItem CreateDexItem(ushort species, Save save, uint saveId);
}
