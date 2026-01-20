public interface IPkmLoader : IEntityLoader<PkmDTO, PkmEntity>
{
    public PkmDTO CreateDTO(PkmEntity entity);
}

public class PkmLoader : EntityLoader<PkmDTO, PkmEntity>, IPkmLoader
{
    public PkmLoader(IFileIOService fileIOService, ISettingsService settingsService) : base(
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

    public override int GetLastSchemaVersion() => 2;
}