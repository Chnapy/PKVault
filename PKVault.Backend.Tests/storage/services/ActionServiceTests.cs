using System.IO.Abstractions.TestingHelpers;
using System.Text;
using Moq;

public class ActionServiceTests
{
    private readonly MockFileSystem mockFileSystem;
    private readonly IFileIOService fileIOService;
    private readonly Mock<ILoadersService> mockLoadersService;
    private readonly Mock<ISettingsService> mockSettingsService;
    private readonly Mock<ISaveService> mockSaveService = new();

    private readonly ActionService actionService;

    public ActionServiceTests()
    {
        mockFileSystem = new MockFileSystem();
        fileIOService = new FileIOService(mockFileSystem);

        mockLoadersService = new();
        mockSettingsService = new();
        StaticDataService staticDataService = new(mockSettingsService.Object);
        PkmLegalityService pkmLegalityService = new(mockSettingsService.Object);
        DexService dexService = new(mockLoadersService.Object, staticDataService);

        actionService = new(
            loadersService: mockLoadersService.Object,
            pkmConvertService: new(pkmLegalityService),
            staticDataService,
            dexService,
            backupService: new(
                fileIOService, mockLoadersService.Object,
                mockSaveService.Object, mockSettingsService.Object
            ),
            settingsService: mockSettingsService.Object,
            pkmLegalityService: pkmLegalityService
        );
    }

    [Fact]
    public async Task Save_CreatesBackupFile()
    {
        ConfigureSettings("mock-bkp");

        var loaders = GetEntityLoaders(
            DateTime.Parse("2011-03-21 13:26:11")
        );

        loaders.actions.Add(
            new FakeDataAction(shouldThrow: false)
        );

        mockLoadersService.Setup(x => x.CreateLoaders()).ReturnsAsync(
            () => GetEntityLoaders(
                DateTime.Parse("2013-03-21 13:26:11")
            )
        );
        mockLoadersService.Setup(x => x.GetLoaders()).ReturnsAsync(loaders);

        var flags = await actionService.Save();

        Assert.True(mockFileSystem.FileExists("mock-bkp\\pkvault_backup_2013-03-21T132611-000Z.zip"));
    }

    [Fact]
    public async Task Save_RestoreBackupOnException()
    {
        ConfigureSettings("mock-bkp");

        var loaders = GetEntityLoaders(
            DateTime.Parse("2011-03-21 13:26:11"),
            throwsOnDexWrite: true
        );
        loaders.actions.Add(
            new FakeDataAction(shouldThrow: false)
        );

        mockLoadersService.Setup(x => x.CreateLoaders()).ReturnsAsync(
            () => GetEntityLoaders(
                DateTime.Parse("2013-03-21 13:26:11")
            )
        );
        mockLoadersService.Setup(x => x.GetLoaders()).ReturnsAsync(loaders);

        await Assert.ThrowsAnyAsync<Exception>(actionService.Save);

        Assert.True(mockFileSystem.FileExists("mock-bkp\\pkvault_backup_2013-03-21T132611-000Z.zip"));

        Assert.True(mockFileSystem.FileExists("mock-bank.json"));
        Assert.True(mockFileSystem.FileExists("mock-box.json"));
        Assert.True(mockFileSystem.FileExists("mock-pkm.json"));
        Assert.True(mockFileSystem.FileExists("mock-pkm-version.json"));
        Assert.True(mockFileSystem.FileExists("mock-dex.json"));
        Assert.True(mockFileSystem.FileExists("mock-save-path"));
        Assert.True(mockFileSystem.FileExists("mock-pkm-files\\456"));
    }

    private DataEntityLoaders GetEntityLoaders(
        DateTime startTime,
        bool throwsOnDexWrite = false
    )
    {
        var mockBankLoader = EntityLoaderUtil.GetMockBankLoader("mock-bank.json", Encoding.ASCII.GetBytes("mock-bank-values"));
        var mockBoxLoader = EntityLoaderUtil.GetMockBoxLoader("mock-box.json", Encoding.ASCII.GetBytes("mock-box-values"));
        var mockPkmLoader = EntityLoaderUtil.GetMockPkmLoader("mock-pkm.json", Encoding.ASCII.GetBytes("mock-pkm-values"));
        var mockPkmVersionLoader = EntityLoaderUtil.GetMockPkmVersionLoader(
            "mock-pkm-version.json",
            Encoding.ASCII.GetBytes("mock-pkm-version-values"),
            pkmFiles: new(){
                { "mock-pkm-files/123", (Data: [], Error: PKMLoadError.NOT_FOUND) },    // should be ignored
                { "mock-pkm-files/456", (Data: Encoding.ASCII.GetBytes("mock-pkfile-content"), Error: null) }
            }
        );
        var mockDexLoader = EntityLoaderUtil.GetMockDexLoader("mock-dex.json", Encoding.ASCII.GetBytes("mock-dex-values"));
        if (throwsOnDexWrite)
        {
            mockDexLoader.Setup(x => x.WriteToFile()).Throws<Exception>();
        }

        var saveWrapper = SaveWrapperTests.GetMockSave("mock-save-path", Encoding.ASCII.GetBytes("mock-save-content"));

        Mock<ISaveBoxLoader> mockSaveBoxLoader = new();
        Mock<ISavePkmLoader> mockSavePkmLoader = new();

        return new DataEntityLoaders(mockSaveService.Object)
        {
            startTime = startTime,
            bankLoader = mockBankLoader.Object,
            boxLoader = mockBoxLoader.Object,
            legacyPkmLoader = mockPkmLoader.Object,
            pkmVersionLoader = mockPkmVersionLoader.Object,
            dexLoader = mockDexLoader.Object,
            saveLoadersDict = new(){
                    {saveWrapper.Object.Id, new(
                        saveWrapper.Object,
                        mockSaveBoxLoader.Object,
                        mockSavePkmLoader.Object
                    )}
                }
        };
    }

    private void ConfigureSettings(
        string backupPath
    )
    {
        mockSettingsService.Setup(x => x.GetSettings()).Returns(new SettingsDTO(
            BuildID: default, Version: "", PkhexVersion: "", AppDirectory: "", SettingsPath: "",
            CanUpdateSettings: false, CanScanSaves: false, SettingsMutable: new(
                DB_PATH: "mock-db", SAVE_GLOBS: [], STORAGE_PATH: "mock-storage", BACKUP_PATH: backupPath,
                LANGUAGE: "en"
            )
        ));
    }
}

class FakeDataAction(bool shouldThrow) : DataAction
{
    protected override async Task<DataActionPayload> Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        if (shouldThrow)
        {
            throw new Exception();
        }

        return new(DataActionType.DATA_NORMALIZE, []);
    }
}
