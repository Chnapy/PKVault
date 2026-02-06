using Microsoft.EntityFrameworkCore;
using Moq;

public class BankLoaderTests : IAsyncDisposable
{
    private readonly string dbPath;
    private readonly SessionDbContext _db;
    private readonly Mock<ISessionServiceMinimal> sessionService;
    private readonly Mock<IDbSeedingService> dbSeedingService;

    public BankLoaderTests()
    {
        var testId = Guid.NewGuid().ToString();
        dbPath = $"db-{testId}.db";

        sessionService = new();
        dbSeedingService = new();

        sessionService.Setup(s => s.SessionDbPath).Returns(dbPath);
        _db = new(sessionService.Object, dbSeedingService.Object);
    }

    public async ValueTask DisposeAsync()
    {
        await _db.Database.EnsureDeletedAsync();
        GC.SuppressFinalize(this);
    }

    private async Task<SessionDbContext> GetDB()
    {
        await _db.Database.MigrateAsync();
        return _db;
    }

    private async Task<BankLoader> CreateLoader(SessionDbContext db)
    {
        Mock<IBoxLoader> mockBoxLoader = new();
        mockBoxLoader.Setup(l => l.GetEntitiesByBank(It.IsAny<string>())).ReturnsAsync([]);
        return new BankLoader(sessionService.Object, db, mockBoxLoader.Object);
    }

    #region CRUD operations

    [Fact]
    public async Task AddEntity_ShouldCreateNewBank()
    {
        var db = await GetDB();
        var loader = await CreateLoader(db);

        var entity = new BankEntity()
        {
            Id = "1",
            IdInt = 1,
            Name = "Test Bank",
            IsDefault = true,
            Order = 0,
            View = new([], [])
        };

        var result = await loader.AddEntity(entity);

        Assert.Equivalent(entity, result);

        Assert.Equivalent(
            entity,
            await loader.GetEntity("1")
        );
    }

    [Fact]
    public async Task UpdateEntity_ShouldUpdateExisting()
    {
        var db = await GetDB();

        await db.Banks
            .AddAsync(new()
            {
                Id = "1",
                IdInt = 1,
                IsDefault = true,
                Name = "Bank 1",
                Order = 0,
                View = new([], [])
            }, TestContext.Current.CancellationToken);

        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        var loader = await CreateLoader(db);

        var entity = await loader.GetEntity("1");

        entity.Name = "Updated";

        await loader.UpdateEntity(entity);

        Assert.Equivalent(entity, await loader.GetEntity("1"));
    }

    [Fact]
    public async Task DeleteEntity_ShouldRemoveBank()
    {
        var db = await GetDB();

        await db.Banks
            .AddAsync(new()
            {
                Id = "1",
                IdInt = 1,
                IsDefault = true,
                Name = "Bank 1",
                Order = 0,
                View = new([], [])
            }, TestContext.Current.CancellationToken);

        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        var loader = await CreateLoader(db);

        var entity = await loader.GetEntity("1");

        await loader.DeleteEntity(entity);

        Assert.Null(await loader.GetEntity("1"));
    }

    [Fact]
    public async Task GetAllDtos_ShouldReturnAllBanks()
    {
        var db = await GetDB();

        await db.Banks
            .AddRangeAsync([
                new()
                {
                    Id = "1",
                    IdInt = 1,
                    IsDefault = true,
                    Name = "Bank 1",
                    Order = 0,
                    View = new([], [])
                },
                new()
                {
                    Id = "2",
                    IdInt = 2,
                    IsDefault = false,
                    Name = "Bank 2",
                    Order = 1,
                    View = new([], [])
                }
            ], TestContext.Current.CancellationToken);

        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        var loader = await CreateLoader(db);

        var dtos = await loader.GetAllDtos();

        Assert.Equal(2, dtos.Count);
        Assert.Equal("Bank 1", dtos[0].Name);
        Assert.Equal("Bank 2", dtos[1].Name);
    }

    #endregion

    #region Order normalization

    [Fact]
    public async Task NormalizeOrders_ShouldReorderBanks_WithGaps()
    {
        var db = await GetDB();

        await db.Banks
            .AddRangeAsync([
                new()
                {
                    Id = "1",
                    IdInt = 1,
                    IsDefault = true,
                    Name = "Bank 1",
                    Order = 10,
                    View = new([], [])
                },
                new()
                {
                    Id = "2",
                    IdInt = 2,
                    IsDefault = false,
                    Name = "Bank 2",
                    Order = 5,
                    View = new([], [])
                },
                new()
                {
                    Id = "3",
                    IdInt = 3,
                    IsDefault = false,
                    Name = "Bank 3",
                    Order = 100,
                    View = new([], [])
                }
            ], TestContext.Current.CancellationToken);

        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        var loader = await CreateLoader(db);

        await loader.NormalizeOrders();

        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        var boxes = await loader.GetAllEntities();
        Assert.Equal(10, boxes["1"].Order);
        Assert.Equal(0, boxes["2"].Order);
        Assert.Equal(20, boxes["3"].Order);
    }

    #endregion
}
