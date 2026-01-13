public class DexLoader : EntityLoader<DexItemDTO, DexEntity>
{
    public DexLoader(FileIOService fileIOService, SettingsService settingsService) : base(
        fileIOService,
        filePath: MatcherUtil.NormalizePath(Path.Combine(settingsService.GetSettings().SettingsMutable.DB_PATH, "dex.json")),
        dictJsonContext: EntityJsonContext.Default.DictionaryStringDexEntity
    )
    {
    }

    protected override DexItemDTO GetDTOFromEntity(DexEntity entity) => throw new NotImplementedException($"Entity to DTO should not be used here");

    public override int GetLastSchemaVersion() => 1;

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
        GetAllEntities().Values.ToList().ForEach(entity =>
        {
            WriteEntity(entity with { SchemaVersion = 1 });
        });
    }

    public override void CleanData(DataEntityLoaders loaders)
    { }
}
