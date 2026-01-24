using Microsoft.EntityFrameworkCore;

public interface IBankLoader : IEntityLoader<BankDTO, BankEntity>
{
    public BankDTO CreateDTO(BankEntity entity);
    public void NormalizeOrders();
}

public class BankLoader : EntityLoader<BankDTO, BankEntity>, IBankLoader
{
    public static readonly int OrderGap = 10;

    public BankLoader(IFileIOService fileIOService, SessionDbContext db) : base(
        fileIOService, db, db.BanksFlags
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

    protected override DbSet<BankEntity> GetDbSet() => db.Banks;
}