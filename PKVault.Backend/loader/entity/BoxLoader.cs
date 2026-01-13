using PKHeX.Core;

public class BoxLoader : EntityLoader<BoxDTO, BoxEntity>
{
    public static readonly int OrderGap = 10;

    public static bool CanIdReceivePkm(int boxId) => boxId == (int)BoxType.Party || boxId >= (int)BoxType.Box;

    public static BoxType GetTypeFromStorageSlotType(StorageSlotType slotType) => slotType switch
    {
        StorageSlotType.Box => BoxType.Box,
        StorageSlotType.Party => BoxType.Party,
        StorageSlotType.BattleBox => BoxType.BattleBox,
        StorageSlotType.Daycare => BoxType.Daycare,
        StorageSlotType.GTS => BoxType.GTS,
        StorageSlotType.FusedKyurem => BoxType.Fused,
        StorageSlotType.FusedNecrozmaS => BoxType.Fused,
        StorageSlotType.FusedNecrozmaM => BoxType.Fused,
        StorageSlotType.FusedCalyrex => BoxType.Fused,
        StorageSlotType.Misc => BoxType.Misc,
        StorageSlotType.Resort => BoxType.Resort,
        StorageSlotType.Ride => BoxType.Ride,
        StorageSlotType.Shiny => BoxType.Shiny,
        _ => throw new NotImplementedException(slotType.ToString()),
    };

    public BoxLoader(FileIOService fileIOService, SettingsService settingsService) : base(
        fileIOService,
        filePath: MatcherUtil.NormalizePath(Path.Combine(settingsService.GetSettings().SettingsMutable.DB_PATH, "box.json")),
        dictJsonContext: EntityJsonContext.Default.DictionaryStringBoxEntity
    )
    {
    }

    public BoxDTO CreateDTO(BoxEntity entity)
    {
        return new(
            Id: entity.Id,
            Type: entity.Type,
            Name: entity.Name,
            SlotCount: entity.SlotCount,
            Order: entity.Order,
            BankId: entity.BankId
        );
    }

    protected override BoxDTO GetDTOFromEntity(BoxEntity entity)
    {
        return CreateDTO(entity);
    }

    public override int GetLastSchemaVersion() => 1;

    public override void SetupInitialData(DataEntityLoaders loaders)
    {
        if (GetAllEntities().Count == 0)
        {
            WriteEntity(new(
                SchemaVersion: GetLastSchemaVersion(),
                Id: "0",
                Type: BoxType.Box,
                SlotCount: 30,
                Order: 0,
                Name: "Box 1",
                BankId: loaders.bankLoader.GetAllEntities().First().Key
            ));
        }
    }

    protected override Action<DataEntityLoaders>? GetMigrateFunc(int currentSchemaVersion) => currentSchemaVersion switch
    {
        0 => MigrateV0ToV1,
        _ => null
    };

    private void MigrateV0ToV1(DataEntityLoaders loaders)
    {
        var currentOrder = 0;
        string? bankId = null;
        GetAllEntities().Values
            .OrderBy(box => box.BankId)
            .ThenBy(box => box.Order).ToList()
            .ForEach(entity =>
            {
                var entityBankId = entity.BankId == ""
                    ? loaders.bankLoader.GetAllEntities().First().Key
                    : entity.BankId;

                if (bankId != entityBankId)
                {
                    bankId = entityBankId;
                    currentOrder = 0;
                }

                WriteEntity(entity with { SchemaVersion = 1 });

                currentOrder += OrderGap;
            });
    }

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

    public override void CleanData(DataEntityLoaders loaders)
    { }
}