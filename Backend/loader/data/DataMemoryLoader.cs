using PKHeX.Core;

public class DataMemoryLoader : DataLoader
{
    public static async Task<DataMemoryLoader> Create()
    {
        var jsonLoader = (await DataFileLoader.Create()).loaders;

        var boxDtos = jsonLoader.boxLoader.GetAllDtos();
        var pkmDtos = jsonLoader.pkmLoader.GetAllDtos();
        var pkmVersionDtos = jsonLoader.pkmVersionLoader.GetAllDtos();

        var pkmMemoryLoader = new PKMMemoryLoader();
        var pkmRealFileLoader = new PKMFileLoader();

        var boxLoader = new EntityMemoryLoader<BoxDTO, BoxEntity>(boxDtos);
        var pkmLoader = new EntityMemoryLoader<PkmDTO, PkmEntity>(pkmDtos);
        var pkmVersionLoader = new EntityMemoryLoader<PkmVersionDTO, PkmVersionEntity>(pkmVersionDtos);
        pkmVersionLoader.OnWrite = (dto) =>
        {
            var pkm = dto.Pkm;
            pkmMemoryLoader.WriteEntity(
                PKMLoader.GetPKMBytes(pkm), pkm, dto.PkmVersionEntity.Filepath
            );
        };
        pkmVersionLoader.OnDelete = (dto) =>
        {
            pkmMemoryLoader.DeleteEntity(dto.PkmVersionEntity.Filepath);
        };

        pkmVersionDtos
        .ForEach(pkmVersionDto =>
        {
            var pkmBytes = pkmRealFileLoader.GetEntity(pkmVersionDto.PkmVersionEntity.Filepath);

            if (pkmBytes == default)
            {
                throw new Exception($"PKM is null, Gen={pkmVersionDto.Generation} Filepath={pkmVersionDto.PkmVersionEntity.Filepath}");
            }

            var pkmEntity = pkmLoader.GetDto(pkmVersionDto.PkmDto.Id);

            var pkm = pkmVersionDto.Pkm;

            pkmMemoryLoader.WriteEntity(pkmBytes, pkm, pkmVersionDto.PkmVersionEntity.Filepath);
        });

        var saveLoadersDict = new Dictionary<uint, SaveLoaders>();
        await Task.WhenAll(
                LocalSaveService.SaveById.Values.ToList().Select(async (save) =>
                {
                    // TODO cleaner way
                    save = save.Clone();
                    saveLoadersDict.Add(save.ID32, new()
                    {
                        Save = save,
                        Boxes = new SaveBoxLoader(save),
                        Pkms = await SavePkmLoader.Create(save, pkmLoader, pkmVersionLoader)
                    });
                })
        );

        DataEntityLoaders loaders = new()
        {
            boxLoader = boxLoader,
            pkmLoader = pkmLoader,
            pkmVersionLoader = pkmVersionLoader,
            saveLoadersDict = saveLoadersDict,
        };

        return new(loaders);
    }

    public List<DataAction> actions = new();

    public DataMemoryLoader(DataEntityLoaders _loaders) : base(_loaders) { }

    public async Task AddAction(DataAction action)
    {
        actions.Add(action);

        try
        {
            await ApplyAction(action);
        }
        catch
        {
            actions.Remove(action);
            throw;
        }
    }
}
