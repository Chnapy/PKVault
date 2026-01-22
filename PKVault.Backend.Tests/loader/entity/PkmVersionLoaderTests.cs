using System.IO.Abstractions.TestingHelpers;
using PKHeX.Core;

public class PkmVersionLoaderTests : IAsyncLifetime
{
    private Dictionary<ushort, StaticEvolve> evolves;

    private readonly MockFileSystem mockFileSystem;
    private readonly IFileIOService fileIOService;

    public PkmVersionLoaderTests()
    {
        mockFileSystem = new MockFileSystem();
        fileIOService = new FileIOService(mockFileSystem);
    }

    public async ValueTask InitializeAsync()
    {
        var client = new AssemblyClient();

        var staticData = (await client.GetAsyncJsonGz(
            GenStaticDataService.GetStaticDataPathParts("en"),
            StaticDataJsonContext.Default.StaticDataDTO
        ))!;
        evolves = staticData.Evolves;
    }

    public async ValueTask DisposeAsync()
    {
        GC.SuppressFinalize(this);
    }

    private PkmVersionLoader CreateLoader()
    {
        return new PkmVersionLoader(
            fileIOService,
            _appPath: "app", dbPath: "db",
            storagePath: "storage", _language: "en",
            evolves);
    }

    private PkmVersionEntity CreateEntity()
    {
        return new PkmVersionEntity(
            Id: "",
            Generation: 3,
            Filepath: "storage/3/test.pk3",
            BoxId: 0,
            BoxSlot: 0,
            IsMain: false,
            AttachedSaveId: null,
            AttachedSavePkmIdBase: null,
            SchemaVersion: 1
        );
    }

    private ImmutablePKM CreateTestPkm(ushort species = 25, byte generation = 3)
    {
        PKM pk = generation switch
        {
            1 => new PK1 { Species = species },
            2 => new PK2 { Species = species },
            3 => new PK3 { Species = species, PID = 12345, TID16 = 54321 },
            _ => new PK3 { Species = species }
        };
        pk.RefreshChecksum();
        return new ImmutablePKM(pk);
    }

    #region CRUD Operations

    [Fact]
    public void WriteEntity_WithPkm_ShouldCreateBothEntityAndFile()
    {
        var loader = CreateLoader();
        var pkm = CreateTestPkm(species: 25, generation: 3);
        var entity = CreateEntity() with { Id = "1" };

        var result = loader.WriteEntity(entity, pkm);

        Assert.Equivalent(entity, result);

        Assert.Equivalent(
            entity,
            loader.GetEntity("1")
        );

        Assert.True(loader.HasWritten);
    }

    [Fact]
    public void DeleteEntity_ShouldRemoveBothEntityAndFile()
    {
        var loader = CreateLoader();
        var pkm = CreateTestPkm();
        var entity = CreateEntity() with { Id = "1" };
        loader.WriteEntity(entity, pkm);

        var deleted = loader.DeleteEntity(entity.Id);

        Assert.True(deleted);
        Assert.Null(loader.GetEntity("1"));
        Assert.True(loader.HasWritten);
    }

    [Fact]
    public void GetEntitiesByBox_ShouldReturnAllVersions()
    {
        var loader = CreateLoader();
        var pkm1 = CreateTestPkm(generation: 3);
        var pkm2 = CreateTestPkm(generation: 4);

        loader.WriteEntity(CreateEntity() with
        {
            Id = "1",
            Generation = 4,
            Filepath = "storage/4/test.pk4",
            BoxId = 0,
            BoxSlot = 0
        }, pkm1);
        loader.WriteEntity(CreateEntity() with
        {
            Id = "2",
            Generation = 3,
            Filepath = "storage/3/test.pk3",
            BoxId = 0,
            BoxSlot = 0
        }, pkm2);
        loader.WriteEntity(CreateEntity() with
        {
            Id = "3",
            Generation = 5,
            Filepath = "storage/5/test2.pk5",
            BoxId = 0,
            BoxSlot = 1
        }, pkm2);

        var firstSlotVersions = loader.GetEntitiesByBox(0, 0);
        var secondSlotVersions = loader.GetEntitiesByBox(0, 1);

        Assert.Equal(2, firstSlotVersions.Count);
        Assert.Equal(4, firstSlotVersions["1"].Generation);
        Assert.Equal(3, firstSlotVersions["2"].Generation);

        Assert.Single(secondSlotVersions);
        Assert.Equal(5, secondSlotVersions["3"].Generation);
    }

    [Fact]
    public void GetEntitiesBySaveId_ShouldReturnAllVersions()
    {
        var loader = CreateLoader();
        var pkm1 = CreateTestPkm(generation: 3);
        var pkm2 = CreateTestPkm(generation: 4);

        loader.WriteEntity(CreateEntity() with
        {
            Id = "1",
            Generation = 4,
            Filepath = "storage/4/test.pk4",
            BoxId = 0,
            BoxSlot = 1,
            AttachedSaveId = 100,
            AttachedSavePkmIdBase = "1b"
        }, pkm1);
        loader.WriteEntity(CreateEntity() with
        {
            Id = "2",
            Generation = 3,
            Filepath = "storage/3/test.pk3",
            BoxId = 0,
            BoxSlot = 0,
            AttachedSaveId = 200,
            AttachedSavePkmIdBase = "2b"
        }, pkm2);

        var pkm2Versions = loader.GetEntitiesBySave(200);

        Assert.Single(pkm2Versions);
        Assert.Equal(3, pkm2Versions["2b"].Generation);
    }

    #endregion

    #region DTO Creation

    [Fact]
    public void CreateDTO_ShouldSetAllProperties()
    {
        var loader = CreateLoader();
        var pkm = CreateTestPkm(species: 25, generation: 3);
        mockFileSystem.AddFile("storage/3/test.pk3", new MockFileData(pkm.DecryptedPartyData));

        var entity = CreateEntity() with
        {
            Id = "1",
            Generation = 3,
            Filepath = "storage/3/test.pk3",
            IsMain = true
        };

        var dto = loader.CreateDTO(entity, pkm);

        Assert.Equal("1", dto.Id);
        Assert.Equal(3, dto.Generation);
        Assert.Equal("storage/3/test.pk3", dto.Filepath);
        Assert.Equal("app\\storage/3/test.pk3", dto.FilepathAbsolute);
        Assert.Equal(25, dto.Species);
        Assert.True(dto.IsMain);
    }

    #endregion

    #region PKM File Handling

    [Fact]
    public void GetPkmVersionEntityPkm_ShouldLoadPKMFile()
    {
        var loader = CreateLoader();
        var pkm = CreateTestPkm(species: 25);

        var entity = CreateEntity() with
        {
            Id = "1",   // pkm.GetPKMIdBase(evolves)
            Generation = 3,
            Filepath = "storage/3/test.pk3"
        };
        loader.WriteEntity(entity, pkm);

        var loadedPkm = loader.GetPkmVersionEntityPkm(entity);

        Assert.Equal(25, loadedPkm.Species);
        Assert.True(loadedPkm.IsEnabled);
    }

    [Fact]
    public void GetPkmVersionEntityPkm_ShouldHandleMissingFile()
    {
        var loader = CreateLoader();
        var entity = CreateEntity() with
        {
            Id = "1",   // pkm.GetPKMIdBase(evolves)
            Generation = 3,
            Filepath = "storage/3/missing.pk3"
        };

        var loadedPkm = loader.GetPkmVersionEntityPkm(entity);

        Assert.True(loadedPkm.HasLoadError);
        Assert.NotNull(loadedPkm.LoadError);
        Assert.False(loadedPkm.IsEnabled);
    }

    #endregion

    #region Save Version Matching

    [Fact]
    public void GetPkmSaveVersion_ShouldReturnCorrectVersion()
    {
        var loader = CreateLoader();
        var pkm = CreateTestPkm(generation: 3);

        var entity = CreateEntity() with
        {
            Id = "1",
            Generation = 3,
            Filepath = "storage/3/test.pk3",
            AttachedSaveId = 100,
            AttachedSavePkmIdBase = "mock-id-base"
        };
        loader.WriteEntity(entity, pkm);

        var version = loader.GetEntityBySave(100, "mock-id-base");

        Assert.NotNull(version);
        Assert.Equal("1", version.Id);
    }

    #endregion

    #region Entity update with index change

    // [Fact]
    // public void WriteEntity_ShouldHandlePkmIdChange()
    // {
    //     var loader = CreateLoader();
    //     var pkm = CreateTestPkm();
    //     var original = new PkmVersionEntity(
    //         "1", "pkm1", 3, "storage/3/test.pk3", 1
    //     );
    //     loader.WriteEntity(original, pkm);

    //     var updated = original with { PkmId = "pkm2" };
    //     loader.WriteEntity(updated, pkm);

    //     var pkm1Entities = loader.GetEntitiesByPkmId("pkm1");
    //     var pkm2Entities = loader.GetEntitiesByPkmId("pkm2");

    //     Assert.Empty(pkm1Entities);

    //     Assert.Single(pkm2Entities);
    //     Assert.Equivalent(updated, pkm2Entities["1"]);
    // }

    [Fact]
    public void GetEntity_ReturnsDifferentReferences()
    {
        var loader = CreateLoader();
        var pkm1 = CreateTestPkm(generation: 3);
        var pkm2 = CreateTestPkm(generation: 4);

        var entity1 = loader.WriteEntity(CreateEntity() with
        {
            Id = "1",
            Generation = 4,
            Filepath = "storage/4/test.pk4",
            BoxId = 0,
            BoxSlot = 0,
            AttachedSaveId = 100,
            AttachedSavePkmIdBase = "1b"
        }, pkm1);
        var entity2 = loader.WriteEntity(CreateEntity() with
        {
            Id = "2",
            Generation = 3,
            Filepath = "storage/3/test.pk3",
            BoxId = 0,
            BoxSlot = 0,
            AttachedSaveId = 200,
            AttachedSavePkmIdBase = "2b"
        }, pkm2);

        Assert.True(
            loader.GetEntitiesByBox(0) != loader.GetEntitiesByBox(0)
        );

        Assert.True(
            loader.GetEntitiesByBox(0, 0) != loader.GetEntitiesByBox(0, 0)
        );

        Assert.True(
            loader.GetEntitiesBySave(100) != loader.GetEntitiesBySave(100)
        );
    }

    [Fact]
    public void WriteEntity_UpdatesBoxIndex()
    {
        var loader = CreateLoader();
        var pkm1 = CreateTestPkm(generation: 3);
        var pkm2 = CreateTestPkm(generation: 4);

        var entity1 = loader.WriteEntity(CreateEntity() with
        {
            Id = "1",
            Generation = 4,
            Filepath = "storage/4/test.pk4",
            BoxId = 0,
            BoxSlot = 0
        }, pkm1);
        var entity2 = loader.WriteEntity(CreateEntity() with
        {
            Id = "2",
            Generation = 3,
            Filepath = "storage/3/test.pk3",
            BoxId = 0,
            BoxSlot = 0
        }, pkm2);
        var entity3 = loader.WriteEntity(CreateEntity() with
        {
            Id = "3",
            Generation = 5,
            Filepath = "storage/5/test2.pk5",
            BoxId = 0,
            BoxSlot = 1
        }, pkm2);

        loader.WriteEntity(entity3 with
        {
            BoxId = 0,
            BoxSlot = 0
        });

        loader.WriteEntity(entity1 with
        {
            BoxId = 0,
            BoxSlot = 1
        });
        loader.WriteEntity(entity2 with
        {
            BoxId = 0,
            BoxSlot = 1
        });

        var firstSlotVersions = loader.GetEntitiesByBox(0, 0);
        var secondSlotVersions = loader.GetEntitiesByBox(0, 1);

        Assert.Single(firstSlotVersions);
        Assert.Equal(5, firstSlotVersions["3"].Generation);

        Assert.Equal(2, secondSlotVersions.Count);
        Assert.Equal(4, secondSlotVersions["1"].Generation);
        Assert.Equal(3, secondSlotVersions["2"].Generation);
    }

    #endregion

    #region Persistence

    [Fact]
    public async Task WriteToFile_ShouldPersistBothJsonAndPkmFiles()
    {
        var loader = CreateLoader();
        var pkm = CreateTestPkm();
        var entity = CreateEntity() with
        {
            Id = "1",
            Filepath = "storage/3/test.pk3"
        };
        loader.WriteEntity(entity, pkm);

        await loader.WriteToFile();

        Assert.True(mockFileSystem.FileExists("/db/pkm-version.json"));
        Assert.True(mockFileSystem.FileExists("storage/3/test.pk3"));
    }

    [Fact]
    public async Task WriteToFile_ShouldNotPersist_WhenNoExplicitFileWrite()
    {
        var loader = CreateLoader();
        var pkm = CreateTestPkm();
        var entity = CreateEntity() with
        {
            Id = "1",
            Filepath = "storage/3/test.pk3"
        };
        loader.WriteEntity(entity, pkm);

        Assert.False(mockFileSystem.FileExists("/db/pkm-version.json"));
        Assert.False(mockFileSystem.FileExists("storage/3/test.pk3"));
    }

    #endregion

    private SaveWrapper CreateMockSave(byte generation, uint saveId)
    {
        SaveFile save = generation switch
        {
            3 => new SAV3E(),
            4 => new SAV4DP(),
            _ => throw new NotImplementedException()
        };
        save.ID32 = saveId;
        var wrapper = new SaveWrapper(save);
        return wrapper;
    }
}
