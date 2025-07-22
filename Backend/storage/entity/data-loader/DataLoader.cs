using PKHeX.Core;

public abstract class DataLoader
{
    public DataEntityLoaders loaders;

    protected Dictionary<uint, SaveFile> saveDict = new();

    public DataLoader()
    {
        loaders = CreateLoaders();
    }

    protected abstract DataEntityLoaders CreateLoaders();

    protected SaveFile LoadSave(uint saveId)
    {
        if (saveDict.TryGetValue(saveId, out var save))
        {
            return save;
        }

        Console.WriteLine($"Load save id={saveId}");

        var entity = SaveInfosEntity.GetSaveInfosEntity(saveId)!;
        save = SaveUtil.GetVariantSAV(entity.Filepath);
        if (save == null)
        {
            throw new Exception("Save is null");
        }

        saveDict.Add(saveId, save);

        return save;
    }

    public void ApplyAction(object action)
    {
        if (action is IWithSaveId actionWithSaveId)
        {
            LoadSave(actionWithSaveId.saveId);
        }

        if (action is MainMovePkmAction mainMovePkmAction)
        {
            mainMovePkmAction.Execute(loaders.pkmLoader);
        }
        else if (action is SaveMovePkmAction saveMovePkmAction)
        {
            var saveLoader = loaders.getSaveLoaders(saveMovePkmAction.saveId);

            saveMovePkmAction.Execute(saveLoader);
        }
        else if (action is SaveMovePkmToStorageAction movePkmSaveStorAction)
        {
            var savePkmLoader = loaders.getSaveLoaders(movePkmSaveStorAction.saveId).Pkms;

            movePkmSaveStorAction.Execute(
                loaders.pkmLoader,
                loaders.pkmVersionLoader,
                loaders.pkmFileLoader,
                savePkmLoader
            );
        }
        else if (action is SaveMovePkmFromStorageAction movePkmStorSaveAction)
        {
            var save = LoadSave(movePkmStorSaveAction.saveId);

            var savePkmLoader = loaders.getSaveLoaders(movePkmStorSaveAction.saveId).Pkms;

            movePkmStorSaveAction.Execute(
                save,
                loaders.pkmLoader,
                loaders.pkmVersionLoader,
                loaders.pkmFileLoader,
                savePkmLoader
            );
        }
        else if (action is MainCreatePkmVersionAction mainCreatePkmVersionAction)
        {
            mainCreatePkmVersionAction.Execute(
                loaders.pkmLoader,
                loaders.pkmVersionLoader,
                loaders.pkmFileLoader
            );
        }
    }
}

public struct DataEntityLoaders
{
    public EntityLoader<BoxEntity> boxLoader { get; set; }
    public EntityLoader<PkmEntity> pkmLoader { get; set; }
    public EntityLoader<PkmVersionEntity> pkmVersionLoader { get; set; }
    public PKMLoader pkmFileLoader;
    public Func<uint, SaveLoaders> getSaveLoaders { get; set; }
}

public struct SaveLoaders
{
    public EntityLoader<BoxDTO> Boxes { get; set; }
    public EntityLoader<PkmSaveDTO> Pkms { get; set; }
};
