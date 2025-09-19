using PKHeX.Core;

public abstract class DexGenService<Save> where Save : SaveFile
{
    public async Task<bool> UpdateDexWithSave(Dictionary<int, Dictionary<uint, DexItemDTO>> dex, Save save)
    {
        var logtime = LogUtil.Time($"Update Dex with save {save.ID32} (save-type={save.GetType().Name}) (max-species={save.MaxSpeciesID})");

        for (ushort i = 1; i < save.MaxSpeciesID + 1; i++)
        {
            var item = CreateDexItem(i, save, save.ID32);
            dex[i][save.ID32] = item;

            item.Types = [.. item.Types.Distinct().Select(type => (byte)(type + 1))];
        }

        logtime();

        return true;
    }

    protected abstract DexItemDTO CreateDexItem(ushort species, Save save, uint saveId);
}
