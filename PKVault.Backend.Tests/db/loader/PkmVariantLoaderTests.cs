using System.IO.Abstractions.TestingHelpers;
using Microsoft.EntityFrameworkCore;
using Moq;
using PKHeX.Core;

public class PkmVariantLoaderTests : IAsyncDisposable
{
    private readonly string dbPath;
    private readonly MockFileSystem mockFileSystem;
    private readonly IFileIOService fileIOService;
    private readonly SessionDbContext _db;
    private readonly StaticDataService staticDataService;
    private readonly PkmFileLoader pkmFileLoader;
    private readonly Mock<ISettingsService> mockSettings;
    private readonly Mock<ISessionServiceMinimal> sessionService;
    private readonly Mock<DbSeedingService> dbSeedingService;

    public PkmVariantLoaderTests()
    {
        var testId = Guid.NewGuid().ToString();
        dbPath = $"db-PkmVersionLoaderTests-{testId}.db";

        mockFileSystem = new MockFileSystem();
        fileIOService = new FileIOService(mockFileSystem);
        sessionService = new();
        dbSeedingService = new(fileIOService);

        _db = new(sessionService.Object, dbSeedingService.Object);

        mockSettings = new();
        mockSettings.Setup(x => x.GetSettings()).Returns(new SettingsDTO(
            BuildID: default, Version: "", PkhexVersion: "", AppDirectory: "app", SettingsPath: "",
            CanUpdateSettings: false, CanScanSaves: false, SettingsMutable: new(
                DB_PATH: "mock-db", SAVE_GLOBS: [], STORAGE_PATH: "mock-storage", BACKUP_PATH: "mock-bkp",
                LANGUAGE: "en"
            )
        ));

        staticDataService = new(mockSettings.Object);

        sessionService.Setup(s => s.SessionDbPath).Returns(dbPath);

        pkmFileLoader = new PkmFileLoader(fileIOService, sessionService.Object, mockSettings.Object, _db);
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

    private async Task<PkmVariantLoader> CreateLoader(SessionDbContext db)
    {
        return new PkmVariantLoader(fileIOService, sessionService.Object, mockSettings.Object, pkmFileLoader, db, staticDataService);
    }

    // private PkmVersionEntity CreateEntity(string id)
    // {
    //     return new PkmVersionEntity()
    //     {
    //         Id = id,
    //         Generation = 3,
    //         Filepath = "storage/3/test.pk3",
    //         BoxId = "0",
    //         BoxSlot = 0,
    //         IsMain = false,
    //         AttachedSaveId = null,
    //         AttachedSavePkmIdBase = null
    //     };
    // }

    private ImmutablePKM CreateTestPkm(ushort species = 25, byte generation = 3)
    {
        PKM pk = generation switch
        {
            1 => new PK1 { Species = species },
            2 => new PK2 { Species = species },
            3 => new PK3 { Species = species, PID = 12345, TID16 = 54321 },
            4 => new PK4 { Species = species, PID = 12345, TID16 = 54321 },
            5 => new PK5 { Species = species, PID = 12345, TID16 = 54321 },
            _ => new PK3 { Species = species }
        };
        pk.RefreshChecksum();
        return new ImmutablePKM(pk);
    }

    #region CRUD Operations

    [Fact]
    public async Task AddEntity_WithPkm_ShouldCreateBothEntityAndFile()
    {
        var db = await GetDB();
        var loader = await CreateLoader(db);

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

        var pkm = CreateTestPkm(species: 25, generation: 3);

        var result = await loader.AddEntity(new(
            BoxId: "1",
            BoxSlot: 0,
            IsMain: true,
            AttachedSaveId: null,
            AttachedSavePkmIdBase: null,
            Generation: 3,
            Pkm: pkm
        ));

        var staticData = await staticDataService.GetStaticData();

        var idBase = pkm.GetPKMIdBase(staticData.Evolves);
        var filepath = $"mock-storage/3/0025 - PIKACHU - {idBase}.pk3";
        var expectedEntity = new PkmVariantEntity()
        {
            Id = idBase,
            Generation = 3,
            Filepath = filepath,
            BoxId = "1",
            BoxSlot = 0,
            IsMain = true,
            AttachedSaveId = null,
            AttachedSavePkmIdBase = null,

            Species = 25,
            Form = 0,
            Gender = Gender.Female,
            IsShiny = false,

            PkmFile = new PkmFileEntity()
            {
                Filepath = filepath,
                Data = [.. pkm.DecryptedPartyData],
                Error = null,
                Updated = true,
                Deleted = false
            }
        };

        Assert.Equivalent(expectedEntity, result);

        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        Assert.Equivalent(
            expectedEntity,
            await loader.GetEntity(idBase)
        );
    }

    [Fact]
    public async Task DeleteEntity_ShouldRemoveBothEntityAndFile()
    {
        var db = await GetDB();
        var loader = await CreateLoader(db);

        var pkm = CreateTestPkm();

        var staticData = await staticDataService.GetStaticData();

        var idBase = pkm.GetPKMIdBase(staticData.Evolves);
        var filepath = $"mock-storage/3/0025 - PIKACHU - {idBase}.pk3";

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
        await db.PkmFiles
            .AddAsync(new()
            {
                Filepath = filepath,
                Data = [.. pkm.DecryptedPartyData],
                Error = null,
                Updated = false,
                Deleted = false
            }, TestContext.Current.CancellationToken);
        await db.PkmVersions
            .AddAsync(new()
            {
                Id = idBase,
                Generation = 3,
                Filepath = filepath,
                BoxId = "1",
                BoxSlot = 0,
                IsMain = true,
                AttachedSaveId = null,
                AttachedSavePkmIdBase = null,

                Species = 25,
                Form = 0,
                Gender = Gender.Female,
                IsShiny = false,

                PkmFile = null
            }, TestContext.Current.CancellationToken);

        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        var entity = await db.PkmVersions.FindAsync([idBase], TestContext.Current.CancellationToken);
        Assert.NotNull(entity);

        await loader.DeleteEntity(entity);

        Assert.Null(await loader.GetEntity(idBase));
    }

    [Fact]
    public async Task GetEntitiesByBox_ShouldReturnAllVersions()
    {
        var db = await GetDB();
        var loader = await CreateLoader(db);

        var pkm1 = CreateTestPkm(generation: 3);
        var pkm2 = CreateTestPkm(generation: 4);
        var pkm3 = CreateTestPkm(generation: 5);

        var staticData = await staticDataService.GetStaticData();

        var idBase1 = pkm1.GetPKMIdBase(staticData.Evolves);
        var filepath1 = $"mock-storage/3/0025 - PIKACHU - {idBase1}.pk3";

        var idBase2 = pkm2.GetPKMIdBase(staticData.Evolves);
        var filepath2 = $"mock-storage/4/0025 - PIKACHU - {idBase2}.pk4";

        var idBase3 = pkm3.GetPKMIdBase(staticData.Evolves);
        var filepath3 = $"mock-storage/5/0025 - PIKACHU - {idBase3}.pk5";

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
                },
            ], TestContext.Current.CancellationToken);
        await db.PkmFiles
            .AddRangeAsync([
                new()
                {
                    Filepath = filepath1,
                    Data = [.. pkm1.DecryptedPartyData],
                    Error = null,
                    Updated = false,
                    Deleted = false
                },
                new()
                {
                    Filepath = filepath2,
                    Data = [.. pkm2.DecryptedPartyData],
                    Error = null,
                    Updated = false,
                    Deleted = false
                },
                new()
                {
                    Filepath = filepath3,
                    Data = [.. pkm3.DecryptedPartyData],
                    Error = null,
                    Updated = false,
                    Deleted = false
                },
            ], TestContext.Current.CancellationToken);
        await db.PkmVersions
            .AddRangeAsync([
                new()
                {
                    Id = idBase1,
                    Generation = 3,
                    Filepath = filepath1,
                    BoxId = "1",
                    BoxSlot = 0,
                    IsMain = true,
                    AttachedSaveId = null,
                    AttachedSavePkmIdBase = null,

                    Species = 25,
                    Form = 0,
                    Gender = Gender.Female,
                    IsShiny = false,

                    PkmFile = null
                },
                new()
                {
                    Id = idBase2,
                    Generation = 4,
                    Filepath = filepath2,
                    BoxId = "1",
                    BoxSlot = 1,
                    IsMain = true,
                    AttachedSaveId = null,
                    AttachedSavePkmIdBase = null,

                    Species = 25,
                    Form = 0,
                    Gender = Gender.Female,
                    IsShiny = false,

                    PkmFile = null
                },
                new()
                {
                    Id = idBase3,
                    Generation = 5,
                    Filepath = filepath3,
                    BoxId = "2",
                    BoxSlot = 0,
                    IsMain = true,
                    AttachedSaveId = null,
                    AttachedSavePkmIdBase = null,

                    Species = 25,
                    Form = 0,
                    Gender = Gender.Female,
                    IsShiny = false,

                    PkmFile = null
                },
            ], TestContext.Current.CancellationToken);

        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        var firstSlotVersions = await loader.GetEntitiesByBox(1, 0);
        var secondSlotVersions = await loader.GetEntitiesByBox(1, 1);

        Assert.Single(firstSlotVersions);
        Assert.Equal(3, firstSlotVersions[idBase1].Generation);

        Assert.Single(secondSlotVersions);
        Assert.Equal(4, secondSlotVersions[idBase2].Generation);

        var firstBoxVersions = await loader.GetEntitiesByBox(1);
        var secondBoxVersions = await loader.GetEntitiesByBox(2);

        Assert.Equal(2, firstBoxVersions.Count);
        Assert.Equal(3, firstBoxVersions[0][idBase1].Generation);
        Assert.Equal(4, firstBoxVersions[1][idBase2].Generation);

        Assert.Single(secondBoxVersions);
        Assert.Equal(5, secondBoxVersions[0][idBase3].Generation);
    }

    [Fact]
    public async Task GetEntitiesBySaveId_ShouldReturnAllVersions()
    {
        var db = await GetDB();
        var loader = await CreateLoader(db);

        var pkm1 = CreateTestPkm(generation: 3);
        var pkm2 = CreateTestPkm(generation: 4);

        var staticData = await staticDataService.GetStaticData();

        var idBase1 = pkm1.GetPKMIdBase(staticData.Evolves);
        var filepath1 = $"mock-storage/3/0025 - PIKACHU - {idBase1}.pk3";

        var idBase2 = pkm2.GetPKMIdBase(staticData.Evolves);
        var filepath2 = $"mock-storage/4/0025 - PIKACHU - {idBase2}.pk4";

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
            ], TestContext.Current.CancellationToken);
        await db.PkmFiles
            .AddRangeAsync([
                new()
                {
                    Filepath = filepath1,
                    Data = [.. pkm1.DecryptedPartyData],
                    Error = null,
                    Updated = false,
                    Deleted = false
                },
                new()
                {
                    Filepath = filepath2,
                    Data = [.. pkm2.DecryptedPartyData],
                    Error = null,
                    Updated = false,
                    Deleted = false
                },
            ], TestContext.Current.CancellationToken);
        await db.PkmVersions
            .AddRangeAsync([
                new()
                {
                    Id = idBase1,
                    Generation = 3,
                    Filepath = filepath1,
                    BoxId = "1",
                    BoxSlot = 0,
                    IsMain = true,
                    AttachedSaveId = null,
                    AttachedSavePkmIdBase = null,

                    Species = 25,
                    Form = 0,
                    Gender = Gender.Female,
                    IsShiny = false,

                    PkmFile = null
                },
                new()
                {
                    Id = idBase2,
                    Generation = 4,
                    Filepath = filepath2,
                    BoxId = "1",
                    BoxSlot = 1,
                    IsMain = true,
                    AttachedSaveId = 200,
                    AttachedSavePkmIdBase = "foobar",

                    Species = 25,
                    Form = 0,
                    Gender = Gender.Female,
                    IsShiny = false,

                    PkmFile = null
                },
            ], TestContext.Current.CancellationToken);

        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        var pkm2Versions = await loader.GetEntitiesBySave(200);

        Assert.Single(pkm2Versions);
        Assert.Equal(4, pkm2Versions["foobar"].Generation);

        Assert.Null(await loader.GetEntityBySave(200, "none"));

        var pkmFound = await loader.GetEntityBySave(200, "foobar");

        Assert.NotNull(pkmFound);
        Assert.Equal(4, pkmFound.Generation);
    }

    #endregion

    #region DTO Creation

    [Fact]
    public async Task CreateDTO_ShouldSetAllProperties()
    {
        var db = await GetDB();
        var loader = await CreateLoader(db);

        var pkm = CreateTestPkm(species: 25, generation: 3);

        var staticData = await staticDataService.GetStaticData();

        var idBase = pkm.GetPKMIdBase(staticData.Evolves);
        var filepath = $"mock-storage/3/0025 - PIKACHU - {idBase}.pk3";

        mockFileSystem.AddFile(Path.Combine(PathUtils.GetExpectedAppDirectory(), $"app", filepath), new MockFileData(pkm.DecryptedPartyData));

        var entity = new PkmVariantEntity()
        {
            Id = idBase,
            Generation = 3,
            Filepath = filepath,
            BoxId = "1",
            BoxSlot = 0,
            IsMain = true,
            AttachedSaveId = null,
            AttachedSavePkmIdBase = null,

            Species = 25,
            Form = 0,
            Gender = Gender.Female,
            IsShiny = false,

            PkmFile = new()
            {
                Filepath = filepath,
                Data = [.. pkm.DecryptedPartyData],
                Error = null,
                Updated = false,
                Deleted = false
            }
        };

        var dto = await loader.CreateDTO(entity);

        Assert.Equal(idBase, dto.Id);
        Assert.Equal(3, dto.Generation);
        Assert.Equal(filepath, dto.Filepath);
        Assert.Equal(MatcherUtil.NormalizePath(Path.Combine("app", filepath)), dto.FilepathAbsolute);
        Assert.Equal(25, dto.Species);
        Assert.True(dto.IsMain);
        Assert.True(dto.IsFilePresent);
    }

    #endregion

    #region PKM File Handling

    [Fact]
    public async Task GetPKM_ShouldLoadPKMFile()
    {
        var db = await GetDB();
        var loader = await CreateLoader(db);

        var pkm = CreateTestPkm(species: 25, generation: 3);

        var staticData = await staticDataService.GetStaticData();

        var idBase = pkm.GetPKMIdBase(staticData.Evolves);
        var filepath = $"mock-storage/3/0025 - PIKACHU - {idBase}.pk3";

        var entity = new PkmVariantEntity()
        {
            Id = idBase,
            Generation = 3,
            Filepath = filepath,
            BoxId = "1",
            BoxSlot = 0,
            IsMain = true,
            AttachedSaveId = null,
            AttachedSavePkmIdBase = null,

            Species = 25,
            Form = 0,
            Gender = Gender.Female,
            IsShiny = false,

            PkmFile = new()
            {
                Filepath = filepath,
                Data = [.. pkm.DecryptedPartyData],
                Error = null,
                Updated = false,
                Deleted = false
            }
        };

        var loadedPkm = await loader.GetPKM(entity);

        Assert.Equal(25, loadedPkm.Species);
        Assert.True(loadedPkm.IsEnabled);
    }

    [Fact]
    public async Task GetPkmVersionEntityPkm_ShouldHandleMissingFile()
    {
        var db = await GetDB();
        var loader = await CreateLoader(db);

        var pkm = CreateTestPkm(species: 25, generation: 3);

        var staticData = await staticDataService.GetStaticData();

        var idBase = pkm.GetPKMIdBase(staticData.Evolves);
        var filepath = $"mock-storage/3/0025 - PIKACHU - {idBase}.pk3";

        var entity = new PkmVariantEntity()
        {
            Id = idBase,
            Generation = 3,
            Filepath = filepath,
            BoxId = "1",
            BoxSlot = 0,
            IsMain = true,
            AttachedSaveId = null,
            AttachedSavePkmIdBase = null,

            Species = 25,
            Form = 0,
            Gender = Gender.Female,
            IsShiny = false,

            PkmFile = new()
            {
                Filepath = filepath,
                Data = [],
                Error = PKMLoadError.NOT_FOUND,
                Updated = false,
                Deleted = false
            }
        };

        var loadedPkm = await loader.GetPKM(entity);

        Assert.True(loadedPkm.HasLoadError);
        Assert.NotNull(loadedPkm.LoadError);
        Assert.False(loadedPkm.IsEnabled);
    }

    #endregion

    #region Entity update

    [Fact]
    public async Task WriteEntity_UpdatesBox()
    {
        var db = await GetDB();
        var loader = await CreateLoader(db);

        var pkm1 = CreateTestPkm(generation: 3);
        var pkm2 = CreateTestPkm(generation: 4);
        var pkm3 = CreateTestPkm(generation: 5);

        var staticData = await staticDataService.GetStaticData();

        var idBase1 = pkm1.GetPKMIdBase(staticData.Evolves);
        var filepath1 = $"mock-storage/3/0025 - PIKACHU - {idBase1}.pk3";

        var idBase2 = pkm2.GetPKMIdBase(staticData.Evolves);
        var filepath2 = $"mock-storage/4/0025 - PIKACHU - {idBase2}.pk4";

        var idBase3 = pkm3.GetPKMIdBase(staticData.Evolves);
        var filepath3 = $"mock-storage/5/0025 - PIKACHU - {idBase3}.pk5";

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
                },
            ], TestContext.Current.CancellationToken);
        await db.PkmFiles
            .AddRangeAsync([
                new()
                {
                    Filepath = filepath1,
                    Data = [.. pkm1.DecryptedPartyData],
                    Error = null,
                    Updated = false,
                    Deleted = false
                },
                new()
                {
                    Filepath = filepath2,
                    Data = [.. pkm2.DecryptedPartyData],
                    Error = null,
                    Updated = false,
                    Deleted = false
                },
                new()
                {
                    Filepath = filepath3,
                    Data = [.. pkm3.DecryptedPartyData],
                    Error = null,
                    Updated = false,
                    Deleted = false
                },
            ], TestContext.Current.CancellationToken);
        await db.PkmVersions
            .AddRangeAsync([
                new()
                {
                    Id = idBase1,
                    Generation = 3,
                    Filepath = filepath1,
                    BoxId = "1",
                    BoxSlot = 0,
                    IsMain = true,
                    AttachedSaveId = null,
                    AttachedSavePkmIdBase = null,

                    Species = 25,
                    Form = 0,
                    Gender = Gender.Female,
                    IsShiny = false,

                    PkmFile = null
                },
                new()
                {
                    Id = idBase2,
                    Generation = 4,
                    Filepath = filepath2,
                    BoxId = "1",
                    BoxSlot = 1,
                    IsMain = true,
                    AttachedSaveId = null,
                    AttachedSavePkmIdBase = null,

                    Species = 25,
                    Form = 0,
                    Gender = Gender.Female,
                    IsShiny = false,

                    PkmFile = null
                },
                new()
                {
                    Id = idBase3,
                    Generation = 5,
                    Filepath = filepath3,
                    BoxId = "2",
                    BoxSlot = 0,
                    IsMain = true,
                    AttachedSaveId = null,
                    AttachedSavePkmIdBase = null,

                    Species = 25,
                    Form = 0,
                    Gender = Gender.Female,
                    IsShiny = false,

                    PkmFile = null
                },
            ], TestContext.Current.CancellationToken);

        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        var entity1 = await loader.GetEntity(idBase1);
        var entity2 = await loader.GetEntity(idBase2);
        var entity3 = await loader.GetEntity(idBase3);

        entity1.BoxId = "1";
        entity1.BoxSlot = 3;

        entity2.BoxId = "2";
        entity2.BoxSlot = 1;

        entity3.BoxId = "1";
        entity3.BoxSlot = 8;

        await loader.UpdateEntity(entity1);
        await loader.UpdateEntity(entity2);
        await loader.UpdateEntity(entity3);

        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        var entities1s3 = await loader.GetEntitiesByBox(1, 3);
        var entities2s1 = await loader.GetEntitiesByBox(2, 1);
        var entities1s8 = await loader.GetEntitiesByBox(1, 8);

        Assert.Single(entities1s3);
        Assert.Equal(3, entities1s3[idBase1].Generation);

        Assert.Single(entities2s1);
        Assert.Equal(4, entities2s1[idBase2].Generation);

        Assert.Single(entities1s8);
        Assert.Equal(5, entities1s8[idBase3].Generation);
    }

    #endregion

    #region Persistence

    [Fact]
    public async Task WriteToFile_ShouldPersistBothJsonAndPkmFiles()
    {
        var db = await GetDB();
        var loader = await CreateLoader(db);

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

        var pkm = CreateTestPkm(species: 25, generation: 3);

        await loader.AddEntity(new(
            BoxId: "1",
            BoxSlot: 0,
            IsMain: true,
            AttachedSaveId: null,
            AttachedSavePkmIdBase: null,
            Generation: 3,
            Pkm: pkm
        ));

        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        var staticData = await staticDataService.GetStaticData();

        var idBase = pkm.GetPKMIdBase(staticData.Evolves);
        var filepath = Path.Combine(PathUtils.GetExpectedAppDirectory(), $"mock-storage/3/0025 - PIKACHU - {idBase}.pk3");

        Assert.False(mockFileSystem.FileExists(filepath));

        await pkmFileLoader.WriteToFiles();

        Assert.True(mockFileSystem.FileExists(filepath));
    }

    #endregion
}
