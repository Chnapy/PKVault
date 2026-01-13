public class PkmLoader : EntityLoader<PkmDTO, PkmEntity>
{
    public PkmLoader(FileIOService fileIOService, SettingsService settingsService) : base(
        fileIOService,
        filePath: MatcherUtil.NormalizePath(Path.Combine(settingsService.GetSettings().SettingsMutable.DB_PATH, "pkm.json")),
        dictJsonContext: EntityJsonContext.Default.DictionaryStringPkmEntity
    )
    {
    }

    public PkmDTO CreateDTO(PkmEntity entity)
    {
        return new PkmDTO(
            Id: entity.Id,
            BoxId: entity.BoxId,
            BoxSlot: entity.BoxSlot,
            SaveId: entity.SaveId
        );
    }

    protected override PkmDTO GetDTOFromEntity(PkmEntity entity)
    {
        return CreateDTO(entity);
    }

    public override int GetLastSchemaVersion() => 1;
}