using Moq;
using PKHeX.Core;
using PKVault.Core;

/**
 * Regression tests for #239: Gen 3-only ribbon sets weren't copied by SharePropertiesTo.
 */
public class PkmSharePropertiesServiceTests
{
    private PkmSharePropertiesService GetService()
    {
        Mock<ISettingsService> mockSettingsService = new();
        mockSettingsService.Setup(x => x.GetSettings()).Returns(new SettingsDTO(
            BuildID: default, RuntimeSystem: RuntimeSystem.LINUX, SourceProvider: SourceProvider.GithubRelease, FlatpakMigrated: false,
            Version: "", PkhexVersion: "", AppDirectory: "", SettingsPath: "", UserId: "",
            CanUpdateSettings: false, CanScanSaves: false, DemoMode: false, SettingsMutable: new(
                DB_PATH: "", SAVE_GLOBS: [], PKM_EXTERNAL_GLOBS: [], STORAGE_PATH: "", BACKUP_PATH: "",
                LANGUAGE: "fr", HIDE_CHEATS: false, SKIP_LEGALITY_CHECKS: false
            )
        ));

        var legalityAnalysisService = new LegalityAnalysisService(mockSettingsService.Object);
        var pkmConvertService = new PkmConvertService(mockSettingsService.Object, legalityAnalysisService);

        return new(pkmConvertService, legalityAnalysisService);
    }

    [Fact]
    public void SharePropertiesTo_CopiesG3ContestRibbonCounts()
    {
        var service = GetService();

        var sourcePkm = new PK3
        {
            Species = 25,
            RibbonCountG3Cool = 3,
            RibbonCountG3Beauty = 1,
        };

        var targetPkm = new PK3 { Species = 25 };

        service.SharePropertiesTo(new(sourcePkm), targetPkm, null);

        Assert.Equal(3, targetPkm.RibbonCountG3Cool);
        Assert.Equal(1, targetPkm.RibbonCountG3Beauty);
    }

    [Fact]
    public void SharePropertiesTo_CopiesUnique3Ribbons()
    {
        var service = GetService();

        var sourcePkm = new PK3
        {
            Species = 25,
            RibbonWinning = true,
            RibbonVictory = true,
        };

        var targetPkm = new PK3 { Species = 25 };

        service.SharePropertiesTo(new(sourcePkm), targetPkm, null);

        Assert.True(targetPkm.RibbonWinning);
        Assert.True(targetPkm.RibbonVictory);
    }
}
