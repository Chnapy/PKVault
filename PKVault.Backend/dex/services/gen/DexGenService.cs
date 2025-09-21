using PKHeX.Core;

public abstract class DexGenService<Save> where Save : SaveFile
{
    public async Task<bool> UpdateDexWithSave(Dictionary<int, Dictionary<uint, DexItemDTO>> dex, Save save)
    {
        var logtime = LogUtil.Time($"Update Dex with save {save.ID32} (save-type={save.GetType().Name}) (max-species={save.MaxSpeciesID})");

        var pkmBySpecies = new Dictionary<ushort, List<PKM>>();

        save.GetAllPKM().ForEach(pkm =>
        {
            if (pkm.IsEgg)
            {
                return;
            }

            pkmBySpecies.TryGetValue(pkm.Species, out var pkmList);
            if (pkmList == null)
            {
                pkmList ??= [];
                pkmBySpecies.TryAdd(pkm.Species, pkmList);
            }
            pkmList.Add(pkm);
        });

        // var pkmLoader = StorageService.memoryLoader.loaders.pkmLoader;
        // var saveLoader = StorageService.memoryLoader.loaders.saveLoadersDict[save.ID32];

        // List<Task> tasks = [];

        for (ushort species = 1; species < save.MaxSpeciesID + 1; species++)
        {
            pkmBySpecies.TryGetValue(species, out var pkmList);
            var item = CreateDexItem(species, save, pkmList ?? []);
            dex[species][save.ID32] = item;

            item.Types = [.. item.Types.Distinct().Select(type => (byte)(type + 1))];

            // tasks.Add(Task.Run(async () =>
            // {
            //     var pkmDtos = await saveLoader.Pkms.GetDtos(i);
            // }));
        }

        // await Task.WhenAll(tasks);

        logtime();

        return true;
    }

    protected abstract DexItemDTO CreateDexItem(ushort species, Save save, List<PKM> pkmList);
}
