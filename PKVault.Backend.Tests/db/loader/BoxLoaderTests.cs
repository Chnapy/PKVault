using System.IO.Abstractions.TestingHelpers;
using Microsoft.EntityFrameworkCore;
using Moq;

public class BoxLoaderTests : IAsyncDisposable
{
    private readonly string dbPath;
    private readonly MockFileSystem mockFileSystem;
    private readonly IFileIOService fileIOService;
    private readonly SessionDbContext _db;
    private readonly Mock<ISessionServiceMinimal> sessionService;
    private readonly Mock<DbSeedingService> dbSeedingService;

    public BoxLoaderTests()
    {
        var testId = Guid.NewGuid().ToString();
        dbPath = $"db-{testId}.db";

        mockFileSystem = new MockFileSystem();
        fileIOService = new FileIOService(mockFileSystem);
        sessionService = new();
        dbSeedingService = new(fileIOService);

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

    private async Task<BoxLoader> CreateLoader(SessionDbContext db)
    {
        return new BoxLoader(sessionService.Object, db);
    }

    #region CRUD operations

    [Fact]
    public async Task AddEntity_ShouldCreateNewBox()
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

        var loader = await CreateLoader(db);
        var entity = new BoxEntity()
        {
            Id = "1",
            IdInt = 1,
            Name = "Test Box",
            Type = BoxType.Box,
            SlotCount = 30,
            Order = 0,
            BankId = "1"
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
        await db.Boxes
            .AddAsync(new()
            {
                Id = "1",
                IdInt = 1,
                Name = "Box 1",
                Order = 0,
                Type = BoxType.Box,
                SlotCount = 30,
                BankId = "1"
            }, TestContext.Current.CancellationToken);

        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        var loader = await CreateLoader(db);

        var entity = await loader.GetEntity("1");

        entity.Name = "Updated";
        await loader.UpdateEntity(entity);

        Assert.Equivalent(entity, await loader.GetEntity("1"));
        Assert.Single(await loader.GetAllEntities());
    }

    [Fact]
    public async Task DeleteEntity_ShouldRemoveBox()
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
        await db.Boxes
            .AddAsync(new()
            {
                Id = "1",
                IdInt = 1,
                Name = "Box 1",
                Order = 0,
                Type = BoxType.Box,
                SlotCount = 30,
                BankId = "1"
            }, TestContext.Current.CancellationToken);

        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        var loader = await CreateLoader(db);

        var entity = await loader.GetEntity("1");

        await loader.DeleteEntity(entity);

        Assert.Null(await loader.GetEntity("1"));
    }

    [Fact]
    public async Task GetAllDtos_ShouldReturnAllBoxes()
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
        await db.Boxes
            .AddRangeAsync([
                new()
                {
                    Id = "1",
                    IdInt = 1,
                    Name = "Box 1",
                    Order = 0,
                    Type = BoxType.Box,
                    SlotCount = 30,
                    BankId = "1"
                },
                new()
                {
                    Id = "2",
                    IdInt = 2,
                    Name = "Box 2",
                    Order = 1,
                    Type = BoxType.Box,
                    SlotCount = 30,
                    BankId = "1"
                }
            ], TestContext.Current.CancellationToken);

        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        var loader = await CreateLoader(db);

        var dtos = await loader.GetAllDtos();

        Assert.Equal(2, dtos.Count);
        Assert.Equal("Box 1", dtos[0].Name);
        Assert.Equal("Box 2", dtos[1].Name);
    }

    #endregion

    #region Order normalization

    [Fact]
    public async Task NormalizeOrders_ShouldReorderBoxes_WithGaps()
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

        await db.Boxes
            .AddRangeAsync([
                new()
                {
                    Id = "1",
                    IdInt = 1,
                    Name = "Box 1",
                    Order = 10,
                    Type = BoxType.Box,
                    SlotCount = 30,
                    BankId = "1"
                },
                new()
                {
                    Id = "2",
                    IdInt = 2,
                    Name = "Box 2",
                    Order = 5,
                    Type = BoxType.Box,
                    SlotCount = 30,
                    BankId = "1"
                },
                new()
                {
                    Id = "3",
                    IdInt = 3,
                    Name = "Box 3",
                    Order = 100,
                    Type = BoxType.Box,
                    SlotCount = 30,
                    BankId = "1"
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

    [Fact]
    public async Task NormalizeOrders_ShouldHandleMultipleBanks()
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
                    IsDefault = true,
                    Name = "Bank 2",
                    Order = 0,
                    View = new([], [])
                }
            ], TestContext.Current.CancellationToken);

        await db.Boxes
            .AddRangeAsync([
                new()
                {
                    Id = "1",
                    IdInt = 1,
                    Name = "Box 1",
                    Order = 10,
                    Type = BoxType.Box,
                    SlotCount = 30,
                    BankId = "1"
                },
                new()
                {
                    Id = "2",
                    IdInt = 2,
                    Name = "Box 2",
                    Order = 5,
                    Type = BoxType.Box,
                    SlotCount = 30,
                    BankId = "1"
                },
                new()
                {
                    Id = "3",
                    IdInt = 3,
                    Name = "Box 3",
                    Order = 7,
                    Type = BoxType.Box,
                    SlotCount = 30,
                    BankId = "2"
                },
                new()
                {
                    Id = "4",
                    IdInt = 4,
                    Name = "Box 4",
                    Order = 2,
                    Type = BoxType.Box,
                    SlotCount = 30,
                    BankId = "2"
                }
            ], TestContext.Current.CancellationToken);

        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        var loader = await CreateLoader(db);

        await loader.NormalizeOrders();

        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        var boxes = await loader.GetAllEntities();
        Assert.Equal(10, boxes["1"].Order);
        Assert.Equal(0, boxes["2"].Order);
        Assert.Equal(10, boxes["3"].Order);
        Assert.Equal(0, boxes["4"].Order);
    }

    #endregion

    #region DTO creation

    [Fact]
    public async Task CreateDTO_ShouldSetCorrectFlags()
    {
        var db = await GetDB();
        var loader = await CreateLoader(db);

        var entity = new BoxEntity()
        {
            Id = "1",
            IdInt = 1,
            Name = "Box 1",
            Order = 0,
            Type = BoxType.Box,
            SlotCount = 30,
            BankId = "1"
        };

        var normalDto = loader.CreateDTO(entity);

        Assert.True(normalDto.CanSaveWrite);
        Assert.True(normalDto.CanSaveReceivePkm);

        // Party
        entity.Type = BoxType.Party;
        var partyDto = loader.CreateDTO(entity);

        Assert.False(partyDto.CanSaveWrite);
        Assert.True(partyDto.CanSaveReceivePkm);

        // Daycare
        entity.Type = BoxType.Daycare;
        var daycareDto = loader.CreateDTO(entity);

        Assert.False(daycareDto.CanSaveWrite);
        Assert.False(daycareDto.CanSaveReceivePkm);
    }

    #endregion

    #region Edge Cases

    [Fact]
    public void CanIdReceivePkm_ShouldReturnCorrectly()
    {
        // Assert
        Assert.True(BoxLoader.CanIdReceivePkm((int)BoxType.Box));
        Assert.True(BoxLoader.CanIdReceivePkm((int)BoxType.Party));
        Assert.False(BoxLoader.CanIdReceivePkm((int)BoxType.Daycare));
        Assert.False(BoxLoader.CanIdReceivePkm((int)BoxType.BattleBox));
    }

    #endregion
}
