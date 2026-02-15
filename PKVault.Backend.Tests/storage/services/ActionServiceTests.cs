using System.IO.Abstractions.TestingHelpers;
using System.Text;
using Microsoft.Extensions.DependencyInjection;
using Moq;

public class ActionServiceTests
{
    private readonly MockFileSystem mockFileSystem = new();
    private readonly IFileIOService fileIOService;
    private readonly Mock<ISettingsService> mockSettingsService = new();
    private readonly Mock<ISessionService> mockSessionService = new();

    public ActionServiceTests()
    {
        fileIOService = new FileIOService(mockFileSystem);
    }

    private ActionService GetService(DateTime now, bool throwOnSessionPersist = false)
    {
        var serviceCollection = new ServiceCollection();

        var mockTimeProvider = new Mock<TimeProvider>();
        mockTimeProvider.Setup(x => x.GetUtcNow()).Returns(new DateTimeOffset(now));

        mockFileSystem.AddFile("mock-main.db", "mock-db");  // main db
        DataNormalizeAction.GetLegacyFilepaths("legacy")
            .ForEach(legacyPath => mockFileSystem.AddFile(legacyPath, "mock-legacy-data"));

        mockSessionService.Setup(x => x.MainDbPath).Returns(Path.Combine(PathUtils.GetExpectedAppDirectory(), "mock-main.db"));
        mockSessionService.Setup(x => x.MainDbRelativePath).Returns("mock-main.db");
        if (throwOnSessionPersist)
        {
            mockSessionService.Setup(x => x.PersistSession(It.IsAny<IServiceScope>())).ThrowsAsync(new Exception());
        }

        PkmLegalityService pkmLegalityService = new(mockSettingsService.Object);

        Mock<ISaveService> mockSaveService = new();

        var saveWrapper = SaveWrapperTests.GetMockSave("mock-save-path", Encoding.ASCII.GetBytes("mock-save-content"));
        mockSaveService.Setup(x => x.GetSaveById()).ReturnsAsync(new Dictionary<uint, SaveWrapper>()
        {
            {saveWrapper.Object.Id, saveWrapper.Object}
        });

        mockFileSystem.AddFile("mock-pkm-files/123", "mock-data");

        var mockPkmFileService = new Mock<IPkmFileLoader>();
        mockPkmFileService.Setup(x => x.GetEnabledFilepaths()).ReturnsAsync([
            "mock-pkm-files/123",
            "mock-pkm-files/456",
        ]);

        serviceCollection.AddSingleton(mockPkmFileService.Object);

        var sp = serviceCollection.BuildServiceProvider();

        SavesLoadersService savesLoadersService = new(sp, mockSaveService.Object);

        return new(
            sp: sp,
            pkmConvertService: new(pkmLegalityService),
            backupService: new(
                sp: sp,
                mockTimeProvider.Object,
                fileIOService,
                mockSaveService.Object,
                mockSettingsService.Object,
                mockSessionService.Object
            ),
            settingsService: mockSettingsService.Object,
            pkmLegalityService: pkmLegalityService,
            sessionService: mockSessionService.Object,
            savesLoadersService: savesLoadersService
        );
    }

    [Fact]
    public async Task Save_CreatesBackupFile()
    {
        ConfigureSettings("mock-bkp");

        var actionService = GetService(
            now: DateTime.Parse("2013-03-21 13:26:11")
        );

        mockSessionService.Setup(x => x.Actions).Returns([
            new(
                ActionFn: async (scope, flags) => new(DataActionType.DATA_NORMALIZE, []),
                new(DataActionType.DATA_NORMALIZE, [])
            )
        ]);

        var flags = await actionService.Save();

        Assert.True(mockFileSystem.FileExists(
                Path.Combine(PathUtils.GetExpectedAppDirectory(), "mock-bkp", "pkvault_backup_2013-03-21T132611-000Z.zip")
            ),
            $"File is missing, list of current files:\n{string.Join('\n', mockFileSystem.AllFiles)}");
    }

    [Fact]
    public async Task Save_RestoreBackupOnException()
    {
        ConfigureSettings("mock-bkp");

        var actionService = GetService(
            now: DateTime.Parse("2013-03-21 13:26:11"),
            throwOnSessionPersist: true
        );


        mockSessionService.Setup(x => x.Actions).Returns([
            new(
                ActionFn: async (scope, flags) => new(DataActionType.DATA_NORMALIZE, []),
                new(DataActionType.DATA_NORMALIZE, [])
            )
        ]);

        await Assert.ThrowsAnyAsync<Exception>(actionService.Save);

        Assert.True(mockFileSystem.FileExists(Path.Combine(PathUtils.GetExpectedAppDirectory(), "mock-bkp", "pkvault_backup_2013-03-21T132611-000Z.zip")));

        Assert.True(mockFileSystem.FileExists("mock-main.db"));

        DataNormalizeAction.GetLegacyFilepaths("legacy")
            .ForEach(legacyPath => Assert.True(mockFileSystem.FileExists(legacyPath)));

        Assert.True(mockFileSystem.FileExists(Path.Combine(PathUtils.GetExpectedAppDirectory(), "mock-save-path")), string.Join('\n', mockFileSystem.AllFiles));
        Assert.True(mockFileSystem.FileExists(Path.Combine("mock-pkm-files", "123")));
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
