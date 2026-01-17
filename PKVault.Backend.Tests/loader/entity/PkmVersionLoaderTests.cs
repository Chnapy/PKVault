using System.IO.Abstractions.TestingHelpers;
using Moq;
using PKHeX.Core;

public class PkmVersionLoaderTests : IAsyncLifetime
{
    private Dictionary<ushort, StaticEvolve> evolves;

    private readonly MockFileSystem mockFileSystem;
    private readonly IFileIOService fileIOService;
    private readonly Mock<IPkmLoader> mockPkmLoader;

    public PkmVersionLoaderTests()
    {
        mockFileSystem = new MockFileSystem();
        fileIOService = new FileIOService(mockFileSystem);
        mockPkmLoader = new Mock<IPkmLoader>();
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
            evolves,
            mockPkmLoader.Object);
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
        var entity = new PkmVersionEntity(
            Id: "1",
            PkmId: "pkm1",
            Generation: 3,
            Filepath: "storage/3/test.pk3",
            SchemaVersion: 1
        );

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
        var entity = new PkmVersionEntity(
            Id: "1",
            PkmId: "pkm1",
            Generation: 3,
            Filepath: "storage/3/test.pk3",
            SchemaVersion: 1
        );
        loader.WriteEntity(entity, pkm);

        var deleted = loader.DeleteEntity(entity.Id);

        Assert.True(deleted);
        Assert.Null(loader.GetEntity("1"));
        Assert.True(loader.HasWritten);
    }

    [Fact]
    public void GetEntitiesByPkmId_ShouldReturnAllVersions()
    {
        var loader = CreateLoader();
        var pkm1 = CreateTestPkm(generation: 3);
        var pkm2 = CreateTestPkm(generation: 4);

        loader.WriteEntity(new PkmVersionEntity(
            "1", "pkm1", 3, "storage/3/test.pk3", 1
        ), pkm1);
        loader.WriteEntity(new PkmVersionEntity(
            "2", "pkm2", 4, "storage/4/test.pk4", 1
        ), pkm2);

        var pkm2Versions = loader.GetEntitiesByPkmId("pkm2");

        Assert.Single(pkm2Versions);
        Assert.Equal(4, pkm2Versions["2"].Generation);
    }

    [Fact]
    public void GetDtosByPkmId_ShouldReturnDTOs()
    {
        var loader = CreateLoader();
        var pkm1 = CreateTestPkm(species: 25);
        loader.WriteEntity(new(
            "1", "pkm1", 3, "storage/3/test1.pk3", 1
        ), pkm1);

        var pkm2 = CreateTestPkm(species: 26);
        loader.WriteEntity(new(
            "2", "pkm2", 3, "storage/3/test2.pk3", 1
        ), pkm2);

        var dtos = loader.GetDtosByPkmId("pkm2");

        Assert.Single(dtos);
        Assert.Equal(26, dtos["2"].Species);
    }

    #endregion

    #region DTO Creation

    [Fact]
    public void CreateDTO_ShouldSetAllProperties()
    {
        var loader = CreateLoader();
        var pkm = CreateTestPkm(species: 25, generation: 3);
        mockFileSystem.AddFile("storage/3/test.pk3", new MockFileData(pkm.DecryptedPartyData));

        var entity = new PkmVersionEntity(
            Id: "1",
            PkmId: "pkm1",
            Generation: 3,
            Filepath: "storage/3/test.pk3",
            SchemaVersion: 1
        );

        var dto = loader.CreateDTO(entity, pkm);

        Assert.Equal("1", dto.Id);
        Assert.Equal("pkm1", dto.PkmId);
        Assert.Equal(3, dto.Generation);
        Assert.Equal("storage/3/test.pk3", dto.Filepath);
        Assert.Equal("app\\storage/3/test.pk3", dto.FilepathAbsolute);
        Assert.Equal(25, dto.Species);
    }

    [Fact]
    public void CreateDTO_IsMain_ShouldBeTrue_WhenIdMatchesPkmId()
    {
        var loader = CreateLoader();
        var pkm = CreateTestPkm();
        var entity = new PkmVersionEntity(
            Id: "1",
            PkmId: "1", // Same ID = main version
            Generation: 3,
            Filepath: "storage/3/test.pk3",
            SchemaVersion: 1
        );

        var dto = loader.CreateDTO(entity, pkm);

        Assert.True(dto.IsMain);
        Assert.False(dto.CanDelete);
    }

    [Fact]
    public void CreateDTO_IsMain_ShouldBeFalse_WhenIdsDiffer()
    {
        var loader = CreateLoader();
        var pkm = CreateTestPkm();
        var entity = new PkmVersionEntity(
            Id: "1",
            PkmId: "2", // different ID
            Generation: 3,
            Filepath: "storage/3/test.pk3",
            SchemaVersion: 1
        );

        var dto = loader.CreateDTO(entity, pkm);

        Assert.False(dto.IsMain);
        Assert.True(dto.CanDelete);
    }

    #endregion

    #region PKM File Handling

    [Fact]
    public void GetPkmVersionEntityPkm_ShouldLoadPKMFile()
    {
        var loader = CreateLoader();
        var pkm = CreateTestPkm(species: 25);

        var entity = new PkmVersionEntity(
            pkm.GetPKMIdBase(evolves), "pkm1", 3, "storage/3/test.pk3", 1
        );
        loader.WriteEntity(entity, pkm);

        var loadedPkm = loader.GetPkmVersionEntityPkm(entity);

        Assert.Equal(25, loadedPkm.Species);
        Assert.True(loadedPkm.IsEnabled);
    }

    [Fact]
    public void GetPkmVersionEntityPkm_ShouldHandleMissingFile()
    {
        var loader = CreateLoader();
        var entity = new PkmVersionEntity(
            "1", "pkm1", 3, "storage/3/missing.pk3", 1
        );

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
        var save = CreateMockSave(generation: 3, saveId: 100);

        var entity = new PkmVersionEntity(
            pkm.GetPKMIdBase(evolves), "pkm1", 3, "storage/3/test.pk3", 1
        );
        loader.WriteEntity(entity, pkm);

        // Mock PkmLoader to return expected SaveId
        mockPkmLoader.Setup(p => p.GetEntity("pkm1"))
            .Returns(new PkmEntity("pkm1", 1, 1, SaveId: 100, 1));

        var pkmSave = new PkmSaveDTO(
            SettingsLanguage: "en",
            Pkm: pkm,
            SaveId: 100,
            BoxId: 0,
            BoxSlot: 0,
            IsDuplicate: false,
            Save: save,
            Evolves: evolves
        );

        var version = loader.GetPkmSaveVersion(pkmSave);

        Assert.NotNull(version);
        Assert.Equal(pkm.GetPKMIdBase(evolves), version.Id);
    }

    [Fact]
    public void GetPkmSaveVersion_ShouldReturnNull_WhenGenerationMismatch()
    {
        var loader = CreateLoader();
        var pkm = CreateTestPkm(generation: 3);
        var save = CreateMockSave(generation: 4, saveId: 100); // different

        var entity = new PkmVersionEntity(
            "1", "pkm1", 3, "storage/3/test.pk3", 1
        );
        loader.WriteEntity(entity, pkm);

        mockPkmLoader.Setup(p => p.GetEntity("pkm1"))
            .Returns(new PkmEntity("pkm1", 1, 1, 100, 1));

        var pkmSave = new PkmSaveDTO(
            SettingsLanguage: "en",
            Pkm: pkm,
            SaveId: 100,
            BoxId: 0,
            BoxSlot: 0,
            IsDuplicate: false,
            Save: save,
            Evolves: evolves
        );

        var version = loader.GetPkmSaveVersion(pkmSave);

        Assert.Null(version);
    }

    #endregion

    #region Entity Update with ID Change

    [Fact]
    public void WriteEntity_ShouldHandlePkmIdChange()
    {
        var loader = CreateLoader();
        var pkm = CreateTestPkm();
        var original = new PkmVersionEntity(
            "1", "pkm1", 3, "storage/3/test.pk3", 1
        );
        loader.WriteEntity(original, pkm);

        var updated = original with { PkmId = "pkm2" };
        loader.WriteEntity(updated, pkm);

        var pkm1Entities = loader.GetEntitiesByPkmId("pkm1");
        var pkm2Entities = loader.GetEntitiesByPkmId("pkm2");

        Assert.Empty(pkm1Entities);

        Assert.Single(pkm2Entities);
        Assert.Equivalent(updated, pkm2Entities["1"]);
    }

    #endregion

    #region Persistence

    [Fact]
    public async Task WriteToFile_ShouldPersistBothJsonAndPkmFiles()
    {
        var loader = CreateLoader();
        var pkm = CreateTestPkm();
        var entity = new PkmVersionEntity(
            "1", "pkm1", 3, "storage/3/test.pk3", 1
        );
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
        var entity = new PkmVersionEntity(
            "1", "pkm1", 3, "storage/3/test.pk3", 1
        );
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
        var wrapper = new SaveWrapper(save, "/test/save.sav");
        return wrapper;
    }
}
