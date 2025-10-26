public class DataMemoryLoader(DataEntityLoaders _loaders, DateTime startTime) : DataLoader(_loaders)
{
    public static DataMemoryLoader Create()
    {
        var jsonLoader = DataFileLoader.Create().loaders;

        var boxEntities = jsonLoader.boxLoader.GetAllEntities();
        var pkmEntities = jsonLoader.pkmLoader.GetAllEntities();
        var pkmVersionEntities = jsonLoader.pkmVersionLoader.GetAllEntities();

        var boxLoader = new EntityMemoryLoader<BoxDTO, BoxEntity>(boxEntities,
            entityToDto: entity =>
            {
                return new BoxDTO
                {
                    Type = BoxType.Box,
                    BoxEntity = entity,
                };
            },
            dtoToEntity: dto => dto.BoxEntity
        );

        var pkmLoader = new EntityMemoryLoader<PkmDTO, PkmEntity>(pkmEntities,
            entityToDto: PkmDTO.FromEntity,
            dtoToEntity: dto => dto.PkmEntity
        );

        var pkmMemoryLoader = new PKMMemoryLoader();
        var pkmRealFileLoader = new PKMFileLoader();

        pkmMemoryLoader.EnableLog = false;

        var pkmVersionLoader = new EntityMemoryLoader<PkmVersionDTO, PkmVersionEntity>(pkmVersionEntities,
            entityToDto: entity =>
            {
                var pkmDto = pkmLoader.GetDto(entity.PkmId);
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

                return PkmVersionDTO.FromEntity(entity, pkm, pkmDto!);
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

        pkmVersionEntities.Values.ToList().ForEach(pkmVersionEntity =>
        {
            var pkmBytes = pkmRealFileLoader.GetEntity(pkmVersionEntity.Filepath);

            var pkmEntity = pkmLoader.GetDto(pkmVersionEntity.PkmId);

            var pkm = PKMLoader.CreatePKM(pkmBytes, pkmVersionEntity);
            if (pkm == default)
            {
                throw new Exception($"PKM is null, from entity Id={pkmVersionEntity.Id} Filepath={pkmVersionEntity.Filepath} bytes.length={pkmBytes.Length}");
            }

            pkmMemoryLoader.WriteEntity(pkmBytes, pkm, pkmVersionEntity.Filepath);
        });
        Console.WriteLine("pkmMemoryLoader write finished");

        var startTime = DateTime.UtcNow;

        var saveLoadersDict = new Dictionary<uint, SaveLoaders>();
        LocalSaveService.SaveById.Values.ToList().ForEach((save) =>
        {
            // TODO find a cleaner way
            save = save.Clone();
            saveLoadersDict.Add(save.ID32, new()
            {
                Save = save,
                Boxes = new SaveBoxLoader(save),
                Pkms = new SavePkmLoader(save, pkmLoader, pkmVersionLoader)
            });
        });

        pkmMemoryLoader.EnableLog = true;

        DataEntityLoaders loaders = new()
        {
            boxLoader = boxLoader,
            pkmLoader = pkmLoader,
            pkmVersionLoader = pkmVersionLoader,
            saveLoadersDict = saveLoadersDict,
        };

        return new(loaders, startTime);
    }

    public readonly DateTime startTime = startTime;
    public List<DataAction> actions = [];

    public async Task<DataUpdateFlags> AddAction(DataAction action, DataUpdateFlags? flags)
    {
        actions.Add(action);

        try
        {
            var flags2 = flags ?? new();
            await ApplyAction(action, flags2);
            return flags2;
        }
        catch
        {
            actions.Remove(action);
            throw;
        }
    }

    public async Task CheckSaveToSynchronize()
    {
        var time = LogUtil.Time($"Check saves to synchronize ({LocalSaveService.SaveById.Count})");
        foreach (var saveId in LocalSaveService.SaveById.Keys)
        {
            var pkmVersionsToSynchronize = SynchronizePkmAction.GetPkmVersionsToSynchronize(loaders, saveId);
            if (pkmVersionsToSynchronize.Length > 0)
            {
                await AddAction(
                    new SynchronizePkmAction(saveId, pkmVersionsToSynchronize),
                    null
                );
            }
        }
        time();
    }
}
