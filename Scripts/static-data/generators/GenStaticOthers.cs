using PKHeX.Core;
using PKVault.Core;
using Serilog;

public class GenStaticOthers(
    string lang,
    string pkhexLang,
    PokeApiService pokeApiService, IFileIOService fileIOService
    ) : StaticDataGenerator<StaticOthersData>(
    jsonTypeInfo: StaticDataJsonContext.Default.StaticOthersData,
    jsonTypeInfoIndented: new StaticDataJsonContext(JsonIndentedOptions).StaticOthersData,
    fileIOService
)
{
    protected override async Task<StaticOthersData> GetData(string[] rootParts)
    {
        var versions = GetStaticVersions();
        var stats = GetStaticStats();
        var types = GetStaticTypes();
        var moves = GetStaticMoves();
        var natures = GetStaticNatures();
        var abilities = GetStaticAbilities();
        var items = GetStaticItems();
        var generations = GetStaticGenerations();
        var pokedexes = GetStaticPokedexes();

        return new StaticOthersData(
            Versions: await versions,
            Stats: await stats,
            Types: types,
            Moves: await moves,
            Natures: await natures,
            Abilities: abilities,
            Items: await items,
            Generations: await generations,
            Pokedexes: await pokedexes,
            Ribbons: GetStaticRibbons(),
            Languages: GetStaticLanguages(),
            EggSprite: GetEggSprite()
        );
    }

    private async Task<Dictionary<byte, StaticVersion>> GetStaticVersions()
    {
        using var _ = Log.Logger.Time("static-data process versions");
        List<Task<StaticVersion>> tasks = [];
        var staticVersions = new Dictionary<int, StaticVersion>();

        foreach (var version in Enum.GetValues<GameVersion>())
        {
            tasks.Add(Task.Run(async () =>
            {
                var saveVersion = GameVersionUtil.GetSingleVersion(version);
                var blankSave = saveVersion == default
                    ? null
                    : BlankSaveFile.Get(saveVersion);

                var versionName = GetVersionName(version);
                var versionRegion = GetVersionRegionName(version);
                var versionPokedexes = GetVersionPokedexes(version);

                GameVersion[] extraValidVersions = [
                    GameVersion.Stadium, GameVersion.StadiumJ, GameVersion.Stadium2,
                    GameVersion.COLO, GameVersion.XD, GameVersion.RSBOX,
                ];

                bool isGameVersion(GameVersion v) => v.IsValidSavedVersion()
                    || extraValidVersions.Contains(v);

                var versionChildren = isGameVersion(version)
                    ? []
                    : Enum.GetValues<GameVersion>()
                        .Where(v => isGameVersion(v) && version.ContainsFromLumped(v)).ToArray();

                // version.Context is not fully reliable for non-game version
                var context = versionChildren.Length > 0
                    ? versionChildren.Max(v => v.Context)
                    : version.Context;

                return new StaticVersion(
                    Id: (byte)version,
                    Name: await versionName,
                    Context: context,
                    IsGameVersion: isGameVersion(version),
                    Children: versionChildren,
                    Generation: version.Generation,
                    Region: await versionRegion,
                    Pokedexes: await versionPokedexes,
                    MaxSpeciesId: blankSave?.MaxSpeciesID ?? 0,
                    MaxIV: blankSave?.MaxIV ?? 0,
                    MaxEV: blankSave?.MaxEV ?? 0
                );
            }));
        }

        var dict = new Dictionary<byte, StaticVersion>();
        foreach (var value in await Task.WhenAll(tasks))
        {
            dict.Add(value.Id, value);
        }

        return dict;
    }

    private async Task<Dictionary<int, StaticStat>> GetStaticStats()
    {
        using var _ = Log.Logger.Time("static-data process stats");
        List<Task<StaticStat>> tasks = [];

        for (var i = 1; i <= 6; i++)
        {
            var statIndex = i;
            tasks.Add(Task.Run(async () =>
            {
                var statObj = await pokeApiService.GetStat(statIndex);

                return new StaticStat(
                    Id: statIndex,
                    Name: PokeApiService.GetNameForLang(statObj.Names, lang)
                );
            }));
        }

        var dict = new Dictionary<int, StaticStat>();
        foreach (var value in await Task.WhenAll(tasks))
        {
            dict.Add(value.Id, value);
        }

        return dict;
    }

    private Dictionary<int, StaticType> GetStaticTypes()
    {
        var typeNames = GameInfo.GetStrings(pkhexLang).Types;
        var dict = new Dictionary<int, StaticType>();

        for (var i = 0; i < typeNames.Count; i++)
        {
            var typeName = typeNames[i];
            var typeId = i + 1;
            dict.Add(typeId, new(
                Id: typeId,
                Name: typeName
            ));
        }

        return dict;
    }

    private async Task<Dictionary<int, StaticMove>> GetStaticMoves()
    {
        using var _ = Log.Logger.Time($"static-data {lang} process moves");
        var moveNames = GameInfo.GetStrings(pkhexLang).Move;
        List<Task<StaticMove>> tasks = [];

        for (var i = 0; i < moveNames.Count; i++)
        {
            var moveId = i;
            var moveName = moveNames[moveId];
            tasks.Add(Task.Run(async () =>
            {
                if (moveId == 0)
                {
                    return new StaticMove(
                        Id: moveId,
                        Name: moveName,
                        DataUntilGeneration: [new(
                            UntilGeneration: 99,
                            Type: 1,   // normal
                            Category: MoveCategory.STATUS,
                            Power: null,
                            Accuracy: null
                        )]
                    );
                }

                var moveObj = await pokeApiService.GetMove(moveId);
                if (moveObj == null)
                {
                    return new StaticMove(
                        Id: moveId,
                        Name: moveName,
                        DataUntilGeneration: [new(
                            UntilGeneration: 99,
                            Type: 1,   // normal
                            Category: MoveCategory.STATUS,
                            Power: null,
                            Accuracy: null
                        )]
                    );
                }

                var generation = PokeApiService.GetGenerationValue(moveObj.Generation.Name);

                var type = PokeApiService.GetIdFromUrl(moveObj.Type.Url);

                var category = GetMoveCategory(moveObj.DamageClass.Name);
                var oldCategory = ImmutablePKM.GetMoveCategoryG123(type, category);

                var tmpTypeUrl = moveObj.Type.Url;
                var tmpPowerUrl = moveObj.Power;
                var tmpAccuracyUrl = moveObj.Accuracy;

                List<StaticMoveGeneration> dataUntilGeneration = [.. await Task.WhenAll(
                    moveObj.PastValues
                        .Reverse()
                        .Select(async pastValue =>
                        {
                            var typeUrl = pastValue.Type?.Url ?? tmpTypeUrl;
                            var power = pastValue.Power ?? tmpPowerUrl;
                            var accuracy = pastValue.Accuracy ?? tmpAccuracyUrl;

                            tmpTypeUrl = typeUrl;
                            tmpPowerUrl = power;
                            tmpAccuracyUrl = accuracy;

                            var versionGroup = await pokeApiService.GetVersionGroup(pastValue.VersionGroup);
                            byte untilGeneration = (byte) (PokeApiService.GetGenerationValue(versionGroup.Generation.Name) - 1);

                            return new StaticMoveGeneration(
                                UntilGeneration: untilGeneration,
                                Type: PokeApiService.GetIdFromUrl(typeUrl),
                                Category: untilGeneration <= 3 ? oldCategory : category,
                                Power: power,
                                Accuracy: accuracy
                            );
                        })
                        .Reverse()
                )];

                dataUntilGeneration.Add(new(
                    UntilGeneration: 99,
                    Type: PokeApiService.GetIdFromUrl(moveObj.Type.Url),
                    Category: category,
                    Power: moveObj.Power,
                    Accuracy: moveObj.Accuracy
                ));

                if (generation < 4
                    && oldCategory != category
                    && !dataUntilGeneration.Any(data => data.UntilGeneration == 3))
                {
                    var dataPostG3 = dataUntilGeneration.Find(data => data.UntilGeneration > 3);
                    dataUntilGeneration.Add(new(
                        UntilGeneration: 3,
                        Type: dataPostG3.Type,
                        Category: oldCategory,
                        Power: dataPostG3.Power,
                        Accuracy: dataPostG3.Accuracy
                    ));
                }

                dataUntilGeneration.Sort((a, b) => a.UntilGeneration < b.UntilGeneration ? -1 : 1);

                return new StaticMove(
                    Id: moveId,
                    Name: moveName,
                    DataUntilGeneration: [.. dataUntilGeneration]
                );
            }));
        }

        var dict = new Dictionary<int, StaticMove>();
        foreach (var value in await Task.WhenAll(tasks))
        {
            dict.Add(value.Id, value);
        }

        return dict;
    }

    private async Task<Dictionary<int, StaticNature>> GetStaticNatures()
    {
        using var _ = Log.Logger.Time($"static-data {lang} process natures");
        var naturesNames = GameInfo.GetStrings(pkhexLang).Natures;
        List<Task<StaticNature>> tasks = [];

        for (var i = 0; i < naturesNames.Count; i++)
        {
            var natureId = i;
            var natureName = naturesNames[natureId];
            tasks.Add(Task.Run(async () =>
            {
                var natureNameEn = GameInfo.Strings.natures[natureId];
                var natureObj = await pokeApiService.GetNature(natureNameEn);

                return new StaticNature(
                    Id: natureId,
                    Name: natureName,
                    IncreasedStatIndex: natureObj.IncreasedStat != null
                        ? PokeApiService.GetIdFromUrl(natureObj.IncreasedStat.Url)
                        : null,
                    DecreasedStatIndex: natureObj.DecreasedStat != null
                        ? PokeApiService.GetIdFromUrl(natureObj.DecreasedStat.Url)
                        : null
                );
            }));
        }

        var dict = new Dictionary<int, StaticNature>();
        foreach (var value in await Task.WhenAll(tasks))
        {
            dict.Add(value.Id, value);
        }

        return dict;
    }

    private Dictionary<int, StaticAbility> GetStaticAbilities()
    {
        var abilitiesNames = GameInfo.GetStrings(pkhexLang).abilitylist;
        var dict = new Dictionary<int, StaticAbility>();

        for (var i = 0; i < abilitiesNames.Length; i++)
        {
            var abilityId = i;
            var abilityName = abilitiesNames[abilityId];
            dict.Add(abilityId, new StaticAbility(
                Id: abilityId,
                Name: abilityName
            ));
        }

        return dict;
    }

    private async Task<StaticItemsData> GetStaticItems()
    {
        using var _ = Log.Logger.Time($"static-data {lang} process items");

        List<StaticVersionsItems> VersionItems = [];
        Dictionary<string, StaticItem> Items = [];

        // var notFound = new List<string>();
        // log.LogInformation(string.Join('\n', GameInfo.Strings.itemlist.ToList().FindAll(item => item.ToLower().Contains("ball"))));

        List<ComboItem> getItemStrings(GameVersion _version, GameStrings strings)
        {
            var version = GameVersionUtil.GetSingleVersion(_version);
            if (version == default)
            {
                return _version == GameVersion.Any
                    ? Util.GetCBList(strings.itemlist)
                    : [];
            }

            var save = BlankSaveFile.Get(version);
            var items = Util.GetCBList(strings.GetItemStrings(save.Context, save.Version), save.HeldItems);
            items.RemoveAll(i => i.Value > save.MaxItemID);
            return items;
        }

        foreach (var version in Enum.GetValues<GameVersion>())
        {
            var itemlist = getItemStrings(version, GameInfo.Strings);
            var itemlistStr = string.Join('.', itemlist.Select(it => $"{it.Text},{it.Value}"));

            var versionItem = VersionItems.FirstOrDefault(st =>
            {
                var vers = (GameVersion)st.Versions.FirstOrDefault();

                var itemlist2 = getItemStrings(vers, GameInfo.Strings);
                return itemlist.Count == itemlist2.Count
                    && itemlistStr == string.Join('.', itemlist2.Select(it => $"{it.Text},{it.Value}"));
            });

            if (versionItem == default)
            {
                Dictionary<int, string> comboItems = [];
                foreach (var item in itemlist)
                {
                    var itemNamePokeapi = PokeApiFromPKHeX.GetPokeapiItemName(item.Text);
                    if (comboItems.TryGetValue(item.Value, out var textPokeapi))
                    {
                        if (textPokeapi == itemNamePokeapi)
                        {
                            continue;
                        }

                        throw new Exception($"Key exists, key={item.Value} existingText={textPokeapi} tryText={itemNamePokeapi}");
                    }
                    comboItems.Add(item.Value, itemNamePokeapi);
                }

                versionItem = new(
                    Versions: [],
                    ComboItems: comboItems
                );
                VersionItems.Add(versionItem);
            }
            versionItem.Versions.Add((byte)version);
        }

        foreach (var (Versions, _) in VersionItems)
        {
            var version = (GameVersion)Versions.First();
            var itemsEn = getItemStrings(version, GameInfo.Strings);
            var items = getItemStrings(version, GameInfo.GetStrings(pkhexLang));

            for (var i = 0; i < items.Count; i++)
            {
                var item = items[i];

                var itemEn = itemsEn.FirstOrDefault(it => it.Value == item.Value);
                if (itemEn == default)
                {
                    Serilog.Log.Error($"Item value not found in default items list, lang={lang} version={version} item={item.Value}/{item.Text}");
                    continue;
                }

                if (Items.ContainsKey(itemEn.Text))
                {
                    continue;
                }

                var itemNamePokeapi = PokeApiFromPKHeX.GetPokeapiItemName(itemEn.Text);
                if (itemNamePokeapi.Trim().Length == 0 || itemNamePokeapi == "???")
                {
                    continue;
                }

                var itemObj = await pokeApiService.GetItem(GetPokeapiSpriteName(itemNamePokeapi));
                var sprite = itemObj?.Sprites.Default ?? "";

                // if (itemObj == null)
                // {
                //     log.LogInformation($"Item not found: {itemId} - {itemNamePokeapi}");
                // }

                // if (itemNameEn.ToLower().Contains("belt"))
                // log.LogInformation($"Error with item {itemId} - {itemNameEn} / {PokeApiFileClient.PokeApiNameFromPKHexName(itemNameEn)} / {itemName}");

                Items[itemNamePokeapi] = new StaticItem(
                    Id: itemNamePokeapi,
                    Name: item.Text,
                    Sprite: GetPokeapiRelativePath(sprite)
                );
            }
        }

        return new(
            VersionItems,
            Items
        );
    }

    private async Task<Dictionary<byte, StaticGeneration>> GetStaticGenerations()
    {
        var staticGenerations = new Dictionary<byte, StaticGeneration>();

        for (byte id = 1; id < 20; id++)
        {
            try
            {
                var region = await pokeApiService.GetRegion(id);

                if (region.MainGeneration == null)
                {
                    continue;
                }

                var generation = PokeApiService.GetGenerationValue(region.MainGeneration.Name);

                if (!staticGenerations.TryGetValue(generation, out var value))
                {
                    value = new StaticGeneration(
                        Id: generation,
                        Regions: []
                    );
                }
                value = value with { Regions = [.. value.Regions, PokeApiService.GetNameForLang(region.Names, lang)] };
                staticGenerations.Remove(generation);
                staticGenerations.Add(generation, value);
            }
            catch
            {
                break;
            }
        }

        return staticGenerations;
    }

    private async Task<Dictionary<string, StaticPokedex>> GetStaticPokedexes()
    {
        var pokedexes = await pokeApiService.GetPokedexList();

        byte order = 0;

        return pokedexes.ToDictionary(
            p => p.Name,
            p => new StaticPokedex(
                Key: p.Name,
                Name: PokeApiService.GetNameForLang(p.Names, lang),
                Order: ++order,
                PokemonIndexes: p.PokemonEntries.ToDictionary(
                    e => (ushort)PokeApiService.GetIdFromUrl(e.PokemonSpecies.Url),
                    e => e.EntryNumber
                )
            )
        );
    }

    private Dictionary<string, StaticRibbon> GetStaticRibbons()
    {
        var ribbonsTxt = GameInfo.GetStrings(pkhexLang).Ribbons;

        return Enum.GetValues<EntityContext>()
            .Where(e => e.IsValid)
            .Select(e => BlankSaveFile.Get(e).BlankPKM)
            .SelectMany(RibbonInfo.GetRibbonInfo)
            .Select(ribbon => ribbon.Name)
            .Distinct()
            .Order()
            .Select(name => new StaticRibbon(
                Key: name,
                SpriteKey: name.Replace("CountG3", "G3").ToLowerInvariant(),
                Name: ribbonsTxt.GetName(name)
            ))
            .ToDictionary(p => p.Key);
    }

    private Dictionary<byte, string> GetStaticLanguages()
    {
        var languageNames = GameInfo.GetStrings(pkhexLang).languageNames;

        return Enum.GetValues<LanguageID>()
            .Select((languageId, i) => ((byte)languageId, languageNames[i]))
            .ToDictionary();
    }

    public static string GetEggSprite()
    {
        return GetPokeapiRelativePath("https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/egg.png");
    }

    // Some older items have no PokéAPI sprite of their own; use a stand-in sprite without renaming the item itself.
    private static string GetPokeapiSpriteName(string pokeapiName) => pokeapiName switch
    {
        "berry" => "oran-berry",
        "gold-berry" => "sitrus-berry",
        "bitter-berry" => "persim-berry",
        "burnt-berry" => "rawst-berry",
        "ice-berry" => "aspear-berry",
        "mint-berry" => "chesto-berry",
        "miracle-berry" => "lum-berry",
        "mystery-berry" => "leppa-berry",
        "psncure-berry" => "pecha-berry",
        "przcure-berry" => "cheri-berry",
        "parlyz-heal" => "paralyze-heal",
        "x-defend" => "x-defense",
        "x-special" => "x-sp-atk",
        _ => pokeapiName
    };

    private static MoveCategory GetMoveCategory(string damageClassName)
    {
        return damageClassName switch
        {
            "physical" => MoveCategory.PHYSICAL,
            "special" => MoveCategory.SPECIAL,
            "status" => MoveCategory.STATUS,
            _ => throw new Exception(),
        };
    }

    private async Task<string> GetVersionName(GameVersion version)
    {
        var pokeapiVersions = await Task.WhenAll(GetPokeApiVersion(version));

        List<string> names = [];

        foreach(var name in pokeapiVersions
            .OfType<PokeApi.Models.Version>()
            .Select(ver => PokeApiService.GetNameForLang(ver.Names, lang)))
        {
            // required to handle specific case Blue/Green (J)
            if (!names.Any(n => n.Contains(name)))
                names.Add(name);
        }

        return string.Join('/', names);
    }

    private async Task<string[]> GetVersionRegionName(GameVersion version)
    {
        var pokeapiVersions = await Task.WhenAll(GetPokeApiVersion(version));

        return [.. (await Task.WhenAll(
            pokeapiVersions
                .OfType<PokeApi.Models.Version>()
                .Select(async ver =>
                {
                    if (ver.Id == 0)
                    {
                        return [];
                    }

                    var versionGroup = await pokeApiService.GetVersionGroup(ver.VersionGroup);
                    var regions = await Task.WhenAll(versionGroup.Regions.Select(region =>
                        pokeApiService.GetRegion(region)
                    ));
                    return regions.Select(region => PokeApiService.GetNameForLang(region.Names, lang));
                })
            ))
            .SelectMany(v => v).Distinct()];
    }

    private async Task<string[]> GetVersionPokedexes(GameVersion version)
    {
        var pokeapiVersions = await Task.WhenAll(GetPokeApiVersion(version));

        return [
            "national",
            .. (await Task.WhenAll(
                pokeapiVersions
                    .OfType<PokeApi.Models.Version>()
                    .Select(async ver =>
                    {
                        if (ver.Id == 0)
                        {
                            return [];
                        }

                        var versionGroup = await pokeApiService.GetVersionGroup(ver.VersionGroup);
                        return versionGroup.Pokedexes.Select(pokedex => pokedex.Name);
                    })
            ))
            .SelectMany(v => v).Distinct()
        ];
    }

    private Task<PokeApi.Models.Version?>[] GetPokeApiVersion(GameVersion version)
    {
        static async Task<PokeApi.Models.Version?> FixJapVersionNames(Task<PokeApi.Models.Version?> versionTask)
        {
            var version = await versionTask;
            version.Names = [.. version.Names.Select(n =>
            {
                if (!n.Name1.EndsWith("(J)"))
                    n.Name1 = $"{n.Name1} (J)";
                return n;
            })];
            return version;
        }

        static async Task<PokeApi.Models.Version?> MergeVersionsNames(Task<PokeApi.Models.Version?> versionTask1, Task<PokeApi.Models.Version?> versionTask2)
        {
            var version1 = await versionTask1;
            var version2 = await versionTask2;
            version1.Names = [.. version1.Names.Select(n =>
            {
                var name2 = version2.Names.FirstOrDefault(n2 => n2.Language.Name == n.Language.Name)
                    ?? version2.Names.First(n2 => n2.Language.Name == "en");

                n.Name1 = string.Join('/', [n.Name1, name2.Name1]);
                return n;
            })];
            return version1;
        }

        return version switch
        {
            GameVersion.Any => [],
            GameVersion.Invalid => [],

            #region Gen3
            GameVersion.S => [pokeApiService.GetVersion(8)],
            GameVersion.R => [pokeApiService.GetVersion(7)],
            GameVersion.E => [pokeApiService.GetVersion(9)],
            GameVersion.FR => [pokeApiService.GetVersion(10)],
            GameVersion.LG => [pokeApiService.GetVersion(11)],
            GameVersion.CXD => [pokeApiService.GetVersion(19), pokeApiService.GetVersion(20)],
            #endregion

            #region Gen4
            GameVersion.D => [pokeApiService.GetVersion(12)],
            GameVersion.P => [pokeApiService.GetVersion(13)],
            GameVersion.Pt => [pokeApiService.GetVersion(14)],
            GameVersion.HG => [pokeApiService.GetVersion(15)],
            GameVersion.SS => [pokeApiService.GetVersion(16)],
            #endregion

            #region Gen5
            GameVersion.W => [pokeApiService.GetVersion(18)],
            GameVersion.B => [pokeApiService.GetVersion(17)],
            GameVersion.W2 => [pokeApiService.GetVersion(22)],
            GameVersion.B2 => [pokeApiService.GetVersion(21)],
            #endregion

            #region Gen6
            GameVersion.X => [pokeApiService.GetVersion(23)],
            GameVersion.Y => [pokeApiService.GetVersion(24)],
            GameVersion.AS => [pokeApiService.GetVersion(26)],
            GameVersion.OR => [pokeApiService.GetVersion(25)],
            #endregion

            #region Gen7
            GameVersion.SN => [pokeApiService.GetVersion(27)],
            GameVersion.MN => [pokeApiService.GetVersion(28)],
            GameVersion.US => [pokeApiService.GetVersion(29)],
            GameVersion.UM => [pokeApiService.GetVersion(30)],
            #endregion
            GameVersion.GO => [],

            #region Virtual Console (3DS) Gen1
            GameVersion.RD => [pokeApiService.GetVersion(1)],
            GameVersion.GN => [MergeVersionsNames(
                pokeApiService.GetVersion(2),
                FixJapVersionNames(pokeApiService.GetVersion(45))
            )],
            GameVersion.BU => [
                FixJapVersionNames(pokeApiService.GetVersion(44)),
                FixJapVersionNames(pokeApiService.GetVersion(45)),
                FixJapVersionNames(pokeApiService.GetVersion(46))
            ],
            GameVersion.YW => [pokeApiService.GetVersion(3)],
            #endregion

            #region Virtual Console (3DS) Gen2
            GameVersion.GD => [pokeApiService.GetVersion(4)],
            GameVersion.SI => [pokeApiService.GetVersion(5)],
            GameVersion.C => [pokeApiService.GetVersion(6)],
            #endregion

            #region Nintendo Switch
            GameVersion.GP => [pokeApiService.GetVersion(31)],
            GameVersion.GE => [pokeApiService.GetVersion(32)],
            GameVersion.SW => [pokeApiService.GetVersion(33)],
            GameVersion.SH => [pokeApiService.GetVersion(34)],
            GameVersion.PLA => [pokeApiService.GetVersion(39)],
            GameVersion.BD => [pokeApiService.GetVersion(37)],
            GameVersion.SP => [pokeApiService.GetVersion(38)],
            GameVersion.SL => [pokeApiService.GetVersion(40)],
            GameVersion.VL => [pokeApiService.GetVersion(41)],
            GameVersion.ZA => [pokeApiService.GetVersion(47)],
            GameVersion.CP => [pokeApiService.GetVersion(49)],
            #endregion

            // The following values are not actually stored values in pk data,
            // These values are assigned within PKHeX as properties for various logic branching.

            #region Game Groupings (SaveFile type, roughly)
            GameVersion.RB => [.. GetPokeApiVersion(GameVersion.RD), .. GetPokeApiVersion(GameVersion.GN), .. GetPokeApiVersion(GameVersion.BU)],
            GameVersion.RBY => [.. GetPokeApiVersion(GameVersion.YW), .. GetPokeApiVersion(GameVersion.RB)],
            GameVersion.GS => [.. GetPokeApiVersion(GameVersion.GD), .. GetPokeApiVersion(GameVersion.SI)],
            GameVersion.GSC => [.. GetPokeApiVersion(GameVersion.GS), .. GetPokeApiVersion(GameVersion.C)],
            GameVersion.RS => [.. GetPokeApiVersion(GameVersion.R), .. GetPokeApiVersion(GameVersion.S)],
            GameVersion.RSE => [.. GetPokeApiVersion(GameVersion.RS), .. GetPokeApiVersion(GameVersion.E)],
            GameVersion.FRLG => [.. GetPokeApiVersion(GameVersion.FR), .. GetPokeApiVersion(GameVersion.LG)],
            GameVersion.RSBOX => [
                Task.FromResult<PokeApi.Models.Version?>(new() {
                    Names = [
                        new() { Name1 = "Box Ruby & Sapphire", Language = new() { Name = "en", Url = "https://pokeapi.co/api/v2/language/9/" } },
                        new() { Name1 = "Box Rubis & Saphir", Language = new() { Name = "fr", Url = "https://pokeapi.co/api/v2/language/5/" } },
                        new() { Name1 = "Box: Rubin und Saphir", Language = new() { Name = "de", Url = "https://pokeapi.co/api/v2/language/6/" } },
                        new() { Name1 = "Box: Rubí y Zafiro", Language = new() { Name = "es", Url = "https://pokeapi.co/api/v2/language/7/" } },
                    ]
                })
            ],
            GameVersion.COLO => [pokeApiService.GetVersion(19)],
            GameVersion.XD => [pokeApiService.GetVersion(20)],
            GameVersion.DP => [.. GetPokeApiVersion(GameVersion.D), .. GetPokeApiVersion(GameVersion.P)],
            GameVersion.DPPt => [.. GetPokeApiVersion(GameVersion.DP), .. GetPokeApiVersion(GameVersion.Pt)],
            GameVersion.HGSS => [.. GetPokeApiVersion(GameVersion.HG), .. GetPokeApiVersion(GameVersion.SS)],
            GameVersion.BATREV => [
                Task.FromResult<PokeApi.Models.Version?>(new() {
                    Names = [
                        new() { Name1 = "Battle Revolution", Language = new() { Name = "en", Url = "https://pokeapi.co/api/v2/language/9/" } }
                    ]
                })
            ],
            GameVersion.BW => [.. GetPokeApiVersion(GameVersion.B), .. GetPokeApiVersion(GameVersion.W)],
            GameVersion.B2W2 => [.. GetPokeApiVersion(GameVersion.B2), .. GetPokeApiVersion(GameVersion.W2)],
            GameVersion.XY => [.. GetPokeApiVersion(GameVersion.X), .. GetPokeApiVersion(GameVersion.Y)],

            GameVersion.ORASDEMO => [.. GetPokeApiVersion(GameVersion.OR), .. GetPokeApiVersion(GameVersion.AS)],
            GameVersion.ORAS => [.. GetPokeApiVersion(GameVersion.OR), .. GetPokeApiVersion(GameVersion.AS)],
            GameVersion.SM => [.. GetPokeApiVersion(GameVersion.SN), .. GetPokeApiVersion(GameVersion.MN)],
            GameVersion.USUM => [.. GetPokeApiVersion(GameVersion.US), .. GetPokeApiVersion(GameVersion.UM)],
            GameVersion.GG => [.. GetPokeApiVersion(GameVersion.GP), .. GetPokeApiVersion(GameVersion.GE)],
            GameVersion.SWSH => [.. GetPokeApiVersion(GameVersion.SW), .. GetPokeApiVersion(GameVersion.SH)],
            GameVersion.BDSP => [.. GetPokeApiVersion(GameVersion.BD), .. GetPokeApiVersion(GameVersion.SP)],
            GameVersion.SV => [.. GetPokeApiVersion(GameVersion.SL), .. GetPokeApiVersion(GameVersion.VL)],

            GameVersion.Gen1 => [.. GetPokeApiVersion(GameVersion.RBY), .. GetPokeApiVersion(GameVersion.Stadium)],
            GameVersion.Gen2 => [.. GetPokeApiVersion(GameVersion.GSC), .. GetPokeApiVersion(GameVersion.Stadium2)],
            GameVersion.Gen3 => [.. GetPokeApiVersion(GameVersion.RSE), .. GetPokeApiVersion(GameVersion.FRLG), .. GetPokeApiVersion(GameVersion.CXD), .. GetPokeApiVersion(GameVersion.RSBOX)],
            GameVersion.Gen4 => [.. GetPokeApiVersion(GameVersion.DPPt), .. GetPokeApiVersion(GameVersion.HGSS), .. GetPokeApiVersion(GameVersion.BATREV)],
            GameVersion.Gen5 => [.. GetPokeApiVersion(GameVersion.BW), .. GetPokeApiVersion(GameVersion.B2W2)],
            GameVersion.Gen6 => [.. GetPokeApiVersion(GameVersion.XY), .. GetPokeApiVersion(GameVersion.ORAS)],
            GameVersion.Gen7 => [.. GetPokeApiVersion(GameVersion.SM), .. GetPokeApiVersion(GameVersion.USUM)],
            GameVersion.Gen7b => [.. GetPokeApiVersion(GameVersion.GG), .. GetPokeApiVersion(GameVersion.GO)],
            GameVersion.Gen8 => [.. GetPokeApiVersion(GameVersion.SWSH), .. GetPokeApiVersion(GameVersion.BDSP), .. GetPokeApiVersion(GameVersion.PLA)],
            GameVersion.Gen9 => [.. GetPokeApiVersion(GameVersion.SV), .. GetPokeApiVersion(GameVersion.ZA), .. GetPokeApiVersion(GameVersion.CP)],

            GameVersion.StadiumJ => [
                Task.FromResult<PokeApi.Models.Version?>(new() {
                    Names = [
                        new() { Name1 = "Stadium (J)", Language = new() { Name = "en", Url = "https://pokeapi.co/api/v2/language/9/" } }
                    ]
                })
            ],
            GameVersion.Stadium => [
                Task.FromResult<PokeApi.Models.Version?>(new() {
                    Names = [
                        new() { Name1 = "Stadium", Language = new() { Name = "en", Url = "https://pokeapi.co/api/v2/language/9/" } }
                    ]
                })
            ],
            GameVersion.Stadium2 => [
                Task.FromResult<PokeApi.Models.Version?>(new() {
                    Names = [
                        new() { Name1 = "Stadium 2", Language = new() { Name = "en", Url = "https://pokeapi.co/api/v2/language/9/" } }
                    ]
                })
            ],
            GameVersion.EFL => [.. GetPokeApiVersion(GameVersion.E), .. GetPokeApiVersion(GameVersion.FRLG)],
            #endregion
        };
    }

    protected override string GetFilenameWithoutExtension() => StaticOthersLoader.GetFilenameWithoutExtension(lang);
}