public class BankLoader : EntityLoader<BankDTO, BankEntity>
{
    public BankLoader() : base(
        filePath: MatcherUtil.NormalizePath(Path.Combine(SettingsService.AppSettings.SettingsMutable.DB_PATH, "bank.json")),
        dictJsonContext: EntityJsonContext.Default.DictionaryStringBankEntity
    )
    {
    }

    protected override BankDTO GetDTOFromEntity(BankEntity entity)
    {
        return new BankDTO
        {
            BankEntity = entity,
        };
    }

    protected override BankEntity GetEntityFromDTO(BankDTO dto)
    {
        return dto.BankEntity;
    }
}