using Moq;
using PKHeX.Core;

public class SavePkmLoaderTests : IAsyncLifetime
{
    private Dictionary<ushort, StaticEvolve> evolves;

    private readonly Mock<PkmConvertService> mockConvertService;
    private readonly SaveWrapper mockSave;

    public SavePkmLoaderTests()
    {
        mockConvertService = new Mock<PkmConvertService>(MockBehavior.Strict, null!);
        mockSave = CreateTestSave();
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

    private SavePkmLoader CreateLoader()
    {
        return new SavePkmLoader(
            mockConvertService.Object,
            language: "en", evolves,
            mockSave
        );
    }

    private SaveWrapper CreateTestSave()
    {
        var save = new SAV3E();
        save.ID32 = 100;
        return new SaveWrapper(save, "/test/save.sav");
    }

    private ImmutablePKM CreateTestPkm(ushort species = 25)
    {
        var pk = new PK3
        {
            Species = species,
            PID = 12345,
            TID16 = 54321,
            Nickname = "TEST"
        };
        return new ImmutablePKM(pk);
    }

    #region DTO Creation

    [Fact]
    public void CreateDTO_ShouldGenerateCorrectId()
    {
        var loader = CreateLoader();
        var pkm = CreateTestPkm(species: 25);
        int box = 3;
        int slot = 15;

        var dto = loader.CreateDTO(mockSave, pkm, box, slot);

        Assert.Equal(
            pkm.GetPKMIdBase(evolves),
            dto.IdBase
        );
        Assert.Equal(
            $"{pkm.GetPKMIdBase(evolves)}B{box}S{slot}",
            dto.Id
        );
    }

    [Fact]
    public void CreateDTO_ShouldSetCorrectProperties()
    {
        var loader = CreateLoader();
        var pkm = CreateTestPkm(species: 25);

        var dto = loader.CreateDTO(mockSave, pkm, 3, 15);

        Assert.Equal(3, dto.BoxId);
        Assert.Equal(15, dto.BoxSlot);
        Assert.Equal((uint)100, dto.SaveId);
        Assert.Equal(25, dto.Species);
        Assert.Equal(3, dto.Generation);
        Assert.Equal("TEST", dto.Nickname);
    }

    #endregion

    #region GetDto Operations

    [Fact]
    public void GetDto_ById_ShouldReturnCorrectPkm()
    {
        var loader = CreateLoader();
        var pkm = CreateTestPkm(species: 25);
        var dto = loader.CreateDTO(mockSave, pkm, 0, 5);
        loader.WriteDto(dto);

        var result = loader.GetDto(dto.Id);

        Assert.NotNull(result);
        Assert.Equivalent(dto, result);
    }

    [Fact]
    public void GetAllDtos_ShouldReturnAllPkms()
    {
        var loader = CreateLoader();
        var pkm1 = CreateTestPkm(species: 25);
        var pkm2 = CreateTestPkm(species: 150);

        loader.WriteDto(loader.CreateDTO(mockSave, pkm1, 0, 0));
        loader.WriteDto(loader.CreateDTO(mockSave, pkm2, 0, 1));

        var all = loader.GetAllDtos();

        Assert.Equal(2, all.Count);
        Assert.Equal(25, all[0].Species);
        Assert.Equal(150, all[1].Species);
    }

    #endregion

    #region Write/Delete Operations

    [Fact]
    public void WriteDto_ShouldAddNewPkm()
    {
        var loader = CreateLoader();
        var pkm = CreateTestPkm(species: 25);
        var dto = loader.CreateDTO(mockSave, pkm, 0, 5);

        loader.WriteDto(dto);

        Assert.NotNull(loader.GetDto(dto.Id));
        Assert.True(loader.HasWritten);
    }

    [Fact]
    public void WriteDto_ShouldReplaceExisting_AtSamePosition()
    {
        var loader = CreateLoader();
        var pkm1 = CreateTestPkm(species: 25);
        var pkm2 = CreateTestPkm(species: 150);

        var dto1 = loader.CreateDTO(mockSave, pkm1, 0, 5);
        var dto2 = loader.CreateDTO(mockSave, pkm2, 0, 5);

        loader.WriteDto(dto1);
        loader.WriteDto(dto2);

        var result = loader.GetDto(box: 0, boxSlot: 5);

        Assert.Equal(150, result.Species);
        Assert.Single(loader.GetAllDtos());
    }

    [Fact]
    public void DeleteDto_ShouldRemovePkm()
    {
        var loader = CreateLoader();
        var pkm = CreateTestPkm();
        var dto = loader.CreateDTO(mockSave, pkm, 0, 5);
        loader.WriteDto(dto);

        loader.DeleteDto(dto.Id);

        Assert.Null(loader.GetDto(dto.Id));
        Assert.True(loader.HasWritten);
    }

    #endregion

    #region Party Management

    [Fact]
    public void FlushParty_ShouldReorder()
    {
        var loader = CreateLoader();
        var pkm1 = CreateTestPkm(species: 25);
        var pkm2 = CreateTestPkm(species: 150);
        var pkm3 = CreateTestPkm(species: 249);

        loader.WriteDto(loader.CreateDTO(mockSave, pkm3, (int)BoxType.Party, 4));
        loader.WriteDto(loader.CreateDTO(mockSave, pkm1, (int)BoxType.Party, 0));
        loader.WriteDto(loader.CreateDTO(mockSave, pkm2, (int)BoxType.Party, 2));

        loader.FlushParty();

        var party = loader.GetAllDtos().OrderBy(d => d.BoxSlot).ToList();

        Assert.Equal(3, party.Count);

        Assert.Equal(25, party[0].Species);
        Assert.Equal(0, party[0].BoxSlot);

        Assert.Equal(150, party[1].Species);
        Assert.Equal(1, party[1].BoxSlot);

        Assert.Equal(249, party[2].Species);
        Assert.Equal(2, party[2].BoxSlot);
    }

    #endregion

    #region Duplicate Detection

    [Fact]
    public void GetAllDtos_ShouldMarkDuplicates()
    {
        var loader = CreateLoader();
        var pkm1 = CreateTestPkm(species: 25);
        var pkm2 = CreateTestPkm(species: 150);

        var dto1 = loader.CreateDTO(mockSave, pkm1, 0, 0);
        // dtos with same IdBase
        var dto2 = loader.CreateDTO(mockSave, pkm2, 0, 1);
        var dto3 = loader.CreateDTO(mockSave, pkm2, 0, 2);

        loader.WriteDto(dto1);
        loader.WriteDto(dto2);
        loader.WriteDto(dto3);

        var all = loader.GetAllDtos();

        Assert.Equal(3, all.Count);

        Assert.False(all.Find(dto => dto.Id == dto1.Id)!.IsDuplicate);
        Assert.True(all.Find(dto => dto.Id == dto2.Id)!.IsDuplicate);
        Assert.True(all.Find(dto => dto.Id == dto3.Id)!.IsDuplicate);
    }

    #endregion

    #region Flags System

    [Fact]
    public void SetFlags_ShouldTrackChanges()
    {
        var loader = CreateLoader();
        var flags = new DataUpdateSaveListFlags();
        loader.SetFlags(flags);

        var pkm = CreateTestPkm();
        var dto = loader.CreateDTO(mockSave, pkm, 0, 0);

        loader.WriteDto(dto);

        var saveFlags = flags.GetSaves().FirstOrDefault();

        Assert.NotNull(saveFlags);
        Assert.Contains(dto.Id, saveFlags.SavePkms.Ids);
    }

    #endregion

    #region Edge Cases

    [Fact]
    public void CreateDTO_ShouldHandle_BoxTypeParty()
    {
        var loader = CreateLoader();
        var pkm = CreateTestPkm();

        var dto = loader.CreateDTO(mockSave, pkm, (int)BoxType.Party, 0);

        Assert.True(dto.CanMove);
        Assert.True(dto.CanDelete);
    }

    [Fact]
    public void CreateDTO_ShouldHandle_BoxTypeDaycare()
    {
        var loader = CreateLoader();
        var pkm = CreateTestPkm();

        var dto = loader.CreateDTO(mockSave, pkm, (int)BoxType.Daycare, 0);

        Assert.False(dto.CanMove);
        Assert.False(dto.CanDelete);
    }

    [Fact]
    public void WriteDto_ShouldThrow_WhenPkmDisabled()
    {
        var loader = CreateLoader();
        var brokenPkm = new ImmutablePKM(new PK3(), PKMLoadError.NOT_FOUND);
        var dto = loader.CreateDTO(mockSave, brokenPkm, 0, 0);

        Assert.ThrowsAny<Exception>(() => loader.WriteDto(dto));
    }

    #endregion

    #region Integration Scenarios

    [Fact]
    public void Scenario_MovePartyPkm_ShouldUpdatePosition()
    {
        var loader = CreateLoader();
        var pkm = CreateTestPkm(species: 25);
        var dto = loader.CreateDTO(mockSave, pkm, (int)BoxType.Party, 0);
        loader.WriteDto(dto);

        // move to box 0 slot 5
        loader.DeleteDto(dto.Id);
        var movedDto = loader.CreateDTO(mockSave, pkm, 0, 5);
        loader.WriteDto(movedDto);

        Assert.Null(loader.GetDto((int)BoxType.Party, 0));
        Assert.NotNull(loader.GetDto(0, 5));
    }

    [Fact]
    public void Scenario_SwapPkms_ShouldExchangePositions()
    {
        var loader = CreateLoader();
        var pkm1 = CreateTestPkm(species: 25);
        var pkm2 = CreateTestPkm(species: 150);

        var dto1 = loader.CreateDTO(mockSave, pkm1, 0, 0);
        var dto2 = loader.CreateDTO(mockSave, pkm2, 0, 5);
        loader.WriteDto(dto1);
        loader.WriteDto(dto2);

        loader.DeleteDto(dto1.Id);
        loader.DeleteDto(dto2.Id);

        var swapped1 = loader.CreateDTO(mockSave, pkm1, 0, 5);
        var swapped2 = loader.CreateDTO(mockSave, pkm2, 0, 0);
        loader.WriteDto(swapped1);
        loader.WriteDto(swapped2);

        Assert.Equal(150, loader.GetDto(0, 0)!.Species);
        Assert.Equal(25, loader.GetDto(0, 5)!.Species);
    }

    #endregion

    [Fact]
    public void GetDto_ByBoxAndSlot_ShouldReturnCorrectPkm()
    {
        var loader = CreateLoader();
        var pkm = CreateTestPkm(species: 25);
        var dto = loader.CreateDTO(mockSave, pkm, 2, 10);
        loader.WriteDto(dto);

        Assert.NotNull(loader.GetDto(box: 2, boxSlot: 10));
    }
}
