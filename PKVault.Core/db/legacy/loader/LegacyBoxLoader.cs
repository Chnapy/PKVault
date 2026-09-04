public class LegacyBoxLoader : LegacyEntityLoader<LegacyBoxEntity>
{
    public static readonly int OrderGap = 10;

    public static bool CanIdReceivePkm(int boxId) => boxId == (int)BoxType.Party || boxId >= (int)BoxType.Box;

    public static string GetFilepath(string dbPath) => MatcherUtil.NormalizePath(Path.Combine(dbPath, "box.json"));

    public LegacyBoxLoader(IFileIOService fileIOService, string dbPath) : base(
        fileIOService,
        filePath: GetFilepath(dbPath),
        dictJsonContext: LegacyEntityJsonContext.Default.DictionaryStringLegacyBoxEntity
    )
    {
    }

    public override int GetLastSchemaVersion() => 1;

    public void NormalizeOrders()
    {
        var currentOrder = 0;
        string? bankId = null;
        GetAllEntities().Values
            .OrderBy(box => box.BankId)
            .ThenBy(box => box.Order).ToList()
            .ForEach(box =>
            {
                if (bankId != box.BankId)
                {
                    bankId = box.BankId;
                    currentOrder = 0;
                }

                if (box.Order != currentOrder)
                {
                    WriteEntity(box with { Order = currentOrder });
                }
                currentOrder += OrderGap;
            });
    }
}