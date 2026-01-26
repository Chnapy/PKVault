using System.Collections.Immutable;
using Microsoft.EntityFrameworkCore;
using PKHeX.Core;

public interface IBoxLoader : IEntityLoader<BoxDTO, BoxEntity>
{
    public BoxDTO CreateDTO(BoxEntity entity);
    public Task<ImmutableDictionary<string, BoxEntity>> GetEntitiesByBank(string bankId);
    public Task NormalizeOrders();
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

    public BoxLoader(
        IFileIOService fileIOService,
        SessionService sessionService,
        SessionDbContext db) : base(
        fileIOService, sessionService, db, db.BoxesFlags
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

    protected override async Task<BoxDTO> GetDTOFromEntity(BoxEntity entity)
    {
        return CreateDTO(entity);
    }

    public async Task<ImmutableDictionary<string, BoxEntity>> GetEntitiesByBank(string bankId)
    {
        var dbSet = await GetDbSet();

        return dbSet.Where(p => p.BankId == bankId)
            .ToImmutableDictionary(p => p.Id);
    }

    public async Task NormalizeOrders()
    {
        var entities = await GetAllEntities();

        var currentOrder = 0;
        string? bankId = null;

        foreach (var box in entities.Values.OrderBy(box => box.BankId).ThenBy(box => box.Order))
        {
            if (bankId != box.BankId)
            {
                bankId = box.BankId;
                currentOrder = 0;
            }

            if (box.Order != currentOrder)
            {
                box.Order = currentOrder;
                await UpdateEntity(box);
            }
            currentOrder += OrderGap;
        }
    }

    protected override DbSet<BoxEntity> GetDbSetRaw() => db.Boxes;
}