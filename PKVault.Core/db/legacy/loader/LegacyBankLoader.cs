
public class LegacyBankLoader : LegacyEntityLoader<LegacyBankEntity>
{
    public static readonly int OrderGap = 10;

    public static string GetFilepath(string dbPath) => MatcherUtil.NormalizePath(Path.Combine(dbPath, "bank.json"));

    public LegacyBankLoader(IFileIOService fileIOService, string dbPath) : base(
        fileIOService,
        filePath: GetFilepath(dbPath),
        dictJsonContext: LegacyEntityJsonContext.Default.DictionaryStringLegacyBankEntity
    )
    {
    }

    public override int GetLastSchemaVersion() => 1;

    public void NormalizeOrders()
    {
        var currentOrder = 0;
        GetAllEntities().Values.OrderBy(bank => bank.Order).ToList()
            .ForEach(bank =>
            {
                if (bank.Order != currentOrder)
                {
                    WriteEntity(bank with { Order = currentOrder });
                }
                currentOrder += OrderGap;
            });
    }
}