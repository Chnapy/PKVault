using System.IO.Abstractions.TestingHelpers;

public class BankLoaderTests
{
    private readonly MockFileSystem mockFileSystem;
    private readonly IFileIOService fileIOService;

    public BankLoaderTests()
    {
        mockFileSystem = new MockFileSystem();
        fileIOService = new FileIOService(mockFileSystem);
    }

    private BankLoader CreateLoader()
    {
        return new BankLoader(fileIOService, "db");
    }

    #region CRUD operations

    [Fact]
    public void WriteEntity_ShouldCreateNewBank_WhenNotExists()
    {
        var loader = CreateLoader();
        var entity = new BankEntity(
            Id: "1",
            Name: "Test Bank",
            IsDefault: true,
            Order: 0,
            View: new([], []),
            SchemaVersion: 1
        );

        var result = loader.WriteEntity(entity);

        Assert.Equivalent(entity, result);

        Assert.Equivalent(
            entity,
            loader.GetEntity("1")
        );

        Assert.True(loader.HasWritten);
    }

    [Fact]
    public void WriteEntity_ShouldUpdateExisting_WhenExists()
    {
        var loader = CreateLoader();
        var original = new BankEntity("1", "Original", true, 0, new([], []), 1);
        loader.WriteEntity(original);

        var updated = original with { Name = "Updated" };

        loader.WriteEntity(updated);

        Assert.Equivalent(updated, loader.GetEntity("1"));
        Assert.Single(loader.GetAllEntities());
    }

    [Fact]
    public void DeleteEntity_ShouldRemoveBank_WhenExists()
    {
        var loader = CreateLoader();
        var entity = new BankEntity("1", "Test", true, 0, new([], []), 1);
        loader.WriteEntity(entity);

        var deleted = loader.DeleteEntity("1");

        Assert.True(deleted);
        Assert.Null(loader.GetEntity("1"));
        Assert.True(loader.HasWritten);
    }

    [Fact]
    public void DeleteEntity_ShouldReturnFalse_WhenNotExists()
    {
        var loader = CreateLoader();

        var deleted = loader.DeleteEntity("999");

        Assert.False(deleted);
    }

    [Fact]
    public void GetAllDtos_ShouldReturnAllBanks()
    {
        var loader = CreateLoader();
        loader.WriteEntity(new BankEntity("1", "Bank 1", true, 0, new([], []), 1));
        loader.WriteEntity(new BankEntity("2", "Bank 2", true, 0, new([], []), 1));

        var dtos = loader.GetAllDtos();

        Assert.Equal(2, dtos.Count);
        Assert.Equal("Bank 1", dtos[0].Name);
        Assert.Equal("Bank 2", dtos[1].Name);
    }

    #endregion

    #region Order normalization

    [Fact]
    public void NormalizeOrders_ShouldReorderBanks_WithGaps()
    {
        var loader = CreateLoader();
        loader.WriteEntity(new BankEntity("1", "Bank 1", true, 10, new([], []), 1));
        loader.WriteEntity(new BankEntity("2", "Bank 2", true, 5, new([], []), 1));
        loader.WriteEntity(new BankEntity("3", "Bank 3", true, 100, new([], []), 1));

        loader.NormalizeOrders();

        var boxes = loader.GetAllEntities();
        Assert.Equal(10, boxes["1"].Order);
        Assert.Equal(0, boxes["2"].Order);
        Assert.Equal(20, boxes["3"].Order);
    }

    #endregion

    #region DTO creation

    [Fact]
    public void CreateDTO_ShouldConvertIdCorrectly()
    {
        var loader = CreateLoader();
        var entity = new BankEntity("42", "Test", true, 0, new([], []), 1);

        var dto = loader.CreateDTO(entity);

        Assert.Equal("42", dto.Id);
        Assert.Equal(42, dto.IdInt);
    }

    #endregion

    #region Persistence

    [Fact]
    public async Task WriteToFile_ShouldPersistData()
    {
        var loader = CreateLoader();
        loader.WriteEntity(new BankEntity("1", "Test", true, 0, new([], []), 1));

        await loader.WriteToFile();

        Assert.True(mockFileSystem.FileExists("db/bank.json"));
        var json = mockFileSystem.File.ReadAllText("db/bank.json");
        Assert.Contains("Test", json);
    }

    [Fact]
    public async Task WriteToFile_ShouldNotWrite_WhenNoChanges()
    {
        var loader = CreateLoader();

        await loader.WriteToFile();

        Assert.False(mockFileSystem.FileExists("db/bank.json"));
    }

    [Fact]
    public async Task WriteToFile_ShouldNotWrite_WhenNoExplicitFileWrite()
    {
        var loader = CreateLoader();
        var entity = new BankEntity(
            Id: "1",
            Name: "Test Bank",
            true,
            0,
            new([], []),
            SchemaVersion: 1
        );

        loader.WriteEntity(entity);

        Assert.False(mockFileSystem.FileExists("db/bank.json"));
    }

    [Fact]
    public void GetAllEntities_ShouldLoadFromFile()
    {
        var json = """
        {
            "1": {
                "Id": "1",
                "Name": "Loaded Bank",
                "IsDefault": true,
                "Order": 0,
                "View": {
                    "MainBoxIds": [],
                    "Saves": []
                },
                "SchemaVersion": 1
            }
        }
        """;
        mockFileSystem.AddFile("db/bank.json", new MockFileData(json));
        var loader = CreateLoader();

        var entities = loader.GetAllEntities();

        Assert.Single(entities);
        Assert.Equal("Loaded Bank", entities["1"].Name);
    }

    #endregion
}
