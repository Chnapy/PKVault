public class LegacyPkmLoader : LegacyEntityLoader<LegacyPkmEntity>
{
    public LegacyPkmLoader(IFileIOService fileIOService, string dbPath) : base(
        fileIOService,
        filePath: MatcherUtil.NormalizePath(Path.Combine(dbPath, "pkm.json")),
        dictJsonContext: LegacyEntityJsonContext.Default.DictionaryStringLegacyPkmEntity
    )
    {
    }

    public override int GetLastSchemaVersion() => 3;
}
