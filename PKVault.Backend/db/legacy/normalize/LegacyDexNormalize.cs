public class LegacyDexNormalize(LegacyDexLoader loader)
{
    public void MigrateGlobalEntities()
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

        migrateFn();

        MigrateGlobalEntities();
    }

    protected Action? GetMigrateFunc(int currentSchemaVersion) => currentSchemaVersion switch
    {
        0 => MigrateV0ToV1,
        _ => null
    };

    private void MigrateV0ToV1()
    {
        loader.GetAllEntities().Values.ToList().ForEach(entity =>
        {
            loader.WriteEntity(entity with { SchemaVersion = 1 });
        });
    }
}