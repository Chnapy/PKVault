public abstract class DataNormalize<DTO, E>(
    IEntityLoader<DTO, E> loader
) : IDataNormalize where DTO : IWithId where E : IEntity
{
    public abstract void SetupInitialData(DataEntityLoaders loaders);

    public void MigrateGlobalEntities(DataEntityLoaders loaders)
    {
        var entities = loader.GetAllEntities();
        if (entities.Count == 0)
        {
            return;
        }

        var firstItem = entities.First().Value;
        if (firstItem == null)
        {
            return;
        }

        if (firstItem.SchemaVersion == loader.GetLastSchemaVersion())
        {
            return;
        }

        var migrateFn = GetMigrateFunc(firstItem.SchemaVersion) ?? throw new NotSupportedException($"Schema version {firstItem.SchemaVersion}");

        migrateFn(loaders);

        MigrateGlobalEntities(loaders);
    }

    protected abstract Action<DataEntityLoaders>? GetMigrateFunc(int currentSchemaVersion);

    public abstract void CleanData(DataEntityLoaders loaders);
}
