using Microsoft.EntityFrameworkCore;
using PKHeX.Core;

public interface IBoxLoader : IEntityLoader<BoxDTO, BoxEntity>
{
    public BoxDTO CreateDTO(BoxEntity entity);
    public Task<Dictionary<string, BoxEntity>> GetEntitiesByBank(string bankId);
    public Task<int> GetMaxId();
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

    private readonly IPkmVariantLoader pkmVariantLoader;

    public BoxLoader(
        ISessionServiceMinimal sessionService,
        SessionDbContext db,
        IPkmVariantLoader _pkmVariantLoader
    ) : base(
        sessionService, db
    )
    {
        pkmVariantLoader = _pkmVariantLoader;
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

    public override async Task DeleteEntity(BoxEntity entity)
    {
        var pkmsToRemove = await pkmVariantLoader.GetEntitiesByBox(entity.Id);
        foreach (var pkm in pkmsToRemove.Values.SelectMany(entry => entry.Values))
        {
            await pkmVariantLoader.DeleteEntity(pkm);
        }

        await base.DeleteEntity(entity);
    }

    public async Task<Dictionary<string, BoxEntity>> GetEntitiesByBank(string bankId)
    {
        var dbSet = await GetDbSet();

        return await dbSet.Where(p => p.BankId == bankId)
            .ToDictionaryAsync(p => p.Id);
    }

    public async Task<int> GetMaxId()
    {
        var dbSet = await GetDbSet();

        return await dbSet.MaxAsync(p => p.IdInt);
    }

    public async Task NormalizeOrders()
    {
        var dbSet = await GetDbSet();

        var entities = await dbSet
            .OrderBy(box => box.BankId)
            .ThenBy(box => box.Order)
            .ToArrayAsync();

        var currentOrder = 0;
        string? bankId = null;

        foreach (var box in entities)
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

        await db.SaveChangesAsync();
    }

    protected override DbSet<BoxEntity> GetDbSetRaw() => db.Boxes;
}