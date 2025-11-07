public class BoxLoader : EntityLoader<BoxDTO, BoxEntity>
{
    public BoxLoader() : base(
        filePath: Path.Combine(SettingsService.AppSettings.GetDBPath(), "box.json"),
        dictJsonContext: EntityJsonContext.Default.DictionaryStringBoxEntity
    )
    {
    }

    protected override BoxDTO GetDTOFromEntity(BoxEntity entity)
    {
        return new BoxDTO
        {
            Type = BoxType.Box,
            BoxEntity = entity,
        };
    }

    protected override BoxEntity GetEntityFromDTO(BoxDTO dto)
    {
        return dto.BoxEntity;
    }
}