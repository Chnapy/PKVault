public class DataNormalizeAction : DataAction
{
    protected override async Task<DataActionPayload> Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        var time = LogUtil.Time("Data Setup + Migrate + Clean");

        loaders.CleanData();
        loaders.SetupInitialData();
        loaders.MigrateGlobalEntities();

        time();

        return new(
            type: DataActionType.DATA_NORMALIZE,
            parameters: []
        );
    }
}
