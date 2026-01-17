using Moq;
using System.IO.Compression;
using System.Text.Json;
using System.Text;
using System.IO.Abstractions.TestingHelpers;

public class BackupServiceTests
{
    private readonly MockFileSystem mockFileSystem = new MockFileSystem();
    private readonly Mock<ILoadersService> mockLoaders = new();
    private readonly Mock<ISaveService> mockSave = new();
    private readonly Mock<ISettingsService> mockSettings = new();
    private readonly BackupService backupService;

    public BackupServiceTests()
    {
        backupService = new(new FileIOService(mockFileSystem), mockLoaders.Object, mockSave.Object, mockSettings.Object);
    }

    [Fact]
    public async Task CreateBackup_CreatesValidZipFile()
    {
        ConfigureSettings("mock-bkp");

        mockLoaders.Setup(x => x.CreateLoaders()).ReturnsAsync(
            GetEntityLoaders(DateTime.Parse("2011-03-21 13:26:11"))
        );

        // Act
        var result = await backupService.CreateBackup();

        // Console.WriteLine(string.Join('\n', mockFileSystem.AllPaths));

        Assert.True(mockFileSystem.FileExists(@"mock-bkp\pkvault_backup_2011-03-21T132611-000Z.zip"));
        var data = mockFileSystem.File.ReadAllBytes(@"mock-bkp\pkvault_backup_2011-03-21T132611-000Z.zip");
        ArchiveMatchContent(data);
    }

    [Fact]
    public async Task RestoreBackup_RestoreAllFiles()
    {
        ConfigureSettings("mock-bkp");

        var expectedPath = @"mock-bkp\pkvault_backup_2013-03-21T132611-000Z.zip";

        var paths = new Dictionary<string, string>()
            {
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
                    using var entryStream = entry.Open();
                    entryStream.Write(fileContent, 0, fileContent.Length);
                    // Console.WriteLine(fileEntry.Key);
                }
            }
            mockFileSystem.Directory.CreateDirectory("mock-bkp");
            mockFileSystem.File.WriteAllBytes(expectedPath, memoryStream.ToArray());
        }

        mockLoaders.Setup(x => x.GetLoaders()).ReturnsAsync(
            GetEntityLoaders(DateTime.Parse("2010-03-21 13:26:11"))
        );
        mockLoaders.Setup(x => x.CreateLoaders()).ReturnsAsync(
            GetEntityLoaders(DateTime.Parse("2011-03-21 13:26:11"))
        );

        mockLoaders.Setup(x => x.InvalidateLoaders(new(true, true))).Verifiable();
        mockSave.Setup(x => x.InvalidateSaves()).Verifiable();

        await backupService.RestoreBackup(
            DateTime.Parse("2013-03-21 13:26:11")
        );

        // check if backup creation were made
        Assert.True(mockFileSystem.FileExists(@"mock-bkp\pkvault_backup_2011-03-21T132611-000Z.zip"));
        var data = mockFileSystem.File.ReadAllBytes(@"mock-bkp\pkvault_backup_2011-03-21T132611-000Z.zip");
        ArchiveMatchContent(data);

        // Console.WriteLine(string.Join('\n', mockFileSystem.AllFiles));

        // check all entries extracted
        paths.ToList().ForEach(pathItem =>
        {
            Assert.True(mockFileSystem.FileExists(pathItem.Value));
            var fileContent = mockFileSystem.File.ReadAllText(pathItem.Value);
            var expectedContent = entries.ToList().Find(e => e.Path == pathItem.Key).Content;
            Assert.Equal(fileContent, expectedContent);
        });

        mockLoaders.Verify(x => x.InvalidateLoaders(new(true, true)));
        mockSave.Verify(x => x.InvalidateSaves());
    }

    [Fact]
    public async Task RestoreBackup_RestorePartialFiles()
    {
        ConfigureSettings("mock-bkp");

        mockFileSystem.AddEmptyFile("mock-bank.json");
        mockFileSystem.AddEmptyFile("mock-box.json");
        mockFileSystem.AddEmptyFile("mock-pkm.json");
        mockFileSystem.AddEmptyFile("mock-dex.json");

        var expectedPath = @"mock-bkp\pkvault_backup_2013-03-21T132611-000Z.zip";

        var paths = new Dictionary<string, string>()
            {
                {"db/mock-box.json","mock-box.json"},
                {"db/mock-pkm.json","mock-pkm.json"},
                {"db/mock-pkm-version.json","mock-pkm-version.json"},
                {$"saves/mock-save-path_123","mock-save-path"},
                {"main/mock-pkm-files/456","mock-pkm-files/456"}
            };

        (string Path, string Content)[] entries = [
            ("_paths.json", JsonSerializer.Serialize(paths)),
            ("db/mock-box.json", "mock-box"),
            ("db/mock-pkm.json", "mock-pkm"),
            ("db/mock-pkm-version.json", "mock-pkm-version"),
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
                    using var entryStream = entry.Open();
                    entryStream.Write(fileContent, 0, fileContent.Length);
                    // Console.WriteLine(fileEntry.Key);
                }
            }
            mockFileSystem.Directory.CreateDirectory("mock-bkp");
            mockFileSystem.File.WriteAllBytes(expectedPath, memoryStream.ToArray());
        }

        mockLoaders.Setup(x => x.GetLoaders()).ReturnsAsync(
            GetEntityLoaders(DateTime.Parse("2010-03-21 13:26:11"))
        );
        mockLoaders.Setup(x => x.CreateLoaders()).ReturnsAsync(
            GetEntityLoaders(DateTime.Parse("2011-03-21 13:26:11"))
        );

        await backupService.RestoreBackup(
            DateTime.Parse("2013-03-21 13:26:11")
        );

        // Console.WriteLine(string.Join('\n', mockFileSystem.AllFiles));

        // check all entries extracted
        paths.ToList().ForEach(pathItem =>
        {
            Assert.True(mockFileSystem.FileExists(pathItem.Value));
            var fileContent = mockFileSystem.File.ReadAllText(pathItem.Value);
            var expectedContent = entries.ToList().Find(e => e.Path == pathItem.Key).Content;
            Assert.Equal(fileContent, expectedContent);
        });

        // check DB files are deleted (bank + dex) before archive file are extracted
        // avoiding remaining obsolete data
        Assert.False(mockFileSystem.FileExists("mock-bank.json"));
        Assert.False(mockFileSystem.FileExists("mock-dex.json"));
    }

    private DataEntityLoaders GetEntityLoaders(
        DateTime startTime
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

        var saveWrapper = SaveWrapperTests.GetMockSave("mock-save-path", Encoding.ASCII.GetBytes("mock-save-content"));

        Mock<ISaveBoxLoader> mockSaveBoxLoader = new();
        Mock<ISavePkmLoader> mockSavePkmLoader = new();

        return new DataEntityLoaders(mockSave.Object)
        {
            startTime = startTime,
            bankLoader = mockBankLoader.Object,
            boxLoader = mockBoxLoader.Object,
            pkmLoader = mockPkmLoader.Object,
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
        mockSettings.Setup(x => x.GetSettings()).Returns(new SettingsDTO(
            BuildID: default, Version: "", PkhexVersion: "", AppDirectory: "", SettingsPath: "",
            CanUpdateSettings: false, CanScanSaves: false, SettingsMutable: new(
                DB_PATH: "mock-db", SAVE_GLOBS: [], STORAGE_PATH: "mock-storage", BACKUP_PATH: backupPath,
                LANGUAGE: "en"
            )
        ));
    }

    private bool ArchiveMatchContent(byte[] value)
    {
        using var archive = new ZipArchive(new MemoryStream(value));

        var filenamesToCheck = archive.Entries.Select(entry => entry.Name).ToHashSet();

        void AssertArchiveFileContent(
            string filename,
            string expectedContent
        )
        {
            var entry = archive.Entries.ToList().Find(entry => entry.Name == filename);
            ArgumentNullException.ThrowIfNull(entry);
            var entryStream = entry.Open();
            var fileReader = new StreamReader(entryStream);
            var fileContent = fileReader.ReadToEnd();

            // Console.WriteLine($"File {filename} => {fileContent}");

            Assert.Equal(
                expectedContent,
                fileContent
            );

            filenamesToCheck.Remove(filename);
        }

        var saveHashCode = string.Format("{0:X}", SaveWrapperTests.GetMockSave("mock-save-path", Encoding.ASCII.GetBytes("mock-save-content")).Object.Metadata.FilePath!.GetHashCode());

        AssertArchiveFileContent("_paths.json", JsonSerializer.Serialize(new Dictionary<string, string>()
                {
                    {"db/mock-bank.json","mock-bank.json"},
                    {"db/mock-box.json","mock-box.json"},
                    {"db/mock-pkm.json","mock-pkm.json"},
                    {"db/mock-pkm-version.json","mock-pkm-version.json"},
                    {"db/mock-dex.json","mock-dex.json"},
                    {$"saves/mock-save-path_{saveHashCode}","mock-save-path"},
                    {"main/mock-pkm-files/456","mock-pkm-files/456"}
                }));

        AssertArchiveFileContent("mock-bank.json", "mock-bank-values");
        AssertArchiveFileContent("mock-box.json", "mock-box-values");
        AssertArchiveFileContent("mock-pkm.json", "mock-pkm-values");
        AssertArchiveFileContent("mock-pkm-version.json", "mock-pkm-version-values");
        AssertArchiveFileContent("mock-dex.json", "mock-dex-values");
        AssertArchiveFileContent($"mock-save-path_{saveHashCode}", "mock-save-content");
        AssertArchiveFileContent($"456", "mock-pkfile-content");

        // assert there is no additional files
        Assert.Empty(filenamesToCheck);

        return true;
    }
}
