public class DataNormalizeAction(FileIOService fileIOService) : DataAction
{
    protected override async Task<DataActionPayload> Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        var time = LogUtil.Time("Data Setup + Migrate + Clean");

        List<IDataNormalize> normalizers = [
            new BankNormalize(loaders.bankLoader),
            new BoxNormalize(loaders.boxLoader),
            new PkmNormalize(fileIOService, loaders.pkmLoader),
            new PkmVersionNormalize(fileIOService, loaders.pkmVersionLoader),
            new DexNormalize(loaders.dexLoader)
        ];

        normalizers.ForEach(normalizer => normalizer.CleanData(loaders));
        normalizers.ForEach(normalizer => normalizer.SetupInitialData(loaders));
        normalizers.ForEach(normalizer => normalizer.MigrateGlobalEntities(loaders));

        time();

        return new(
            type: DataActionType.DATA_NORMALIZE,
            parameters: []
        );
    }
}
