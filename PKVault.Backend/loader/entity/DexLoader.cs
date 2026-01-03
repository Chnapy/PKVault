public class DexLoader : EntityLoader<DexItemDTO, DexEntity>
{
    public DexLoader() : base(
        filePath: MatcherUtil.NormalizePath(Path.Combine(SettingsService.AppSettings.SettingsMutable.DB_PATH, "dex.json")),
        dictJsonContext: EntityJsonContext.Default.DictionaryStringDexEntity
    )
    {
    }

    protected override DexItemDTO GetDTOFromEntity(DexEntity entity) => throw new NotImplementedException($"Entity to DTO should not be used here");

    protected override DexEntity GetEntityFromDTO(DexItemDTO dto) => throw new NotImplementedException($"DTO to Entity should not be used here");
}