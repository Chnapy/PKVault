using PKHeX.Core;

public interface IBoxLoader : IEntityLoader<BoxDTO, BoxEntity>
{
    public BoxDTO CreateDTO(BoxEntity entity);
    public void NormalizeOrders();
}

public class BoxLoader : EntityLoader<BoxDTO, BoxEntity>, IBoxLoader
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

    public BoxLoader(IFileIOService fileIOService, string dbPath) : base(
        fileIOService,
        filePath: MatcherUtil.NormalizePath(Path.Combine(dbPath, "box.json")),
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