public class LegacyDexLoader : LegacyEntityLoader<LegacyDexEntity>
{
    public static string GetFilepath(string dbPath) => MatcherUtil.NormalizePath(Path.Combine(dbPath, "dex.json"));

    public LegacyDexLoader(IFileIOService fileIOService, string dbPath) : base(
        fileIOService,
        filePath: GetFilepath(dbPath),
        dictJsonContext: LegacyEntityJsonContext.Default.DictionaryStringLegacyDexEntity
    )
    {
    }

    public override int GetLastSchemaVersion() => 1;
}
