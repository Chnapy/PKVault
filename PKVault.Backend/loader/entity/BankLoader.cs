public class BankLoader : EntityLoader<BankDTO, BankEntity>
{
    public static readonly int OrderGap = 10;

    public BankLoader(FileIOService fileIOService, SettingsService settingsService) : base(
        fileIOService,
        filePath: MatcherUtil.NormalizePath(Path.Combine(settingsService.GetSettings().SettingsMutable.DB_PATH, "bank.json")),
        dictJsonContext: EntityJsonContext.Default.DictionaryStringBankEntity
    )
    {
    }

    public BankDTO CreateDTO(BankEntity entity)
    {
        return new(
            Id: entity.Id,
            IdInt: entity.IdInt,
            Name: entity.Name,
            IsDefault: entity.IsDefault,
            Order: entity.Order,
            View: entity.View
        );
    }

    protected override BankDTO GetDTOFromEntity(BankEntity entity)
    {
        return CreateDTO(entity);
    }

    public override int GetLastSchemaVersion() => 1;

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
}