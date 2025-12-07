public class BoxLoader : EntityLoader<BoxDTO, BoxEntity>
{
    public BoxLoader() : base(
        filePath: MatcherUtil.NormalizePath(Path.Combine(SettingsService.AppSettings.SettingsMutable.DB_PATH, "box.json")),
        dictJsonContext: EntityJsonContext.Default.DictionaryStringBoxEntity
    )
    {
    }

    protected override BoxDTO GetDTOFromEntity(BoxEntity entity)
    {
        return new BoxDTO
        {
            BoxEntity = entity,
        };
    }

    protected override BoxEntity GetEntityFromDTO(BoxDTO dto)
    {
        return dto.BoxEntity;
    }
}