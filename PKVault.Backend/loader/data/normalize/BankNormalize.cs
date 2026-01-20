public class BankNormalize(IBankLoader loader) : DataNormalize<BankDTO, BankEntity>(loader)
{
    public override void SetupInitialData(DataEntityLoaders loaders)
    {
        if (loader.GetAllEntities().Count == 0)
        {
            loader.WriteEntity(new(
                SchemaVersion: loader.GetLastSchemaVersion(),
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
        loader.GetAllEntities().Values.OrderBy(bank => bank.Order).ToList()
            .ForEach(entity =>
            {
                loader.WriteEntity(entity with
                {
                    SchemaVersion = 1,
                    Order = currentOrder
                });
                currentOrder += BankLoader.OrderGap;
            });
    }

    public override void CleanData(DataEntityLoaders loaders)
    { }
}