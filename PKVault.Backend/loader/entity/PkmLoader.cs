public class PkmLoader : EntityLoader<PkmDTO, PkmEntity>
{
    public PkmLoader() : base(
        filePath: MatcherUtil.NormalizePath(Path.Combine(SettingsService.AppSettings.SettingsMutable.DB_PATH, "pkm.json")),
        dictJsonContext: EntityJsonContext.Default.DictionaryStringPkmEntity
    )
    {
    }

    protected override PkmDTO GetDTOFromEntity(PkmEntity entity)
    {
        return PkmDTO.FromEntity(entity);
    }

    protected override PkmEntity GetEntityFromDTO(PkmDTO dto)
    {
        return dto.PkmEntity;
    }
}