public class BankLoader : EntityLoader<BankDTO, BankEntity>
{
    public static readonly int OrderGap = 10;

    public BankLoader() : base(
        filePath: MatcherUtil.NormalizePath(Path.Combine(SettingsService.BaseSettings.SettingsMutable.DB_PATH, "bank.json")),
        dictJsonContext: EntityJsonContext.Default.DictionaryStringBankEntity
    )
    {
    }

    protected override BankDTO GetDTOFromEntity(BankEntity entity)
    {
        return new BankDTO(entity);
    }

    protected override BankEntity GetEntityFromDTO(BankDTO dto)
    {
        return dto.BankEntity;
    }

    public override int GetLastSchemaVersion() => 1;

    public override void SetupInitialData(DataEntityLoaders loaders)
    {
        if (GetAllEntities().Count == 0)
        {
            WriteEntity(new(
                SchemaVersion: GetLastSchemaVersion(),
                Id: "0",
                Name: "Bank 1",
                IsDefault: true,
                Order: 0,
                View: new(MainBoxIds: [], Saves: [])
            ));
        }
    }

    protected override Action<DataEntityLoaders>? GetMigrateFunc(int currentSchemaVersion) => currentSchemaVersion switch
    {
        0 => MigrateV0ToV1,
        _ => null
    };

    private void MigrateV0ToV1(DataEntityLoaders loaders)
    {
        var currentOrder = 0;
        GetAllEntities().Values.OrderBy(bank => bank.Order).ToList()
            .ForEach(entity =>
            {
                WriteEntity(entity with { SchemaVersion = 1 });
                currentOrder += OrderGap;
            });
    }

    public void NormalizeOrders()
    {
        var currentOrder = 0;
        GetAllEntities().Values.OrderBy(bank => bank.Order).ToList()
            .ForEach(bank =>
            {
                if (bank.Order != currentOrder)
                {
                    WriteEntity(bank with { Order = currentOrder });
                }
                currentOrder += OrderGap;
            });
    }

    public override void CleanData(DataEntityLoaders loaders)
    { }
}