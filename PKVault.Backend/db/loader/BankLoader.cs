using Microsoft.EntityFrameworkCore;

public interface IBankLoader : IEntityLoader<BankDTO, BankEntity>
{
    public BankDTO CreateDTO(BankEntity entity);
    public Task NormalizeOrders();
}

public class BankLoader : EntityLoader<BankDTO, BankEntity>, IBankLoader
{
    public static readonly int OrderGap = 10;

    public BankLoader(
        IFileIOService fileIOService,
        SessionService sessionService,
        SessionDbContext db) : base(
        fileIOService, sessionService, db, db.BanksFlags
    )
    {
    }

    public BankDTO CreateDTO(BankEntity entity)
    {
        return new(
            Id: entity.Id,
            IdInt: int.Parse(entity.Id),
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

    public async Task NormalizeOrders()
    {
        var entities = await GetAllEntities();

        var currentOrder = 0;

        foreach (var bank in entities.Values.OrderBy(bank => bank.Order))
        {
            if (bank.Order != currentOrder)
            {
                await WriteEntity(bank with { Order = currentOrder });
            }
            currentOrder += OrderGap;
        }
    }

    protected override DbSet<BankEntity> GetDbSetRaw() => db.Banks;
}