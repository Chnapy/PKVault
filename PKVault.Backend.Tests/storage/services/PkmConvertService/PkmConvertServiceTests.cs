using System.Text.Json;
using Moq;
using PKHeX.Core;

public class PkmConvertServiceTests
{
    private static readonly byte[] pikachuForwardBytes = File.ReadAllBytes("./assets/pikachu-front.pk1");
    private static readonly Dictionary<string, object> pikachuForwardExpectedData = JsonSerializer.Deserialize<Dictionary<string, object>>(
        File.ReadAllText("./assets/pikachu-front-expected.json")
    )!;

    private static readonly byte[] pikachuBackwardBytes = File.ReadAllBytes("./assets/pikachu-back.pa9");
    private static readonly Dictionary<string, object> pikachuBackwardExpectedData = JsonSerializer.Deserialize<Dictionary<string, object>>(
        File.ReadAllText("./assets/pikachu-back-expected.json")
    )!;

    private static readonly byte[] bizarreForwardBytes = File.ReadAllBytes("./assets/bizarre-front.pk2");
    private static readonly Dictionary<string, object> bizarreForwardExpectedData = JsonSerializer.Deserialize<Dictionary<string, object>>(
        File.ReadAllText("./assets/bizarre-front-expected.json")
    )!;

    private static readonly byte[] mukForwardBytes = File.ReadAllBytes("./assets/muk-front.pk3");
    private static readonly Dictionary<string, object> mukForwardExpectedData = JsonSerializer.Deserialize<Dictionary<string, object>>(
        File.ReadAllText("./assets/muk-front-expected.json")
    )!;

    private static bool pkFolderCleaned = false;

    private PkmConvertService GetService()
    {
        Mock<ISettingsService> mockSettingsService = new();
        mockSettingsService.Setup(x => x.GetSettings()).Returns(new SettingsDTO(
            BuildID: default, Version: "", PkhexVersion: "", AppDirectory: "", SettingsPath: "",
            CanUpdateSettings: false, CanScanSaves: false, SettingsMutable: new(
                DB_PATH: "", SAVE_GLOBS: [], STORAGE_PATH: "", BACKUP_PATH: "",
                LANGUAGE: "fr"
            )
        ));

        return new(mockSettingsService.Object);
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
    public async Task TestAllPikachuForwardConversions(string targetTypeName)
    {
        SetupPKDirectory("pikachu-front");

        var service = GetService();

        FileUtil.TryGetPKM(pikachuForwardBytes, out var sourcePkm, "pk1");
        Assert.NotNull(sourcePkm);
        Assert.Equal(25, sourcePkm.Species);

        var blank = CreateBlankTarget(targetTypeName);

        var result = service.ConvertTo(new(sourcePkm), blank).GetMutablePkm();

        Assert.Equal(targetTypeName, result.GetType().Name);

        File.WriteAllBytes(Path.Combine("./pkm-files", "pikachu-front", result.FileName), result.DecryptedPartyData);

        AssertExpectedData(result, (JsonElement)pikachuForwardExpectedData[targetTypeName]);
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
    public async Task TestAllPikachuBackwardConversions(string targetTypeName)
    {
        SetupPKDirectory("pikachu-back");

        var service = GetService();

        FileUtil.TryGetPKM(pikachuBackwardBytes, out var sourcePkm, "pa9");
        Assert.NotNull(sourcePkm);
        Assert.Equal(25, sourcePkm.Species);

        var blank = CreateBlankTarget(targetTypeName);

        var result = service.ConvertTo(new(sourcePkm), blank).GetMutablePkm();

        Assert.Equal(targetTypeName, result.GetType().Name);

        File.WriteAllBytes(Path.Combine("./pkm-files", "pikachu-back", result.FileName), result.DecryptedPartyData);

        AssertExpectedData(result, (JsonElement)pikachuBackwardExpectedData[targetTypeName]);
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
        InlineData("PK7"),
        InlineData("PB7"),  // G2 pkms not available here
        InlineData("PK8")
    ]
    [
        InlineData("PB8"),
        InlineData("PA8"),
        InlineData("PK9"),  // Unown not available here
        InlineData("PA9")   // Unown not available here
    ]
    public async Task TestAllBizarreForwardConversions(string targetTypeName)
    {
        SetupPKDirectory("bizarre-front");

        var service = GetService();

        FileUtil.TryGetPKM(bizarreForwardBytes, out var sourcePkm, "pk2");
        Assert.NotNull(sourcePkm);
        Assert.Equal(201, sourcePkm.Species);

        var blank = CreateBlankTarget(targetTypeName);

        var result = service.ConvertTo(new(sourcePkm), blank).GetMutablePkm();

        Assert.Equal(targetTypeName, result.GetType().Name);

        File.WriteAllBytes(Path.Combine("./pkm-files", "bizarre-front", result.FileName), result.DecryptedPartyData);

        AssertExpectedData(result, (JsonElement)bizarreForwardExpectedData[targetTypeName]);
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
        InlineData("PA8"),
        InlineData("PK9"),
        InlineData("PA9")
    ]
    public async Task TestAllMukForwardConversions(string targetTypeName)
    {
        SetupPKDirectory("muk-front");

        var service = GetService();

        FileUtil.TryGetPKM(mukForwardBytes, out var sourcePkm, "pk3");
        Assert.NotNull(sourcePkm);
        Assert.Equal(89, sourcePkm.Species);

        var blank = CreateBlankTarget(targetTypeName);

        var result = service.ConvertTo(new(sourcePkm), blank).GetMutablePkm();

        Assert.Equal(targetTypeName, result.GetType().Name);

        File.WriteAllBytes(Path.Combine("./pkm-files", "muk-front", result.FileName), result.DecryptedPartyData);

        AssertExpectedData(result, (JsonElement)mukForwardExpectedData[targetTypeName]);
    }

    // [Fact]
    // public void TestRoundTrip_PK1_PK9_PK1()
    // {
    //     var service = GetService();

    //     FileUtil.TryGetPKM(pikachuPK1Bytes, out var pk1, "pk1");
    //     Assert.NotNull(pk1);

    //     var pa9Blank = new PA9();

    //     // PK1 → PA9  
    //     var pa9 = service.ConvertTo(pk1, pa9Blank);
    //     Assert.IsType<PA9>(pa9);

    //     // PA9 → PK1 (round-trip)
    //     var pk1Back = service.ConvertTo(pa9, pk1);
    //     Assert.IsType<PK1>(pk1Back);

    //     // Vérifications clés préservées
    //     Assert.Equal(pk1.Species, pk1Back.Species);
    //     Assert.Equal(pk1.CurrentLevel, pk1Back.CurrentLevel);
    // }

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
        Assert.Equal(expectedData.GetProperty("species").GetInt32(), pkm.Species);
        Assert.Equal(expectedData.GetProperty("form").GetInt32(), pkm.Form);
        Assert.Equal(expectedData.GetProperty("gender").GetByte(), pkm.Gender);
        Assert.Equal(expectedData.GetProperty("version").GetByte(), (byte)pkm.Version);
        Assert.Equal(expectedData.GetProperty("level").GetInt32(), pkm.CurrentLevel);
        Assert.Equal(expectedData.GetProperty("exp").GetUInt32(), pkm.EXP);
        Assert.Equal(expectedData.GetProperty("shiny").GetBoolean(), pkm.IsShiny);
        if (expectedData.TryGetProperty("nicknamed", out var nicknamed))
            Assert.Equal(nicknamed.GetBoolean(), pkm.IsNicknamed);
        Assert.Equal(expectedData.GetProperty("nickname").GetString(), pkm.Nickname);
        if (expectedData.TryGetProperty("nature", out var nature))
            Assert.Equal(nature.GetByte(), (byte)pkm.Nature);
        Assert.Equal(expectedData.GetProperty("ability").GetInt32(), pkm.Ability);
        Assert.Equal(expectedData.GetProperty("tid").GetInt32(), pkm.TID16);
        Assert.Equal(expectedData.GetProperty("ot").GetString(), pkm.OriginalTrainerName);
        Assert.Equal(expectedData.GetProperty("language").GetInt32(), pkm.Language);

        if (expectedData.TryGetProperty("metLocation", out var metLocation))
        {
            Assert.Equal(metLocation.GetInt32(), pkm.MetLocation);
        }

        if (expectedData.TryGetProperty("ball", out var ball))
        {
            Assert.Equal(ball.GetByte(), pkm.Ball);
        }

        // Moves
        if (expectedData.TryGetProperty("moves", out var moves))
        {
            var expectedMoves = moves.EnumerateArray()
                .Select(x => (ushort)x.GetInt32()).ToArray();
            Assert.Equal(expectedMoves, pkm.Moves);
        }

        // IVs
        if (expectedData.TryGetProperty("ivs", out var ivs))
        {
            var expectedIv = ivs.EnumerateArray()
                .Select(x => x.GetInt32()).ToArray();
            Assert.Equal(expectedIv, (int[])[
                pkm.IV_HP,
                pkm.IV_ATK,
                pkm.IV_DEF,
                pkm.IV_SPA,
                pkm.IV_SPD,
                pkm.IV_SPE,
            ]);
        }

        // EVs
        if (expectedData.TryGetProperty("evs", out var evs))
        {
            var expectedEv = evs.EnumerateArray()
                .Select(x => x.GetInt32()).ToArray();
            int[] pkmEvs = pkm is PB7 pb7
                ? [
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
                ];
            Assert.Equal(expectedEv, pkmEvs);
        }

        // Stats
        if (expectedData.TryGetProperty("stats", out var stats))
        {
            pkm.SetStats(pkm.GetStats(pkm.PersonalInfo));
            var expectedStats = stats.EnumerateArray()
                .Select(x => x.GetInt32()).ToArray();
            Assert.Equal(expectedStats, (int[])[
                pkm.Stat_HPMax,
                pkm.Stat_ATK,
                pkm.Stat_DEF,
                pkm.Stat_SPA,
                pkm.Stat_SPD,
                pkm.Stat_SPE,
            ]);
        }

        if (expectedData.TryGetProperty("friendship", out var friendship))
        {
            Assert.Equal(friendship.GetByte(), pkm.CurrentFriendship);
        }

        if (expectedData.TryGetProperty("helditem", out var helditem))
        {
            Assert.Equal(helditem.GetInt32(), pkm.HeldItem);
        }

        if (expectedData.TryGetProperty("sid", out var sid))
        {
            Assert.Equal(sid.GetInt32(), pkm.SID16);
        }

        if (expectedData.TryGetProperty("marks", out var marks))
        {
            if (pkm is IAppliedMarkings<bool> pkmMarkings)
            {
                List<bool> pkmMarks = [];
                for (var i = 0; i < pkmMarkings.MarkingCount; i++)
                {
                    pkmMarks.Add(pkmMarkings.GetMarking(i));
                }

                Assert.Equal(
                    marks.EnumerateArray().Select(v => v.GetBoolean()!),
                    pkmMarks
                );
            }
        }

        if (expectedData.TryGetProperty("ribbons", out var ribbons))
        {
            var ribbonInfos = RibbonInfo.GetRibbonInfo(pkm)
                .Where(info => info.HasRibbon || info.RibbonCount > 0)
                .ToDictionary(
                    info => info.Name,
                    info => info.HasRibbon ? (byte)1 : info.RibbonCount
                );

            Assert.Equal(ribbons.Deserialize<Dictionary<string, byte>>(), ribbonInfos);
        }

        if (expectedData.TryGetProperty("size", out var size))
        {
            var ribbonInfos = RibbonInfo.GetRibbonInfo(pkm)
                .Where(info => info.HasRibbon || info.RibbonCount > 0)
                .ToDictionary(
                    info => info.Name,
                    info => info.HasRibbon ? (byte)1 : info.RibbonCount
                );

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

            Assert.Equal(size.EnumerateArray().Select(v => v.GetInt32()), pkmSize);
        }

        if (expectedData.TryGetProperty("contest", out var contest))
        {
            if (pkm is IContestStats pkmContest)
            {
                Assert.Equal(
                    contest.EnumerateArray().Select(v => v.GetByte()!),
                    [
                        pkmContest.ContestCool,
                        pkmContest.ContestBeauty,
                        pkmContest.ContestCute,
                        pkmContest.ContestSmart,
                        pkmContest.ContestTough,
                        pkmContest.ContestSheen,
                    ]
                );
            }
        }

        var legality = new LegalityAnalysis(pkm);

        if (!legality.Valid)
        {
            Console.WriteLine(legality.Report());
        }

        var commonIllegalities = legality.Results.ToList()
            .FindAll(r => !r.Valid)
            .Select(r => $"{r.Identifier}-{r.Result}").ToArray();

        var moveIllegalities = legality.Info.Moves.ToList()
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

        if (expectedData.TryGetProperty("illegalities", out var illegalitiesJson))
        {
            var expectedIllegalities = illegalitiesJson.EnumerateArray()
                .Select(v => v.GetString()!).ToArray();
            var expectedIllegalitiesStr = string.Join('_', expectedIllegalities);

            Assert.Equal(expectedIllegalities.Length, illegalities.Length);

            foreach (var r in illegalities)
            {
                Assert.Contains(r, expectedIllegalities);
            }
        }
    }
}
