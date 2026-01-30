public class LegacyPkmLoader : LegacyEntityLoader<LegacyPkmEntity>
{
    public static string GetFilepath(string dbPath) => MatcherUtil.NormalizePath(Path.Combine(dbPath, "pkm.json"));

    public LegacyPkmLoader(IFileIOService fileIOService, string dbPath) : base(
        fileIOService,
        filePath: GetFilepath(dbPath),
        dictJsonContext: LegacyEntityJsonContext.Default.DictionaryStringLegacyPkmEntity
    )
    {
    }

    public override int GetLastSchemaVersion() => 3;
}
