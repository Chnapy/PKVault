public interface IDataNormalize
{
    public void SetupInitialData(DataEntityLoaders loaders);

    public void MigrateGlobalEntities(DataEntityLoaders loaders);

    public void CleanData(DataEntityLoaders loaders);
}
