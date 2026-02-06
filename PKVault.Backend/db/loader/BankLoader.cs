using Microsoft.EntityFrameworkCore;

public interface IBankLoader : IEntityLoader<BankDTO, BankEntity>
{
    public BankDTO CreateDTO(BankEntity entity);
    public Task<int> GetMaxId();
    public Task<int> GetMaxOrder();
    public Task NormalizeOrders();
}

public class BankLoader : EntityLoader<BankDTO, BankEntity>, IBankLoader
{
    public static readonly int OrderGap = 10;

    private readonly IBoxLoader boxLoader;

    public BankLoader(
        ISessionServiceMinimal sessionService,
        SessionDbContext db,
        IBoxLoader _boxLoader
    ) : base(
        sessionService, db
    )
    {
        boxLoader = _boxLoader;
    }

    public BankDTO CreateDTO(BankEntity entity)
    {
        return new(
            Id: entity.Id,
            IdInt: entity.IdInt,
            Name: entity.Name,
            IsDefault: entity.IsDefault,
            Order: entity.Order,
            View: entity.View
        );
    }

    protected override async Task<BankDTO> GetDTOFromEntity(BankEntity entity)
    {
        return CreateDTO(entity);
    }

    public override async Task DeleteEntity(BankEntity entity)
    {
        var boxesToRemove = await boxLoader.GetEntitiesByBank(entity.Id);
        foreach (var box in boxesToRemove.Values)
        {
            await boxLoader.DeleteEntity(box);
        }

        await base.DeleteEntity(entity);
    }

    public async Task<int> GetMaxId()
    {
        var dbSet = await GetDbSet();

        return await dbSet.MaxAsync(p => p.IdInt);
    }

    public async Task<int> GetMaxOrder()
    {
        var dbSet = await GetDbSet();

        return await dbSet.MaxAsync(p => p.Order);
    }

    public async Task NormalizeOrders()
    {
        var dbSet = await GetDbSet();

        var entities = await dbSet
            .OrderBy(bank => bank.Order)
            .ToArrayAsync();

        var currentOrder = 0;

        foreach (var bank in entities)
        {
            if (bank.Order != currentOrder)
            {
                bank.Order = currentOrder;
                await UpdateEntity(bank);
            }
            currentOrder += OrderGap;
        }

        await db.SaveChangesAsync();
    }

    protected override DbSet<BankEntity> GetDbSetRaw() => db.Banks;
}