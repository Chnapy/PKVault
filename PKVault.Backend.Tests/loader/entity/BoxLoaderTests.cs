using System.IO.Abstractions.TestingHelpers;

public class BoxLoaderTests
{
    private readonly MockFileSystem mockFileSystem;
    private readonly IFileIOService fileIOService;

    public BoxLoaderTests()
    {
        mockFileSystem = new MockFileSystem();
        fileIOService = new FileIOService(mockFileSystem);
    }

    private BoxLoader CreateLoader()
    {
        return new BoxLoader(fileIOService, "db");
    }

    #region CRUD operations

    [Fact]
    public void WriteEntity_ShouldCreateNewBox_WhenNotExists()
    {
        var loader = CreateLoader();
        var entity = new BoxEntity(
            Id: "1",
            Name: "Test Box",
            Type: BoxType.Box,
            SlotCount: 30,
            Order: 0,
            BankId: "bank1",
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
        var original = new BoxEntity("1", "Original", BoxType.Box, 30, 0, "bank1", 1);
        loader.WriteEntity(original);

        var updated = original with { Name = "Updated" };

        loader.WriteEntity(updated);

        Assert.Equivalent(updated, loader.GetEntity("1"));
        Assert.Single(loader.GetAllEntities());
    }

    [Fact]
    public void DeleteEntity_ShouldRemoveBox_WhenExists()
    {
        var loader = CreateLoader();
        var entity = new BoxEntity("1", "Test", BoxType.Box, 30, 0, "bank1", 1);
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
    public void GetAllDtos_ShouldReturnAllBoxes()
    {
        var loader = CreateLoader();
        loader.WriteEntity(new BoxEntity("1", "Box 1", BoxType.Box, 30, 0, "bank1", 1));
        loader.WriteEntity(new BoxEntity("2", "Box 2", BoxType.Box, 30, 10, "bank1", 1));

        var dtos = loader.GetAllDtos();

        Assert.Equal(2, dtos.Count);
        Assert.Equal("Box 1", dtos[0].Name);
        Assert.Equal("Box 2", dtos[1].Name);
    }

    #endregion

    #region Order normalization

    [Fact]
    public void NormalizeOrders_ShouldReorderBoxes_WithGaps()
    {
        var loader = CreateLoader();
        loader.WriteEntity(new BoxEntity("1", "Box 1", BoxType.Box, 30, 10, "bank1", 1));
        loader.WriteEntity(new BoxEntity("2", "Box 2", BoxType.Box, 30, 5, "bank1", 1));
        loader.WriteEntity(new BoxEntity("3", "Box 3", BoxType.Box, 30, 100, "bank1", 1));

        loader.NormalizeOrders();

        var boxes = loader.GetAllEntities();
        Assert.Equal(10, boxes["1"].Order);
        Assert.Equal(0, boxes["2"].Order);
        Assert.Equal(20, boxes["3"].Order);
    }

    [Fact]
    public void NormalizeOrders_ShouldHandleMultipleBanks()
    {
        var loader = CreateLoader();
        // Bank 1
        loader.WriteEntity(new BoxEntity("1", "B1-Box1", BoxType.Box, 30, 10, "bank1", 1));
        loader.WriteEntity(new BoxEntity("2", "B1-Box2", BoxType.Box, 30, 5, "bank1", 1));
        // Bank 2
        loader.WriteEntity(new BoxEntity("3", "B2-Box1", BoxType.Box, 30, 7, "bank2", 1));
        loader.WriteEntity(new BoxEntity("4", "B2-Box2", BoxType.Box, 30, 2, "bank2", 1));

        loader.NormalizeOrders();

        // Assert
        var bank1Boxes = loader.GetAllDtos()
            .Where(b => b.BankId == "bank1")
            .OrderBy(b => b.Order)
            .ToList();
        var bank2Boxes = loader.GetAllDtos()
            .Where(b => b.BankId == "bank2")
            .OrderBy(b => b.Order)
            .ToList();

        var boxes = loader.GetAllEntities();
        Assert.Equal(10, boxes["1"].Order);
        Assert.Equal(0, boxes["2"].Order);
        Assert.Equal(10, boxes["3"].Order);
        Assert.Equal(0, boxes["4"].Order);
    }

    #endregion

    #region DTO creation

    [Fact]
    public void CreateDTO_ShouldSetCorrectFlags()
    {
        var loader = CreateLoader();

        // Box
        var normalBox = new BoxEntity("1", "Normal", BoxType.Box, 30, 0, "bank1", 1);
        var normalDto = loader.CreateDTO(normalBox);

        Assert.True(normalDto.CanSaveWrite);
        Assert.True(normalDto.CanSaveReceivePkm);

        // Party
        var partyBox = normalBox with { Type = BoxType.Party };
        var partyDto = loader.CreateDTO(partyBox);

        Assert.False(partyDto.CanSaveWrite);
        Assert.True(partyDto.CanSaveReceivePkm);

        // Daycare
        var daycareBox = normalBox with { Type = BoxType.Daycare };
        var daycareDto = loader.CreateDTO(daycareBox);

        Assert.False(daycareDto.CanSaveWrite);
        Assert.False(daycareDto.CanSaveReceivePkm);
    }

    [Fact]
    public void CreateDTO_ShouldConvertIdCorrectly()
    {
        var loader = CreateLoader();
        var entity = new BoxEntity("42", "Test", BoxType.Box, 30, 0, "bank1", 1);

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
        loader.WriteEntity(new BoxEntity("1", "Test", BoxType.Box, 30, 0, "bank1", 1));

        await loader.WriteToFile();

        Assert.True(mockFileSystem.FileExists("db/box.json"));
        var json = mockFileSystem.File.ReadAllText("db/box.json");
        Assert.Contains("Test", json);
    }

    [Fact]
    public async Task WriteToFile_ShouldNotWrite_WhenNoChanges()
    {
        var loader = CreateLoader();

        await loader.WriteToFile();

        Assert.False(mockFileSystem.FileExists("db/box.json"));
    }

    [Fact]
    public async Task WriteToFile_ShouldNotWrite_WhenNoExplicitFileWrite()
    {
        var loader = CreateLoader();
        var entity = new BoxEntity(
            Id: "1",
            Name: "Test Box",
            Type: BoxType.Box,
            SlotCount: 30,
            Order: 0,
            BankId: "bank1",
            SchemaVersion: 1
        );

        loader.WriteEntity(entity);

        Assert.False(mockFileSystem.FileExists("db/box.json"));
    }

    [Fact]
    public void GetAllEntities_ShouldLoadFromFile()
    {
        var json = """
        {
            "1": {
                "Id": "1",
                "Name": "Loaded Box",
                "Type": 0,
                "SlotCount": 30,
                "Order": 0,
                "BankId": "bank1",
                "SchemaVersion": 1
            }
        }
        """;
        mockFileSystem.AddFile("db/box.json", new MockFileData(json));
        var loader = CreateLoader();

        var entities = loader.GetAllEntities();

        Assert.Single(entities);
        Assert.Equal("Loaded Box", entities["1"].Name);
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
