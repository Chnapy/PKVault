public interface ILegacyPkmLoader : IEntityLoader<LegacyPkmEntity, LegacyPkmEntity>
{
}

public class LegacyPkmLoader : EntityLoader<LegacyPkmEntity, LegacyPkmEntity>, ILegacyPkmLoader
{
    public LegacyPkmLoader(IFileIOService fileIOService, ISettingsService settingsService) : base(
        fileIOService,
        filePath: MatcherUtil.NormalizePath(Path.Combine(settingsService.GetSettings().SettingsMutable.DB_PATH, "pkm.json")),
        dictJsonContext: EntityJsonContext.Default.DictionaryStringLegacyPkmEntity
    )
    {
    }

    protected override LegacyPkmEntity GetDTOFromEntity(LegacyPkmEntity entity) => entity;

    public override int GetLastSchemaVersion() => 3;
}