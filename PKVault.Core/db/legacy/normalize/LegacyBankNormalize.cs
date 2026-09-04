public class LegacyBankNormalize(LegacyBankLoader loader)
{
    public void MigrateGlobalEntities()
    {
        var entities = loader.GetAllEntities();
        if (entities.Count == 0)
        {
            loader.WriteEntity(new(
                Id: "0",
                Name: "Bank 1",
                IsDefault: true,
                Order: 0,
                View: new([], [])
            ));
            entities = loader.GetAllEntities();
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
}