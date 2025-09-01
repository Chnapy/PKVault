public class DataMemoryLoader(DataEntityLoaders _loaders) : DataLoader(_loaders)
{
    public static async Task<DataMemoryLoader> Create()
    {
        var jsonLoader = DataFileLoader.Create().loaders;

        var boxEntities = jsonLoader.boxLoader.GetAllEntities();
        var pkmEntities = jsonLoader.pkmLoader.GetAllEntities();
        var pkmVersionEntities = jsonLoader.pkmVersionLoader.GetAllEntities();

        var boxLoader = new EntityMemoryLoader<BoxDTO, BoxEntity>(boxEntities,
            entityToDto: async entity =>
            {
                return new BoxDTO
                {
                    Type = BoxType.Default,
                    BoxEntity = entity,
                };
            },
            dtoToEntity: dto => dto.BoxEntity
        );

        var pkmLoader = new EntityMemoryLoader<PkmDTO, PkmEntity>(pkmEntities,
            entityToDto: async entity => PkmDTO.FromEntity(entity),
            dtoToEntity: dto => dto.PkmEntity
        );

        var pkmMemoryLoader = new PKMMemoryLoader();
        var pkmRealFileLoader = new PKMFileLoader();

        var pkmVersionLoader = new EntityMemoryLoader<PkmVersionDTO, PkmVersionEntity>(pkmVersionEntities,
            entityToDto: async entity =>
            {
                var pkmDto = await pkmLoader.GetDto(entity.PkmId);
                var pkmBytes = pkmMemoryLoader.GetEntity(entity.Filepath);
                if (pkmBytes == default)
                {
                    throw new Exception($"PKM-bytes is null, from entity Id={entity.Id} Filepath={entity.Filepath}");
                }
                var pkm = PKMLoader.CreatePKM(pkmBytes, entity);
                if (pkm == default)
                {
                    throw new Exception($"PKM is null, from entity Id={entity.Id} Filepath={entity.Filepath} bytes.length={pkmBytes.Length}");
                }

                return await PkmVersionDTO.FromEntity(entity, pkm, pkmDto);
            },
            dtoToEntity: dto => dto.PkmVersionEntity
        )
        {
            OnWrite = (dto) =>
            {
                var pkm = dto.Pkm;
                pkmMemoryLoader.WriteEntity(
                    PKMLoader.GetPKMBytes(pkm), pkm, dto.PkmVersionEntity.Filepath
                );
            },
            OnDelete = (entity) =>
            {
                pkmMemoryLoader.DeleteEntity(entity.Filepath);
            }
        };

        await Task.WhenAll(
            pkmVersionEntities.Values.Select(async pkmVersionEntity =>
            {
                var pkmBytes = pkmRealFileLoader.GetEntity(pkmVersionEntity.Filepath);
                if (pkmBytes == default)
                {
                    throw new Exception($"PKM is null, Gen={pkmVersionEntity.Generation} Filepath={pkmVersionEntity.Filepath}");
                }

                var pkmEntity = pkmLoader.GetDto(pkmVersionEntity.PkmId);

                var pkm = PKMLoader.CreatePKM(pkmBytes, pkmVersionEntity);
                if (pkm == default)
                {
                    throw new Exception($"PKM is null, from entity Id={pkmVersionEntity.Id} Filepath={pkmVersionEntity.Filepath} bytes.length={pkmBytes.Length}");
                }

                pkmMemoryLoader.WriteEntity(pkmBytes, pkm, pkmVersionEntity.Filepath);
            })
        );

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
                        Pkms = new SavePkmLoader(save, pkmLoader, pkmVersionLoader)
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

    public List<DataAction> actions = [];

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
