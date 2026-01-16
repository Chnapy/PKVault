public interface IDexLoader : IEntityLoader<DexItemDTO, DexEntity>
{
}

public class DexLoader : EntityLoader<DexItemDTO, DexEntity>, IDexLoader
{
    public DexLoader(IFileIOService fileIOService, ISettingsService settingsService) : base(
        fileIOService,
        filePath: MatcherUtil.NormalizePath(Path.Combine(settingsService.GetSettings().SettingsMutable.DB_PATH, "dex.json")),
        dictJsonContext: EntityJsonContext.Default.DictionaryStringDexEntity
    )
    {
    }

    protected override DexItemDTO GetDTOFromEntity(DexEntity entity) => throw new NotImplementedException($"Entity to DTO should not be used here");

    public override int GetLastSchemaVersion() => 1;
}
