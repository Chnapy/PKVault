public class BoxNormalize(BoxLoader loader) : DataNormalize<BoxDTO, BoxEntity>(loader)
{
    public override void SetupInitialData(DataEntityLoaders loaders)
    {
        if (loader.GetAllEntities().Count == 0)
        {
            loader.WriteEntity(new(
                SchemaVersion: loader.GetLastSchemaVersion(),
                Id: "0",
                Type: BoxType.Box,
                SlotCount: 30,
                Order: 0,
                Name: "Box 1",
                BankId: loaders.bankLoader.GetAllEntities().First().Key
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
        string? bankId = null;
        loader.GetAllEntities().Values
            .OrderBy(box => box.BankId)
            .ThenBy(box => box.Order).ToList()
            .ForEach(entity =>
            {
                var entityBankId = entity.BankId == ""
                    ? loaders.bankLoader.GetAllEntities().First().Key
                    : entity.BankId;

                if (bankId != entityBankId)
                {
                    bankId = entityBankId;
                    currentOrder = 0;
                }

                loader.WriteEntity(entity with
                {
                    SchemaVersion = 1,
                    Order = currentOrder,
                    BankId = entityBankId
                });

                currentOrder += BoxLoader.OrderGap;
            });
    }

    public override void CleanData(DataEntityLoaders loaders)
    { }
}