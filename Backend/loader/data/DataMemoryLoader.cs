using PKHeX.Core;

public class DataMemoryLoader : DataLoader
{
    public List<DataAction> actions = new();

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

    protected override DataEntityLoaders CreateLoaders()
    {
        var jsonLoader = new DataFileLoader().loaders;

        var boxEntities = jsonLoader.boxLoader.GetAllEntities();
        var pkmEntities = jsonLoader.pkmLoader.GetAllEntities();
        var pkmVersionEntities = jsonLoader.pkmVersionLoader.GetAllEntities();

        var boxLoader = new EntityMemoryLoader<BoxEntity>(boxEntities);
        var pkmLoader = new EntityMemoryLoader<PkmEntity>(pkmEntities);
        var pkmVersionLoader = new EntityMemoryLoader<PkmVersionEntity>(pkmVersionEntities);

        var getSaveLoaders = (uint saveId) =>
        {
            var save = LoadSave(saveId);

            return new SaveLoaders
            {
                Save = save,
                Boxes = new SaveBoxLoader(save),
                Pkms = new SavePkmLoader(save, pkmLoader, pkmVersionLoader)
            };
        };

        var pkmFileLoader = new PKMMemoryLoader();
        var pkmRealFileLoader = new PKMFileLoader();

        pkmVersionEntities
        .ForEach(entity =>
        {
            var pkmBytes = pkmRealFileLoader.GetEntity(entity);

            if (pkmBytes == default)
            {
                throw new Exception($"PKM is null, Gen={entity.Generation} Filepath={entity.Filepath}");
            }

            var pkmEntity = pkmLoader.GetEntity(entity.PkmId);

            var pkm = PKMLoader.CreatePKM(pkmBytes, entity, pkmEntity);

            pkmFileLoader.WriteEntity(pkmBytes, pkm, entity.Generation, entity.Filepath);
        });

        return new DataEntityLoaders
        {
            boxLoader = boxLoader,
            pkmLoader = pkmLoader,
            pkmVersionLoader = pkmVersionLoader,
            pkmFileLoader = pkmFileLoader,
            getSaveLoaders = getSaveLoaders
        };
    }
}

