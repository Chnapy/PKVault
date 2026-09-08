using System.IO.Abstractions.TestingHelpers;
using Microsoft.EntityFrameworkCore;
using Moq;
using PKHeX.Core;
using PKVault.Core;

public class DbSeedingServiceTests : IAsyncDisposable
{
    private readonly MockFileSystem mockFileSystem;
    private readonly IFileIOService fileIOService;
    private readonly SessionDbContext db;
    private readonly DbSeedingService dbSeedingService;

    public DbSeedingServiceTests()
    {
        var testId = Guid.NewGuid().ToString();
        var dbPath = $"db-DbSeedingServiceTests-{testId}.db";

        mockFileSystem = new MockFileSystem();
        fileIOService = new FileIOService(mockFileSystem);
        fileIOService.Matcher.GetAllPaths = () => [.. mockFileSystem.AllPaths];

        dbSeedingService = new(fileIOService);

        var sessionService = new Mock<ISessionServiceMinimal>();
        sessionService.Setup(s => s.SessionDbPath).Returns(dbPath);

        db = new(sessionService.Object, dbSeedingService);
    }

    public async ValueTask DisposeAsync()
    {
        await db.Database.EnsureDeletedAsync();
        GC.SuppressFinalize(this);
    }

    private async Task<SessionDbContext> GetDB()
    {
        await db.Database.MigrateAsync();
        return db;
    }

    // issue #238: orphaned PkmFile rows
    [Fact]
    public async Task Seed_ShouldRemoveOrphanedPkmFiles_NotReferencedByAnyVariant()
    {
        var db = await GetDB();

        var referencedFilepath = "mock-storage/3/referenced.pk3";
        var orphanedFilepath = "mock-storage/3/orphaned.pk3";

        mockFileSystem.AddFile(Path.Combine(PathUtils.GetExpectedAppDirectory(), referencedFilepath), new MockFileData([1, 2, 3]));
        // orphanedFilepath has no backing file

        await db.PkmFiles.AddRangeAsync(
            [
                new()
                {
                    Filepath = referencedFilepath,
                    Data = [],
                    Error = null,
                    Updated = false,
                    Deleted = false
                },
                new()
                {
                    Filepath = orphanedFilepath,
                    Data = [],
                    Error = null,
                    Updated = false,
                    Deleted = false
                }
            ],
            TestContext.Current.CancellationToken
        );

        await db.Banks.AddAsync(new()
        {
            Id = "1",
            IdInt = 1,
            IsDefault = true,
            IsExternal = false,
            Name = "Bank 1",
            Order = 0,
            View = new([], [])
        }, TestContext.Current.CancellationToken);
        await db.Boxes.AddAsync(new()
        {
            Id = "1",
            IdInt = 1,
            Name = "Box 1",
            Order = 0,
            Type = BoxType.Box,
            SlotCount = 30,
            BankId = "1"
        }, TestContext.Current.CancellationToken);
        await db.PkmVersions.AddAsync(new()
        {
            Id = "referenced-variant",
            Hash = "referenced-variant",
            Context = EntityContext.Gen3,
            Generation = 3,
            Filepath = referencedFilepath,
            BoxId = "1",
            BoxSlot = 0,
            IsMain = true,
            IsExternal = false,
            AttachedSaveId = null,
            AttachedSavePkmIdBase = null,

            Species = 25,
            Form = 0,
            Gender = Gender.Female,
            IsShiny = false,
            IsAlpha = false,

            PkmFile = null
        }, TestContext.Current.CancellationToken);
        // no variant references orphanedFilepath

        await db.SaveChangesAsync(TestContext.Current.CancellationToken);
        // needed before Seed() re-attaches
        db.ChangeTracker.Clear();

        await dbSeedingService.Seed(db, false, TestContext.Current.CancellationToken);

        Assert.NotNull(await db.PkmFiles.FindAsync([referencedFilepath], TestContext.Current.CancellationToken));
        Assert.Null(await db.PkmFiles.FindAsync([orphanedFilepath], TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task Seed_ShouldStillLoadReferencedPkmFiles()
    {
        var db = await GetDB();

        var referencedFilepath = "mock-storage/3/referenced.pk3";
        byte[] fileBytes = [.. Enumerable.Repeat((byte)7, 64)]; // min pkm size

        mockFileSystem.AddFile(Path.Combine(PathUtils.GetExpectedAppDirectory(), referencedFilepath), new MockFileData(fileBytes));

        await db.PkmFiles.AddAsync(new()
        {
            Filepath = referencedFilepath,
            Data = [],
            Error = null,
            Updated = false,
            Deleted = false
        }, TestContext.Current.CancellationToken);

        await db.Banks.AddAsync(new()
        {
            Id = "1",
            IdInt = 1,
            IsDefault = true,
            IsExternal = false,
            Name = "Bank 1",
            Order = 0,
            View = new([], [])
        }, TestContext.Current.CancellationToken);
        await db.Boxes.AddAsync(new()
        {
            Id = "1",
            IdInt = 1,
            Name = "Box 1",
            Order = 0,
            Type = BoxType.Box,
            SlotCount = 30,
            BankId = "1"
        }, TestContext.Current.CancellationToken);
        await db.PkmVersions.AddAsync(new()
        {
            Id = "referenced-variant",
            Hash = "referenced-variant",
            Context = EntityContext.Gen3,
            Generation = 3,
            Filepath = referencedFilepath,
            BoxId = "1",
            BoxSlot = 0,
            IsMain = true,
            IsExternal = false,
            AttachedSaveId = null,
            AttachedSavePkmIdBase = null,

            Species = 25,
            Form = 0,
            Gender = Gender.Female,
            IsShiny = false,
            IsAlpha = false,

            PkmFile = null
        }, TestContext.Current.CancellationToken);

        await db.SaveChangesAsync(TestContext.Current.CancellationToken);
        // needed before Seed() re-attaches
        db.ChangeTracker.Clear();

        await dbSeedingService.Seed(db, false, TestContext.Current.CancellationToken);

        var pkmFile = await db.PkmFiles.FindAsync([referencedFilepath], TestContext.Current.CancellationToken);
        Assert.NotNull(pkmFile);
        Assert.Equal(fileBytes, pkmFile.Data);
    }
}
