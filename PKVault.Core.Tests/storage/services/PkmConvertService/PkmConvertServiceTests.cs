using System.Collections;
using System.Text.Json;
using System.Text.Json.Nodes;
using Moq;
using PKHeX.Core;
using PKVault.Core;

public class PkmConvertServiceTests
{
    public PkmConvertServiceTests()
    {
        Program.Initialize();
    }

    private static readonly byte[] pikachuForwardBytes = File.ReadAllBytes(Path.Combine(Program.InitialCurrentDirectory, "./assets/pikachu-front.pk1"));
    private static readonly Dictionary<string, object> pikachuForwardExpectedData = JsonSerializer.Deserialize<Dictionary<string, object>>(
        File.ReadAllText(Path.Combine(Program.InitialCurrentDirectory, "./assets/pikachu-front-expected.json"))
    )!;

    private static readonly byte[] pikachuBackwardBytes = File.ReadAllBytes(Path.Combine(Program.InitialCurrentDirectory, "./assets/pikachu-back.pa9"));
    private static readonly Dictionary<string, object> pikachuBackwardExpectedData = JsonSerializer.Deserialize<Dictionary<string, object>>(
        File.ReadAllText(Path.Combine(Program.InitialCurrentDirectory, "./assets/pikachu-back-expected.json"))
    )!;

    private static readonly byte[] bizarreForwardBytes = File.ReadAllBytes(Path.Combine(Program.InitialCurrentDirectory, "./assets/bizarre-front.pk2"));
    private static readonly Dictionary<string, object> bizarreForwardExpectedData = JsonSerializer.Deserialize<Dictionary<string, object>>(
        File.ReadAllText(Path.Combine(Program.InitialCurrentDirectory, "./assets/bizarre-front-expected.json"))
    )!;
    private static readonly Dictionary<string, object> bizarreVariantBackwardExpectedData = JsonSerializer.Deserialize<Dictionary<string, object>>(
        File.ReadAllText(Path.Combine(Program.InitialCurrentDirectory, "./assets/bizarre-variant-back-expected.json"))
    )!;

    private static readonly byte[] mukForwardBytes = File.ReadAllBytes(Path.Combine(Program.InitialCurrentDirectory, "./assets/muk-front.pk3"));
    private static readonly Dictionary<string, object> mukForwardExpectedData = JsonSerializer.Deserialize<Dictionary<string, object>>(
        File.ReadAllText(Path.Combine(Program.InitialCurrentDirectory, "./assets/muk-front-expected.json"))
    )!;

    private static readonly byte[] chdingForwardBytes = File.ReadAllBytes(Path.Combine(Program.InitialCurrentDirectory, "./assets/chding-front.pk3"));
    private static readonly Dictionary<string, object> chdingForwardExpectedData = JsonSerializer.Deserialize<Dictionary<string, object>>(
        File.ReadAllText(Path.Combine(Program.InitialCurrentDirectory, "./assets/chding-front-expected.json"))
    )!;

    private static readonly byte[] marcForwardBytes = File.ReadAllBytes(Path.Combine(Program.InitialCurrentDirectory, "./assets/marc-front.pk3"));
    private static readonly Dictionary<string, object> marcForwardExpectedData = JsonSerializer.Deserialize<Dictionary<string, object>>(
        File.ReadAllText(Path.Combine(Program.InitialCurrentDirectory, "./assets/marc-front-expected.json"))
    )!;

    private static bool pkFolderCleaned = false;

    private PkmConvertService GetService()
    {
        Mock<ISettingsService> mockSettingsService = new();
        mockSettingsService.Setup(x => x.GetSettings()).Returns(new SettingsDTO(
            BuildID: default, RuntimeSystem: RuntimeSystem.LINUX, SourceProvider: SourceProvider.GithubRelease, FlatpakMigrated: false,
            Version: "", PkhexVersion: "", AppDirectory: "", SettingsPath: "", UserId: "",
            SettingsMutable: new(
                DB_PATH: "", SAVE_GLOBS: [], PKM_EXTERNAL_GLOBS: [], STORAGE_PATH: "", BACKUP_PATH: "",
                LANGUAGE: "fr", HIDE_CHEATS: false, SKIP_LEGALITY_CHECKS: false
            )
        ));

        return new(mockSettingsService.Object, new LegalityAnalysisService(mockSettingsService.Object));
    }

    private void SetupPKDirectory(string folderName)
    {
        if (!pkFolderCleaned)
        {
            pkFolderCleaned = true;

            if (Directory.Exists("./pkm-files"))
                Directory.Delete("./pkm-files", true);
            Directory.CreateDirectory("./pkm-files");
        }

        if (!Directory.Exists(Path.Combine("./pkm-files", folderName)))
            Directory.CreateDirectory(Path.Combine("./pkm-files", folderName));
    }

    [Theory]
    [
        InlineData("PK1"),
        InlineData("PK2"),
        InlineData("SK2"),
        InlineData("PK3"),
        InlineData("CK3"),
        InlineData("XK3")
    ]
    [
        InlineData("PK4"),
        InlineData("BK4"),
        InlineData("RK4"),
        InlineData("PK5")
    ]
    [
        InlineData("PK6"),
        InlineData("PK7"),
        InlineData("PB7"),
        InlineData("PK8")
    ]
    [
        InlineData("PB8"),
        InlineData("PA8"),
        InlineData("PK9"),
        InlineData("PA9")
    ]
    /**
     * Basic conversion with Pikachu (#25):
     * - direction: forward
     * - PK1 to all games
     * - PID predictability with existing pkm
     */
    public async Task TestAllPikachuForwardConversions(string targetTypeName)
    {
        SetupPKDirectory("pikachu-front");

        var service = GetService();

        FileUtil.TryGetPKM(pikachuForwardBytes, out var sourcePkm, "pk1");
        Assert.NotNull(sourcePkm);
        Assert.Equal(25, sourcePkm.Species);

        var blank = CreateBlankTarget(targetTypeName);

        var result = service.ConvertTo(new(sourcePkm), blank.GetType(), null).GetMutablePkm();

        Assert.Equal(targetTypeName, result.GetType().Name);

        File.WriteAllBytes(Path.Combine("./pkm-files", "pikachu-front", result.FileName), new ImmutablePKM(result).GetDecryptedDataParty());

        AssertExpectedData(result, (JsonElement)pikachuForwardExpectedData[targetTypeName]);

        // check PID predictability
        if (result is not GBPKM && blank is not GBPKM)
        {
            var result2 = service.ConvertTo(new(sourcePkm), blank.GetType(), new(
                TargetPkm: result,
                TargetSave: null
            )).GetMutablePkm();

            Assert.Equal(result.PID, result2.PID);
            Assert.Equal(result.EncryptionConstant, result2.EncryptionConstant);
        }
    }

    [Theory]
    [
        InlineData("PA9"),
        InlineData("PK9"),
        InlineData("PK8"),
    ]
    [
        InlineData("PK7"),
        InlineData("PK6"),
        InlineData("PK5"),
        InlineData("PK4"),
        InlineData("PK3"),
        InlineData("PK2"),
        InlineData("PK1"),
    ]
    /**
     * Basic conversion with Pikachu (#25):
     * - direction: backward
     * - PA9 to main games
     * - PID predictability with existing pkm
     */
    public async Task TestAllPikachuBackwardConversions(string targetTypeName)
    {
        SetupPKDirectory("pikachu-back");

        var service = GetService();

        FileUtil.TryGetPKM(pikachuBackwardBytes, out var sourcePkm, "pa9");
        Assert.NotNull(sourcePkm);
        Assert.Equal(25, sourcePkm.Species);

        var blank = CreateBlankTarget(targetTypeName);

        var result = service.ConvertTo(new(sourcePkm), blank.GetType(), null).GetMutablePkm();

        Assert.Equal(targetTypeName, result.GetType().Name);

        File.WriteAllBytes(Path.Combine("./pkm-files", "pikachu-back", result.FileName), new ImmutablePKM(result).GetDecryptedDataParty());

        AssertExpectedData(result, (JsonElement)pikachuBackwardExpectedData[targetTypeName]);

        // check PID predictability
        if (result is not GBPKM && blank is not GBPKM)
        {
            var result2 = service.ConvertTo(new(sourcePkm), blank.GetType(), new(
                TargetPkm: result,
                TargetSave: null
            )).GetMutablePkm();

            Assert.Equal(result.PID, result2.PID);
            Assert.Equal(result.EncryptionConstant, result2.EncryptionConstant);
        }
    }

    [Theory]
    [
        InlineData("SK2"),
        InlineData("CK3"),
        InlineData("XK3")
    ]
    [
        InlineData("BK4"),
        InlineData("RK4"),
    ]
    [
        InlineData("PB7"),
    ]
    [
        InlineData("PB8"),
        InlineData("PA8"),
        InlineData("PA9")
    ]
    /**
     * Complex conversion with Unown (#201):
     * - Form, Shiny, Helditem
     * - direction: backward
     * - Variant games to PK2
     * - PID predictability with existing pkm
     */
    public async Task TestAllBizarreVariantBackwardConversions(string variantTypeName)
    {
        SetupPKDirectory("bizarre-back-variant");

        var service = GetService();

        FileUtil.TryGetPKM(bizarreForwardBytes, out var sourcePkm, "pk2");
        Assert.NotNull(sourcePkm);
        Assert.Equal(201, sourcePkm.Species);

        var blank = CreateBlankTarget(variantTypeName);

        var result1 = service.ConvertTo(new(sourcePkm), blank.GetType(), null).GetMutablePkm();

        Assert.Equal(variantTypeName, result1.GetType().Name);

        blank = CreateBlankTarget("PK2");

        var result = service.ConvertTo(new(result1), blank.GetType(), null).GetMutablePkm();

        Assert.Equal("PK2", result.GetType().Name);

        File.WriteAllBytes(Path.Combine("./pkm-files", "bizarre-back-variant", $"{variantTypeName}-{result.FileName}"), new ImmutablePKM(result).GetDecryptedDataParty());

        AssertExpectedData(result, (JsonElement)bizarreVariantBackwardExpectedData[$"{variantTypeName}->PK2"]);

        // check PID predictability
        if (result is not GBPKM && blank is not GBPKM)
        {
            var result2 = service.ConvertTo(new(sourcePkm), blank.GetType(), new(
                TargetPkm: result,
                TargetSave: null
            )).GetMutablePkm();

            Assert.Equal(result.PID, result2.PID);
            Assert.Equal(result.EncryptionConstant, result2.EncryptionConstant);
        }
    }

    [Theory]
    [
        InlineData("PK2"),
        InlineData("SK2"),
        InlineData("PK3"),
        InlineData("CK3"),
        InlineData("XK3")
    ]
    [
        InlineData("PK4"),
        InlineData("BK4"),
        InlineData("RK4"),
        InlineData("PK5")
    ]
    [
        InlineData("PK6"),
        InlineData("PK7")
    ]
    [
        InlineData("PB8"),
        InlineData("PA8")
    ]
    /**
     * Complex conversion with Unown (#201):
     * - Form, Shiny, Helditem
     * - direction: forward
     * - PID predictability with existing pkm
     */
    public async Task TestAllBizarreForwardConversions(string targetTypeName)
    {
        SetupPKDirectory("bizarre-front");

        var service = GetService();

        FileUtil.TryGetPKM(bizarreForwardBytes, out var sourcePkm, "pk2");
        Assert.NotNull(sourcePkm);
        Assert.Equal(201, sourcePkm.Species);

        var blank = CreateBlankTarget(targetTypeName);

        var result = service.ConvertTo(new(sourcePkm), blank.GetType(), null).GetMutablePkm();

        Assert.Equal(targetTypeName, result.GetType().Name);

        File.WriteAllBytes(Path.Combine("./pkm-files", "bizarre-front", result.FileName), new ImmutablePKM(result).GetDecryptedDataParty());

        AssertExpectedData(result, (JsonElement)bizarreForwardExpectedData[targetTypeName]);

        // check PID predictability
        if (result is not GBPKM && blank is not GBPKM)
        {
            var result2 = service.ConvertTo(new(sourcePkm), blank.GetType(), new(
                TargetPkm: result,
                TargetSave: null
            )).GetMutablePkm();

            Assert.Equal(result.PID, result2.PID);
            Assert.Equal(result.EncryptionConstant, result2.EncryptionConstant);
        }
    }

    [Theory]
    [
        InlineData("PK3"),
        InlineData("CK3"),
        InlineData("XK3")
    ]
    [
        InlineData("PK4"),
        InlineData("BK4"),
        InlineData("RK4"),
        InlineData("PK5")
    ]
    [
        InlineData("PK6"),
        InlineData("PK7"),
        InlineData("PB7")
    ]
    [
        InlineData("PB8"),
        InlineData("PK9")
    ]
    /**
     * Complex conversion with Muk (#89):
     * - Nature, Ability, Helditem, Markings, Contest, Ribbon
     * - direction: forward
     * - PID predictability with existing pkm
     */
    public async Task TestAllMukForwardConversions(string targetTypeName)
    {
        SetupPKDirectory("muk-front");

        var service = GetService();

        FileUtil.TryGetPKM(mukForwardBytes, out var sourcePkm, "pk3");
        Assert.NotNull(sourcePkm);
        Assert.Equal(89, sourcePkm.Species);

        var blank = CreateBlankTarget(targetTypeName);

        var result = service.ConvertTo(new(sourcePkm), blank.GetType(), null).GetMutablePkm();

        Assert.Equal(targetTypeName, result.GetType().Name);

        File.WriteAllBytes(Path.Combine("./pkm-files", "muk-front", result.FileName), new ImmutablePKM(result).GetDecryptedDataParty());

        AssertExpectedData(result, (JsonElement)mukForwardExpectedData[targetTypeName]);

        // check PID predictability
        if (result is not GBPKM && blank is not GBPKM)
        {
            var result2 = service.ConvertTo(new(sourcePkm), blank.GetType(), new(
                TargetPkm: result,
                TargetSave: null
            )).GetMutablePkm();

            Assert.Equal(result.PID, result2.PID);
            Assert.Equal(result.EncryptionConstant, result2.EncryptionConstant);
        }
    }

    [Theory]
    [
        InlineData("PK3"),
        InlineData("CK3"),
        InlineData("XK3")
    ]
    [
        InlineData("PK4"),
        InlineData("BK4"),
        InlineData("RK4"),
        InlineData("PK5")
    ]
    [
        InlineData("PK6"),
        InlineData("PK7"),
        InlineData("PB7"),
        InlineData("PK8")
    ]
    [
        InlineData("PB8"),
        InlineData("PA9")
    ]
    /**
     * Basic conversion with Chding/Farfetch’d (#83):
     * - direction: forward
     * - PID predictability with existing pkm
     */
    public async Task TestAllChdingForwardConversions(string targetTypeName)
    {
        SetupPKDirectory("chding-front");

        var service = GetService();

        FileUtil.TryGetPKM(chdingForwardBytes, out var sourcePkm, "pk3");
        Assert.NotNull(sourcePkm);
        Assert.Equal(83, sourcePkm.Species);

        var blank = CreateBlankTarget(targetTypeName);

        var result = service.ConvertTo(new(sourcePkm), blank.GetType(), null).GetMutablePkm();

        Assert.Equal(targetTypeName, result.GetType().Name);

        File.WriteAllBytes(Path.Combine("./pkm-files", "chding-front", result.FileName), new ImmutablePKM(result).GetDecryptedDataParty());

        if (!chdingForwardExpectedData.TryGetValue(targetTypeName, out var _))
            chdingForwardExpectedData.Add(targetTypeName, JsonElement.Parse("{}"));

        AssertExpectedData(result, (JsonElement)chdingForwardExpectedData[targetTypeName]);

        // check PID predictability
        if (result is not GBPKM && blank is not GBPKM)
        {
            var result2 = service.ConvertTo(new(sourcePkm), blank.GetType(), new(
                TargetPkm: result,
                TargetSave: null
            )).GetMutablePkm();

            Assert.Equal(result.PID, result2.PID);
            Assert.Equal(result.EncryptionConstant, result2.EncryptionConstant);
        }
    }

    [Theory]
    [
        InlineData("PK3"),
        InlineData("CK3"),
        InlineData("XK3")
    ]
    [
        InlineData("PK4"),
        InlineData("BK4"),
        InlineData("RK4"),
        InlineData("PK5")
    ]
    [
        InlineData("PK6"),
        InlineData("PK7"),
        InlineData("PB7"),
        InlineData("PK8")
    ]
    [
        InlineData("PB8"),
        InlineData("PA8")
    ]
    /**
     * Basic conversion with Marc/Lickitung (#108):
     * - direction: forward
     * - PID predictability with existing pkm
     */
    public async Task TestAllMarcForwardConversions(string targetTypeName)
    {
        SetupPKDirectory("marc-front");

        var service = GetService();

        FileUtil.TryGetPKM(marcForwardBytes, out var sourcePkm, "pk3");
        Assert.NotNull(sourcePkm);
        Assert.Equal(108, sourcePkm.Species);

        var blank = CreateBlankTarget(targetTypeName);

        var result = service.ConvertTo(new(sourcePkm), blank.GetType(), null).GetMutablePkm();

        Assert.Equal(targetTypeName, result.GetType().Name);

        File.WriteAllBytes(Path.Combine("./pkm-files", "marc-front", result.FileName), new ImmutablePKM(result).GetDecryptedDataParty());

        if (!marcForwardExpectedData.TryGetValue(targetTypeName, out var _))
            marcForwardExpectedData.Add(targetTypeName, JsonElement.Parse("{}"));

        AssertExpectedData(result, (JsonElement)marcForwardExpectedData[targetTypeName]);

        // check PID predictability
        if (result is not GBPKM && blank is not GBPKM)
        {
            var result2 = service.ConvertTo(new(sourcePkm), blank.GetType(), new(
                TargetPkm: result,
                TargetSave: null
            )).GetMutablePkm();

            Assert.Equal(result.PID, result2.PID);
            Assert.Equal(result.EncryptionConstant, result2.EncryptionConstant);
        }
    }

    private static PKM CreateBlankTarget(string typeName)
    {
        return typeName switch
        {
            "PK1" => new PK1(),
            "PK2" => new PK2(),
            "SK2" => new SK2(),
            "PK3" => new PK3(),
            "CK3" => new CK3(),
            "XK3" => new XK3(),
            "PK4" => new PK4(),
            "BK4" => new BK4(),
            "RK4" => new RK4(),
            "PK5" => new PK5(),
            "PK6" => new PK6(),
            "PK7" => new PK7(),
            "PB7" => new PB7(),
            "PK8" => new PK8(),
            "PB8" => new PB8(),
            "PA8" => new PA8(),
            "PK9" => new PK9(),
            "PA9" => new PA9(),
            _ => throw new ArgumentException($"Unknown type: {typeName}")
        };
    }

    private void AssertExpectedData(PKM pkm, JsonElement expectedData)
    {
        Dictionary<string, object?> missingData = [];

        void AssertWithDebug(string property, object? expectedValue, bool required = true)
        {
            // avoid string detection
            if (expectedValue is byte[] eb)
                expectedValue = eb.Select(v => (int)v).ToArray();

            // sort dicts
            if (expectedValue is IDictionary ed)
                expectedValue = ((ICollection<string>)ed.Keys).Order().ToDictionary(
                    k => k,
                    k => ed[k]!
                );

            var t = expectedValue?.GetType();
            var expectedValueStr = t != null
                && (t.IsArray || expectedValue is IList || expectedValue is IDictionary)
                ? JsonSerializer.Serialize(expectedValue)
                : expectedValue?.ToString() ?? "null";

            string elementToString(JsonElement el)
            {
                switch (el.ValueKind)
                {
                    case JsonValueKind.Array:
                        return JsonArray.Create(el)?.ToJsonString() ?? "null";
                    case JsonValueKind.Object:
                        try
                        {
                            var dict = el.Deserialize<Dictionary<string, object>>()
                                ?.OrderBy(e => e.Key)
                                .ToDictionary();
                            if (dict != null)
                                return JsonSerializer.Serialize(dict);
                        }
                        catch
                        { }
                        return JsonObject.Create(el)?.ToJsonString() ?? "null";
                    default:
                        return el.ToString();
                }
            }

            try
            {
                if (required)
                    Assert.Equal(expectedValueStr, elementToString(expectedData.GetProperty(property)));
                else if (expectedData.TryGetProperty(property, out var value))
                    Assert.Equal(expectedValueStr, elementToString(value));
            }
            catch (KeyNotFoundException)
            {
                missingData.TryAdd(property, expectedValue);
            }
            catch (InvalidOperationException)
            {
                if (required)
                    missingData.TryAdd(property, expectedValue);
            }
            catch (Xunit.Sdk.EqualException ex)
            {
                throw new Xunit.Sdk.XunitException(
                    $"{pkm.GetType().Name}.{property}:"
                    + $"\n\tExpected: {expectedValueStr}"
                    + $"\n\tActual:   {elementToString(expectedData.GetProperty(property))}",
                    ex
                );
            }
        }

        Assert.True(GameVersionUtil.IsPresentInGame(pkm.Context.GetSingleGameVersion(), pkm.Species, pkm.Form));

        AssertWithDebug("species", pkm.Species);
        AssertWithDebug("form", pkm.Form);
        AssertWithDebug("gender", pkm.Gender);
        AssertWithDebug("version", (byte)pkm.Version);
        AssertWithDebug("level", pkm.CurrentLevel);
        AssertWithDebug("exp", pkm.EXP);
        AssertWithDebug("shiny", pkm.IsShiny);
        AssertWithDebug("nicknamed", pkm.IsNicknamed);
        AssertWithDebug("nickname", pkm.Nickname);
        AssertWithDebug("nature", (byte)pkm.Nature, required: false);
        AssertWithDebug("ability", pkm.Ability);
        AssertWithDebug("tid", pkm.TID16);
        AssertWithDebug("ot", pkm.OriginalTrainerName);
        AssertWithDebug("language", pkm.Language);
        AssertWithDebug("metLocation", pkm.MetLocation, pkm is not GBPKM);
        AssertWithDebug("ball", pkm.Ball, required: pkm is not GBPKM);

        AssertWithDebug("moves", pkm.Moves);

        AssertWithDebug("ivs", (int[])[
            pkm.IV_HP,
            pkm.IV_ATK,
            pkm.IV_DEF,
            pkm.IV_SPA,
            pkm.IV_SPD,
            pkm.IV_SPE,
        ]);

        AssertWithDebug("evs", pkm is PB7 pb7
            ? (int[])[
                pb7.AV_HP,
                pb7.AV_ATK,
                pb7.AV_DEF,
                pb7.AV_SPA,
                pb7.AV_SPD,
                pb7.AV_SPE,
            ]
            : [
                pkm.EV_HP,
                pkm.EV_ATK,
                pkm.EV_DEF,
                pkm.EV_SPA,
                pkm.EV_SPD,
                pkm.EV_SPE,
            ]);

        pkm.SetStats(pkm.GetStats(pkm.PersonalInfo));
        AssertWithDebug("stats", (int[])[
            pkm.Stat_HPMax,
            pkm.Stat_ATK,
            pkm.Stat_DEF,
            pkm.Stat_SPA,
            pkm.Stat_SPD,
            pkm.Stat_SPE,
        ], required: false);

        AssertWithDebug("friendship", pkm.CurrentFriendship, required: pkm is not GBPKM);
        AssertWithDebug("helditem", pkm.HeldItem, required: false);
        AssertWithDebug("sid", pkm.SID16, required: pkm is not GBPKM);

        if (pkm is IAppliedMarkings<bool> pkmMarkings)
        {
            List<bool> pkmMarks = [];
            for (var i = 0; i < pkmMarkings.MarkingCount; i++)
            {
                pkmMarks.Add(pkmMarkings.GetMarking(i));
            }

            AssertWithDebug("marks", pkmMarks, required: false);
        }

        var ribbonInfos = RibbonInfo.GetRibbonInfo(pkm)
            .Where(info => info.HasRibbon || info.RibbonCount > 0)
            .ToDictionary(
                info => info.Name,
                info => info.HasRibbon ? (byte)1 : info.RibbonCount
            );
        AssertWithDebug("ribbons", ribbonInfos, required: false);

        List<int> pkmSize = [];
        if (pkm is IScaledSizeAbsolute sa)
        {
            pkmSize.Add((int)sa.HeightAbsolute);
            pkmSize.Add((int)sa.WeightAbsolute);
        }
        else if (pkm is IScaledSize ss)
        {
            pkmSize.Add(ss.HeightScalar);
            pkmSize.Add(ss.WeightScalar);
        }
        if (pkm is IScaledSize3 scale)
        {
            pkmSize.Add(scale.Scale);
        }
        AssertWithDebug("size", pkmSize, required: false);

        if (pkm is IContestStats pkmContest)
        {
            AssertWithDebug("contest", (byte[])[
                pkmContest.ContestCool,
                pkmContest.ContestBeauty,
                pkmContest.ContestCute,
                pkmContest.ContestSmart,
                pkmContest.ContestTough,
                pkmContest.ContestSheen,
            ], required: false);
        }

        var legality = new LegalityAnalysisWrapper(
            LegalityAnalysisService.GetLegalitySafeRaw(new(pkm))
        );

        if (!legality.Valid)
        {
            Console.WriteLine();
            Console.WriteLine($"{pkm.GetType().Name} - {pkm.Nickname}");
            Console.WriteLine(legality.Report("en"));
        }

        var commonIllegalities = legality.Results.ToList()
            .FindAll(r => !r.Valid)
            .Select(r => $"{r.Identifier}-{r.Result}").ToArray();

        var moveIllegalities = legality.Info!.Moves.ToList()
            .FindAll(r => !r.Valid)
            .Select(r => $"Move-{r.Expect}");

        var relearnIllegalities = legality.Info.Relearn.ToList()
            .FindAll(r => !r.Valid)
            .Select(r => $"Relearn-{r.Expect}");

        string[] illegalities = [.. commonIllegalities, .. moveIllegalities, .. relearnIllegalities];

        foreach (var r in illegalities)
        {
            Console.WriteLine(r);
        }
        if (illegalities.Length > 0)
            Console.WriteLine();

        AssertWithDebug("illegalities", illegalities);

        if (missingData.Count > 0)
            throw new Exception($"Missing properties for {pkm.GetType().Name}/{pkm.Nickname}\n{JsonSerializer.Serialize(missingData)}");
    }
}
