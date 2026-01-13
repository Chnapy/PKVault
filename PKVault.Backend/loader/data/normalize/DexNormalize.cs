public class DexNormalize(DexLoader loader) : DataNormalize<DexItemDTO, DexEntity>(loader)
{
    public override void SetupInitialData(DataEntityLoaders loaders)
    {
        var dexService = new DexMainService(loaders);
        loaders.pkmVersionLoader.GetAllDtos().ForEach(pkmVersion =>
        {
            dexService.EnablePKM(pkmVersion.Pkm, createOnly: true);
        });
    }

    protected override Action<DataEntityLoaders>? GetMigrateFunc(int currentSchemaVersion) => currentSchemaVersion switch
    {
        0 => MigrateV0ToV1,
        _ => null
    };

    private void MigrateV0ToV1(DataEntityLoaders loaders)
    {
        loader.GetAllEntities().Values.ToList().ForEach(entity =>
        {
            loader.WriteEntity(entity with { SchemaVersion = 1 });
        });
    }

    public override void CleanData(DataEntityLoaders loaders)
    { }
}