using PKHeX.Core;

public class DataMemoryLoader : DataLoader
{
    public List<object> actions = new();

    public void AddAction(object action)
    {
        actions.Add(action);

        try
        {
            ApplyAction(action);
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
                Boxes = new SaveBoxLoader(save),
                Pkms = new SavePkmLoader(save)
            };
        };

        var pkmFileLoader = new PKMMemoryLoader();

        pkmVersionEntities
        .ForEach(entity =>
        {
            var bytes = File.ReadAllBytes(entity.Filepath);

            // TODO EntityFormat.GetFromBytes not working, use mapping
            var pkm = entity.Generation == 2 ? new PK2(bytes) : EntityFormat.GetFromBytes(bytes);

            if (pkm == default)
            {
                throw new Exception($"PKM is null, Gen={entity.Generation} Filepath={entity.Filepath}");
            }

            pkmFileLoader.WriteEntity(pkm, entity.Filepath);
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

