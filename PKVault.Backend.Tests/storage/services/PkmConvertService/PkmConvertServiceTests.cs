using System.IO.Abstractions.TestingHelpers;
using System.Reflection.Metadata;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using PKHeX.Core;

public class PkmConvertServiceTests
{
    private static readonly byte[] pikachuPK1Bytes = File.ReadAllBytes("./assets/0025 - PIKACHU - 98F7.pk1");

    private static readonly Dictionary<string, object> pikachuExpectedData = JsonSerializer.Deserialize<Dictionary<string, object>>(
        File.ReadAllText("./assets/pikachu-expected.json")
    )!;

    private static bool pkFolderCleaned = false;

    public PkmConvertServiceTests()
    {
    }

    private PkmConvertService2 GetService()
    {
        return new();
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
        InlineData("PB7"),
        InlineData("PK8")
    ]
    [
        InlineData("PB8"),
        InlineData("PA8"),
        InlineData("PK9"),
        InlineData("PA9")
    ]
    public async Task TestAllConversions(string targetTypeName)
    {
        if (!pkFolderCleaned)
        {
            pkFolderCleaned = true;

            if (Directory.Exists("./pkm-files"))
                Directory.Delete("./pkm-files", true);
            Directory.CreateDirectory("./pkm-files");
        }

        var service = GetService();

        // 1. Charger PK1 original
        FileUtil.TryGetPKM(pikachuPK1Bytes, out var sourcePk1, "pk1");
        Assert.NotNull(sourcePk1);
        Assert.Equal(25, sourcePk1.Species);

        // 2. Créer blank cible
        var blank = CreateBlankTarget(targetTypeName);

        // 3. Convertir
        var result = service.ConvertTo(sourcePk1, blank);

        // 4. Vérifier type
        Assert.Equal(targetTypeName, result.GetType().Name);

        // 5. Vérifier données attendues
        AssertExpectedData(result, targetTypeName);

        // var filename = FileUtil.GetPKMTempFileName(result, false);
        File.WriteAllBytes("./pkm-files/" + result.FileName, result.DecryptedPartyData);

        // var client = new AssemblyClient();
        // var staticData = (await client.GetAsyncJsonGz(
        //     GenStaticDataService.GetStaticDataPathParts("en"),
        //     StaticDataJsonContext.Default.StaticDataDTO
        // ))!;
        // var staticMoves = staticData.Moves;
        // var staticMoves = staticData.Versions[(byte)GameVersion.S].;

        // Console.WriteLine(string.Join(',',
        //     GameInfo.Strings.Gen3.GetLocationNames(0).ToArray().Select((name, i) => $"{i} - {name}")
        // ));

        // var sourceMovesItems = GetPkmAvailableMoves(sourcePk1);
        // var resultMovesItems = GetPkmAvailableMoves(result);

        // Console.WriteLine($"{sourcePk1.GetType()} moves = {String.Join(',', result.Moves.Select(m => staticMoves[m].Name))}\n\n");
        // Console.WriteLine($"{sourcePk1.GetType()} moves = {String.Join(',', result.Moves.Select(m => sourceMovesItems.Find(item => item.Id == m)))}");

        // Console.WriteLine($"{result.GetType()} moves = {String.Join(',', result.Moves.Select(m => staticMoves[m].Name))}\n\n");
        // Console.WriteLine($"{result.GetType()} moves = {String.Join(',', result.Moves.Select(m => resultMovesItems.Find(item => item.Id == m)))}");

        // Console.WriteLine($"{result.GetType()} available moves = {String.Join(',', resultMovesItems.Select(m => staticMoves[m.Id].Name))}\n\n");
        // Console.WriteLine($"{result.GetType()} available moves = {String.Join(',', resultMovesItems.Select(m => m.Id))}");

        // 6. Vérifier légalité
        // var legality = new LegalityAnalysis(result);
        // Assert.True(legality.Valid, $"Illegalities in {targetTypeName}:\n{string.Join('\n',
        //     legality.Results.ToList()
        //     .FindAll(r => !r.Valid)
        //     .Select(r => $"{r.Identifier}-{r.Result}"))}");
        // Assert.True(legality.Valid, $"Illegalities in {targetTypeName}:\n{legality.Report()}");
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

    private void AssertExpectedData(PKM pkm, string typeName)
    {
        var expectedData = (JsonElement)pikachuExpectedData[typeName];

        Assert.Equal(expectedData.GetProperty("species").GetInt32(), pkm.Species);
        Assert.Equal(expectedData.GetProperty("form").GetInt32(), pkm.Form);
        Assert.Equal(expectedData.GetProperty("gender").GetByte(), pkm.Gender);
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

        // if (pkm is ITeraType pkmTera)
        // {
        //     Assert.Equal(expectedData.GetProperty("teratype").GetSByte(), (sbyte)pkmTera.TeraType);
        // }

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

    // public List<MoveItem> GetPkmAvailableMoves(PKM pkm)
    // {
    //     var legality = new LegalityAnalysis(pkm);

    //     var moveComboSource = new LegalMoveComboSource();
    //     var moveSource = new LegalMoveSource<ComboItem>(moveComboSource);

    //     var save = BlankSaveFile.Get(
    //         StaticDataService.GetSingleVersion(pkm.Version),
    //         pkm.OriginalTrainerName,
    //         (LanguageID)(pkm is GBPKM gbpkm
    //             ? gbpkm.IsSpeciesNameMatch(pkm.Language) ? pkm.Language : gbpkm.GuessedLanguage(pkm.Language)
    //             : pkm.Language)
    //     );

    //     var filteredSources = new FilteredGameDataSource(save, GameInfo.Sources);
    //     moveSource.ChangeMoveSource(filteredSources.Moves);
    //     moveSource.ReloadMoves(legality);

    //     var movesStr = GameInfo.GetStrings("en").movelist;

    //     var availableMoves = new List<MoveItem>();

    //     moveComboSource.DataSource.ToList().ForEach(data =>
    //     {
    //         if (data.Value > 0 && moveSource.Info.CanLearn((ushort)data.Value))
    //         {
    //             var item = new MoveItem(
    //                 Id: data.Value
    //             // Type = MoveInfo.GetType((ushort)data.Value, Pkm.Context),
    //             // Text = movesStr[data.Value],
    //             // SourceTypes = moveSourceTypes.FindAll(type => moveSourceTypesRecord[type].Length > data.Value && moveSourceTypesRecord[type][data.Value]),
    //             );
    //             availableMoves.Add(item);
    //         }
    //     });

    //     return availableMoves;
    // }
}
