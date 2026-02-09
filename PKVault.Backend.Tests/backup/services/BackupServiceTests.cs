using Moq;
using System.IO.Compression;
using System.Text.Json;
using System.Text;
using System.IO.Abstractions.TestingHelpers;
using Microsoft.Extensions.DependencyInjection;

public class BackupServiceTests
{
    private readonly MockFileSystem mockFileSystem = new();
    private readonly IFileIOService fileIOService;

    public BackupServiceTests()
    {
        fileIOService = new FileIOService(mockFileSystem);
    }

    private (BackupService backupService, Mock<ISaveService> mockSaveService, Mock<ISessionService> mockSessionService)
        GetService(DateTime now, bool throwOnSessionPersist = false)
    {
        var serviceCollection = new ServiceCollection();

        var mockTimeProvider = new Mock<TimeProvider>();
        mockTimeProvider.Setup(x => x.GetUtcNow()).Returns(new DateTimeOffset(now));

        mockFileSystem.AddFile(Path.Combine(PathUtils.GetExpectedAppDirectory(), "mock-db", "mock-main.db"), "mock-db");  // main db

        // includes legacy data
        DataNormalizeAction.GetLegacyFilepaths(Path.Combine(PathUtils.GetExpectedAppDirectory(), "mock-db"))
            .ForEach(legacyPath => mockFileSystem.AddFile(legacyPath, "mock-legacy-data"));

        Mock<ISettingsService> mockSettingsService = new();
        mockSettingsService.Setup(x => x.GetSettings()).Returns(new SettingsDTO(
            BuildID: default, Version: "", PkhexVersion: "", AppDirectory: "app", SettingsPath: "",
            CanUpdateSettings: false, CanScanSaves: false, SettingsMutable: new(
                DB_PATH: "mock-db", SAVE_GLOBS: [], STORAGE_PATH: "mock-storage", BACKUP_PATH: "mock-bkp",
                LANGUAGE: "en"
            )
        ));

        Mock<ISessionService> mockSessionService = new();
        mockSessionService.Setup(x => x.MainDbPath).Returns(Path.Combine(PathUtils.GetExpectedAppDirectory(), "mock-db", "mock-main.db"));
        mockSessionService.Setup(x => x.MainDbRelativePath).Returns(Path.Combine("mock-db", "mock-main.db"));
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

        mockFileSystem.AddFile(Path.Combine(PathUtils.GetExpectedAppDirectory(), "mock-pkm-files", "123"), "mock-data");

        var mockPkmFileService = new Mock<IPkmFileLoader>();
        mockPkmFileService.Setup(x => x.GetEnabledFilepaths()).ReturnsAsync([
            "mock-pkm-files/123",
            "mock-pkm-files/456",
        ]);

        serviceCollection.AddSingleton(mockPkmFileService.Object);

        var sp = serviceCollection.BuildServiceProvider();

        BackupService backupService = new(
            sp: sp,
            timeProvider: mockTimeProvider.Object,
            fileIOService: fileIOService,
            saveService: mockSaveService.Object,
            settingsService: mockSettingsService.Object,
            sessionService: mockSessionService.Object
        );

        return (
            backupService,
            mockSaveService,
            mockSessionService
        );
    }

    [Fact]
    public async Task CreateBackup_CreatesValidZipFile()
    {
        var (backupService, _, _) = GetService(
            now: DateTime.Parse("2011-03-21 13:26:11")
        );

        await backupService.CreateBackup();

        // Console.WriteLine(string.Join('\n', mockFileSystem.AllPaths));

        Assert.True(mockFileSystem.FileExists(Path.Combine(PathUtils.GetExpectedAppDirectory(), "mock-bkp", "pkvault_backup_2011-03-21T132611-000Z.zip")));
        var data = mockFileSystem.File.ReadAllBytes(Path.Combine(PathUtils.GetExpectedAppDirectory(), "mock-bkp", "pkvault_backup_2011-03-21T132611-000Z.zip"));
        ArchiveMatchContent(data);
    }

    [Fact]
    public async Task RestoreBackup_RestoreAllFiles()
    {
        var (backupService, mockSave, mockSessionService) = GetService(
            now: DateTime.Parse("2011-03-21 13:26:11")
        );

        var expectedPath = Path.Combine(PathUtils.GetExpectedAppDirectory(), "mock-bkp", "pkvault_backup_2013-03-21T132611-000Z.zip");

        var paths = new Dictionary<string, string>()
            {
                {"db/mock-main.db","mock-main.db"},
                {"db/mock-bank.json","mock-bank.json"},
                {"db/mock-box.json","mock-box.json"},
                {"db/mock-pkm.json","mock-pkm.json"},
                {"db/mock-pkm-version.json","mock-pkm-version.json"},
                {"db/mock-dex.json","mock-dex.json"},
                {$"saves/mock-save-path_123","mock-save-path"},
                {"main/mock-pkm-files/456","mock-pkm-files/456"}
            };

        (string Path, string Content)[] entries = [
            ("_paths.json", JsonSerializer.Serialize(paths)),
            ("db/mock-main.db","mock-main.db"),
            ("db/mock-bank.json", "mock-bank"),
            ("db/mock-box.json", "mock-box"),
            ("db/mock-pkm.json", "mock-pkm"),
            ("db/mock-pkm-version.json", "mock-pkm-version"),
            ("db/mock-dex.json", "mock-dex"),
            ("saves/mock-save-path_123", "mock-save"),
            ("main/mock-pkm-files/456", "mock-pkm-456")
        ];

        using (var memoryStream = new MemoryStream())
        {
            using (var archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, true))
            {
                foreach (var (Path, Content) in entries)
                {
                    var fileContent = Encoding.ASCII.GetBytes(Content);
                    var entry = archive.CreateEntry(Path);
                    using var entryStream = await entry.OpenAsync(TestContext.Current.CancellationToken);
                    await entryStream.WriteAsync(fileContent, TestContext.Current.CancellationToken);
                    // Console.WriteLine(fileEntry.Key);
                }
            }
            mockFileSystem.Directory.CreateDirectory(Path.Combine(PathUtils.GetExpectedAppDirectory(), "mock-bkp"));
            await mockFileSystem.File.WriteAllBytesAsync(expectedPath, memoryStream.ToArray(), TestContext.Current.CancellationToken);
        }

        mockSessionService.Setup(x => x.StartNewSession(true)).Verifiable();
        mockSave.Setup(x => x.InvalidateSaves()).Verifiable();

        await backupService.RestoreBackup(
            DateTime.Parse("2013-03-21 13:26:11"),
            withSafeBackup: true
        );

        // check if backup creation were made
        Assert.True(mockFileSystem.FileExists(Path.Combine(PathUtils.GetExpectedAppDirectory(), "mock-bkp", "pkvault_backup_2011-03-21T132611-000Z.zip")));
        var data = mockFileSystem.File.ReadAllBytes(Path.Combine(PathUtils.GetExpectedAppDirectory(), "mock-bkp", "pkvault_backup_2011-03-21T132611-000Z.zip"));
        ArchiveMatchContent(data);

        // Console.WriteLine(string.Join('\n', mockFileSystem.AllFiles));

        // check all entries extracted
        paths.ToList().ForEach(pathItem =>
        {
            var realPath = Path.Combine(PathUtils.GetExpectedAppDirectory(), pathItem.Value);
            Assert.True(mockFileSystem.FileExists(realPath));
            var fileContent = mockFileSystem.File.ReadAllText(realPath);
            var expectedContent = entries.ToList().Find(e => e.Path == pathItem.Key).Content;
            Assert.Equal(fileContent, expectedContent);
        });

        mockSessionService.Verify(x => x.StartNewSession(true));
        mockSave.Verify(x => x.InvalidateSaves());
    }

    [Fact]
    public async Task RestoreBackup_RestorePartialFiles()
    {
        var (backupService, mockSave, mockSessionService) = GetService(
            now: DateTime.Parse("2011-03-21 13:26:11")
        );

        mockFileSystem.AddEmptyFile("mock-db/mock-main.db");
        mockFileSystem.AddEmptyFile("mock-db/bank.json");
        mockFileSystem.AddEmptyFile("mock-db/box.json");
        mockFileSystem.AddEmptyFile("mock-db/pkm-version.json");
        mockFileSystem.AddEmptyFile("mock-db/dex.json");

        var expectedPath = Path.Combine(PathUtils.GetExpectedAppDirectory(), "mock-bkp", "pkvault_backup_2013-03-21T132611-000Z.zip");

        var paths = new Dictionary<string, string>()
            {
                {"db/box.json","box.json"},
                {"db/pkm-version.json","pkm-version.json"},
                {$"saves/mock-save-path_123","mock-save-path"},
                {"main/mock-pkm-files/456","mock-pkm-files/456"}
            };

        (string Path, string Content)[] entries = [
            ("_paths.json", JsonSerializer.Serialize(paths)),
            ("db/box.json", "mock-box"),
            ("db/pkm-version.json", "mock-pkm-version"),
            ("saves/mock-save-path_123", "mock-save"),
            ("main/mock-pkm-files/456", "mock-pkm-456")
        ];

        using (var memoryStream = new MemoryStream())
        {
            using (var archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, true))
            {
                foreach (var (Path, Content) in entries)
                {
                    var fileContent = Encoding.ASCII.GetBytes(Content);
                    var entry = archive.CreateEntry(Path);
                    using var entryStream = await entry.OpenAsync(TestContext.Current.CancellationToken);
                    await entryStream.WriteAsync(fileContent, TestContext.Current.CancellationToken);
                    // Console.WriteLine(fileEntry.Key);
                }
            }
            mockFileSystem.Directory.CreateDirectory(Path.Combine(PathUtils.GetExpectedAppDirectory(), "mock-bkp"));
            await mockFileSystem.File.WriteAllBytesAsync(expectedPath, memoryStream.ToArray(), TestContext.Current.CancellationToken);
        }

        await backupService.RestoreBackup(
            DateTime.Parse("2013-03-21 13:26:11"),
            withSafeBackup: true
        );

        // Console.WriteLine(string.Join('\n', mockFileSystem.AllFiles));

        // check all entries extracted
        paths.ToList().ForEach(pathItem =>
        {
            var realPath = Path.Combine(PathUtils.GetExpectedAppDirectory(), pathItem.Value);
            Assert.True(mockFileSystem.FileExists(realPath));
            var fileContent = mockFileSystem.File.ReadAllText(realPath);
            var expectedContent = entries.ToList().Find(e => e.Path == pathItem.Key).Content;
            Assert.Equal(fileContent, expectedContent);
        });

        // check DB files are deleted (main db + legacy bank/dex) before archive file are extracted
        // avoiding remaining obsolete data
        Assert.False(mockFileSystem.FileExists(Path.Combine(PathUtils.GetExpectedAppDirectory(), "mock-db/mock-main.db")));
        Assert.False(mockFileSystem.FileExists(Path.Combine(PathUtils.GetExpectedAppDirectory(), "mock-db/bank.json")));
        Assert.False(mockFileSystem.FileExists(Path.Combine(PathUtils.GetExpectedAppDirectory(), "mock-db/dex.json")));
    }

    private bool ArchiveMatchContent(byte[] value)
    {
        using var archive = new ZipArchive(new MemoryStream(value));

        // Console.WriteLine($"Entries=\n{string.Join('\n', archive.Entries.Select(e => e.Name))}");

        var filenamesToCheck = archive.Entries.Select(entry => entry.Name).ToHashSet();

        void AssertArchiveFileContent(
            string filename,
            string expectedContent
        )
        {
            var entry = archive.Entries.ToList().Find(entry => entry.Name == filename);
            ArgumentNullException.ThrowIfNull(entry,
                $"Entry null for name '{filename}'\nEntries=\n{string.Join('\n', archive.Entries.Select(e => e.Name))}");

            var entryStream = entry.Open();
            var fileReader = new StreamReader(entryStream);
            var fileContent = fileReader.ReadToEnd();

            // Console.WriteLine($"File {filename} => {fileContent}");
            // Console.WriteLine($"expectedContent 1\n{expectedContent}\nfileContent 2\n{fileContent}");

            Assert.Equal(
                expectedContent,
                fileContent
            );

            filenamesToCheck.Remove(filename);
        }

        var saveHashCode = string.Format("{0:X}", SaveWrapperTests.GetMockSave("mock-save-path", Encoding.ASCII.GetBytes("mock-save-content")).Object.Metadata.FilePath!.GetHashCode());

        AssertArchiveFileContent("_paths.json", JsonSerializer.Serialize(new Dictionary<string, string>()
                {
                    {"db/mock-main.db","mock-db/mock-main.db"},
                    
                    // check legacy data
                    {"db/bank.json","mock-db/bank.json"},
                    {"db/box.json","mock-db/box.json"},
                    {"db/pkm.json","mock-db/pkm.json"},
                    {"db/pkm-version.json","mock-db/pkm-version.json"},
                    {"db/dex.json","mock-db/dex.json"},

                    {$"saves/mock-save-path_{saveHashCode}","mock-save-path"},
                    {"main/mock-pkm-files/123","mock-pkm-files/123"}
                }));

        AssertArchiveFileContent("mock-main.db", "mock-db");

        // check legacy data
        AssertArchiveFileContent("bank.json", "mock-legacy-data");
        AssertArchiveFileContent("box.json", "mock-legacy-data");
        AssertArchiveFileContent("pkm.json", "mock-legacy-data");
        AssertArchiveFileContent("pkm-version.json", "mock-legacy-data");
        AssertArchiveFileContent("dex.json", "mock-legacy-data");

        AssertArchiveFileContent($"mock-save-path_{saveHashCode}", "mock-save-content");
        AssertArchiveFileContent($"123", "mock-data");

        // assert there is no additional files
        Assert.Empty(filenamesToCheck);

        return true;
    }
}
