using Moq;
using System.IO.Compression;
using System.Text.Json;
using System.Text;
using System.Text.Json.Serialization.Metadata;

public class BackupServiceTests
{
    private readonly Mock<IFileIOService> mockFileIO = new();
    private readonly Mock<ILoadersService> mockLoaders = new();
    private readonly Mock<ISaveService> mockSave = new();
    private readonly Mock<ISettingsService> mockSettings = new();
    private readonly BackupService backupService;

    public BackupServiceTests()
    {
        backupService = new(mockFileIO.Object, mockLoaders.Object, mockSave.Object, mockSettings.Object);
    }

    [Fact]
    public async Task CreateBackup_CreatesValidZipFile()
    {
        ConfigureSettings("mock-bkp");

        mockLoaders.Setup(x => x.CreateLoaders()).ReturnsAsync(GetEntityLoaders());

        // Act
        var result = await backupService.CreateBackup();

        var expectedPath = @"mock-bkp\pkvault_backup_2011-03-21T132611-000Z.zip";

        mockFileIO.Verify(x => x.WriteBytes(
            It.Is<string>(p => p == expectedPath),
            It.Is<byte[]>(v => ArchiveMatchContent(v))
        ), Times.Once);
    }

    [Fact]
    public async Task RestoreBackup_RestoreAllFiles()
    {
        ConfigureSettings("mock-bkp");

        var expectedPath = @"mock-bkp\pkvault_backup_2011-03-21T132611-000Z.zip";

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

        static Mock<IArchiveEntry> WriteToArchive(string filename, string destFilename)
        {
            Mock<IArchiveEntry> entry = new();
            entry.Setup(x => x.Name).Returns(filename);
            entry.Setup(x => x.FullName).Returns(filename);
            entry.Setup(x => x.ExtractToFile(It.Is<string>(p => p == destFilename), It.IsAny<bool>())).Verifiable();

            return entry;
        }

        Mock<IArchiveEntry>[] entries = [
            WriteToArchive("_paths.json", "mock-bkp\\._paths.json"),
            WriteToArchive("db/mock-bank.json", "mock-bank.json"),
            WriteToArchive("db/mock-box.json", "mock-box.json"),
            WriteToArchive("db/mock-pkm.json", "mock-pkm.json"),
            WriteToArchive("db/mock-pkm-version.json", "mock-pkm-version.json"),
            WriteToArchive("db/mock-dex.json", "mock-dex.json"),
            WriteToArchive("saves/mock-save-path_123", "mock-save-path"),
            WriteToArchive("main/mock-pkm-files/456", "mock-pkm-files/456")
        ];

        mockFileIO.Setup(x => x.Exists(It.Is<string>(p => p == expectedPath))).Returns(true);
        mockFileIO.Setup(x => x.ReadZip(It.Is<string>(p => p == expectedPath))).Returns(() =>
        {
            Mock<IArchive> archive = new();

            archive.Setup(x => x.Entries).Returns([.. entries.Select(mock => mock.Object)]);

            return archive.Object;
        });
        mockFileIO.Setup(x => x.ReadJSONFile(
            It.Is<string>(p => p == "mock-bkp\\._paths.json"),
            It.IsAny<JsonTypeInfo<Dictionary<string, string>>>()
        )).Returns(paths).Verifiable();

        mockLoaders.Setup(x => x.CreateLoaders()).ReturnsAsync(GetEntityLoaders());

        await backupService.RestoreBackup(
            DateTime.Parse("2011-03-21 13:26:11")
        );

        mockFileIO.Verify();

        entries.ToList().ForEach(entry =>
        {
            entry.Verify();
        });
    }

    private DataEntityLoaders GetEntityLoaders()
    {

        Mock<IBankLoader> mockBankLoader = EntityLoaderUtil.GetMockBankLoader("mock-bank.json", Encoding.ASCII.GetBytes("mock-bank-values"));
        Mock<IBoxLoader> mockBoxLoader = EntityLoaderUtil.GetMockBoxLoader("mock-box.json", Encoding.ASCII.GetBytes("mock-box-values"));
        Mock<IPkmLoader> mockPkmLoader = EntityLoaderUtil.GetMockPkmLoader("mock-pkm.json", Encoding.ASCII.GetBytes("mock-pkm-values"));
        Mock<IPkmVersionLoader> mockPkmVersionLoader = EntityLoaderUtil.GetMockPkmVersionLoader(
            "mock-pkm-version.json",
            Encoding.ASCII.GetBytes("mock-pkm-version-values"),
            pkmFiles: new(){
                { "mock-pkm-files/123", (Data: [], Error: PKMLoadError.NOT_FOUND) },    // should be ignored
                { "mock-pkm-files/456", (Data: Encoding.ASCII.GetBytes("mock-pkfile-content"), Error: null) }
            }
        );
        Mock<IDexLoader> mockDexLoader = EntityLoaderUtil.GetMockDexLoader("mock-dex.json", Encoding.ASCII.GetBytes("mock-dex-values"));

        Mock<SaveWrapper> saveWrapper = SaveWrapperTests.GetMockSave("mock-save-path", Encoding.ASCII.GetBytes("mock-save-content"));

        Mock<ISaveBoxLoader> mockSaveBoxLoader = new();
        Mock<ISavePkmLoader> mockSavePkmLoader = new();

        return new DataEntityLoaders(mockSave.Object)
        {
            startTime = DateTime.Parse("2011-03-21 13:26:11"),
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

            Console.WriteLine($"File {filename} => {fileContent}");

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
