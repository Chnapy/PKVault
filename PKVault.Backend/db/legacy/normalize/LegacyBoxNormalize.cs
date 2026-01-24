public class LegacyBoxNormalize(LegacyBoxLoader loader)
{
    public void MigrateGlobalEntities(LegacyBankLoader bankLoader)
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

        migrateFn(bankLoader);

        MigrateGlobalEntities(bankLoader);
    }

    protected Action<LegacyBankLoader>? GetMigrateFunc(int currentSchemaVersion) => currentSchemaVersion switch
    {
        0 => MigrateV0ToV1,
        _ => null
    };

    private void MigrateV0ToV1(LegacyBankLoader bankLoader)
    {
        var currentOrder = 0;
        string? bankId = null;
        loader.GetAllEntities().Values
            .OrderBy(box => box.BankId)
            .ThenBy(box => box.Order).ToList()
            .ForEach(entity =>
            {
                var entityBankId = entity.BankId == ""
                    ? bankLoader.GetAllEntities().First().Key
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
}