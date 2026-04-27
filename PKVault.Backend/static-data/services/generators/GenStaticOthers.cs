using PKHeX.Core;

public record StaticVersion(
    byte Id,
    string Name,
    EntityContext Context,
    bool IsGameVersion,
    byte Generation,
    string[] Region,
    string[] Pokedexes,
    int MaxSpeciesId,
    int MaxIV,
    int MaxEV
);

public record StaticStat(
    int Id,
    string Name
);

public record StaticType(
    int Id,
    string Name
);

public record StaticMove(
    int Id,
    string Name,
    StaticMoveGeneration[] DataUntilGeneration
);

public record StaticMoveGeneration(
    byte UntilGeneration,
    int Type,
    MoveCategory Category,
    int? Power
);

public record StaticNature(
    int Id,
    string Name,
    int? IncreasedStatIndex,
    int? DecreasedStatIndex
);

public record StaticAbility(
    int Id,
    string Name
);

public record StaticItem(
    string Id,
    string Name,
    string Sprite
);

public record StaticVersionsItems(
    List<byte> Versions,
    // item value => item key
    Dictionary<int, string> ComboItems
);

public record StaticItemsData(
    List<StaticVersionsItems> VersionItems,
    Dictionary<string, StaticItem> Items
);

public record StaticGeneration(
    int Id,
    string[] Regions
);

public record StaticPokedex(
    string Key,
    string Name,
    byte Order,
    Dictionary<ushort, int> PokemonIndexes
);

public record StaticRibbon(
    string Key,
    string SpriteKey,
    string Name
);

public enum MoveCategory
{
    PHYSICAL,
    SPECIAL,
    STATUS
}

public record StaticOthersData(
    Dictionary<byte, StaticVersion> Versions,
    Dictionary<int, StaticStat> Stats,
    Dictionary<int, StaticType> Types,
    Dictionary<int, StaticMove> Moves,
    Dictionary<int, StaticNature> Natures,
    Dictionary<int, StaticAbility> Abilities,
    StaticItemsData Items,
    Dictionary<byte, StaticGeneration> Generations,
    Dictionary<string, StaticPokedex> Pokedexes,
    Dictionary<string, StaticRibbon> Ribbons,
    Dictionary<byte, string> Languages,
    string EggSprite
);

public class GenStaticOthers(
    ILogger log,
    string lang,
    PokeApiService pokeApiService, IFileIOService fileIOService
    ) : StaticDataGenerator<StaticOthersData>(
    log,
    jsonTypeInfo: StaticDataJsonContext.Default.StaticOthersData,
    jsonTypeInfoIndented: new StaticDataJsonContext(JsonIndentedOptions).StaticOthersData,
    fileIOService
)
{
    private static string GetFilename(string lang) => $"StaticOthers_{lang}";
    public static async Task<StaticOthersData> LoadData(string lang)
    {
        var client = new AssemblyClient();

        var data = await client.GetAsyncJsonGz(
            [.. GetDataPathParts(GetFilename(lang))],
            StaticDataJsonContext.Default.StaticOthersData
        );
        ArgumentNullException.ThrowIfNull(data);

        return data;
    }

    protected override async Task<StaticOthersData> GetData()
    {
        var versions = GetStaticVersions(lang);
        var stats = GetStaticStats(lang);
        var types = GetStaticTypes(lang);
        var moves = GetStaticMoves(lang);
        var natures = GetStaticNatures(lang);
        var abilities = GetStaticAbilities(lang);
        var items = GetStaticItems(lang);
        var generations = GetStaticGenerations(lang);
        var pokedexes = GetStaticPokedexes(lang);

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
            Ribbons: GetStaticRibbons(lang),
            Languages: GetStaticLanguages(lang),
            EggSprite: GetEggSprite()
        );
    }

    public async Task<Dictionary<byte, StaticVersion>> GetStaticVersions(string lang)
    {
        using var _ = log.Time("static-data process versions");
        List<Task<StaticVersion>> tasks = [];
        var staticVersions = new Dictionary<int, StaticVersion>();

        foreach (var version in Enum.GetValues<GameVersion>())
        {
            tasks.Add(Task.Run(async () =>
            {
                var saveVersion = GetSingleVersion(version);
                var blankSave = saveVersion == default
                    ? null
                    : BlankSaveFile.Get(saveVersion);

                var versionName = GetVersionName(version, lang);
                var versionRegion = GetVersionRegionName(version, lang);
                var versionPokedexes = GetVersionPokedexes(version);

                return new StaticVersion(
                    Id: (byte)version,
                    Name: await versionName,
                    Context: version.Context,
                    IsGameVersion: version.IsValidSavedVersion(),
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

    public async Task<Dictionary<int, StaticStat>> GetStaticStats(string lang)
    {
        using var _ = log.Time("static-data process stats");
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

    public Dictionary<int, StaticType> GetStaticTypes(string lang)
    {
        var typeNames = GameInfo.GetStrings(lang).Types;
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

    public async Task<Dictionary<int, StaticMove>> GetStaticMoves(string lang)
    {
        using var _ = log.Time($"static-data {lang} process moves");
        var moveNames = GameInfo.GetStrings(lang).Move;
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
                            Power: null
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
                            Power: null
                        )]
                    );
                }

                var generation = PokeApiService.GetGenerationValue(moveObj.Generation.Name);

                var type = PokeApiService.GetIdFromUrl(moveObj.Type.Url);

                var category = GetMoveCategory(moveObj.DamageClass.Name);
                var oldCategory = ImmutablePKM.GetMoveCategoryG123(type, category);

                var tmpTypeUrl = moveObj.Type.Url;
                var tmpPowerUrl = moveObj.Power;

                List<StaticMoveGeneration> dataUntilGeneration = [.. await Task.WhenAll(
                    moveObj.PastValues
                        .Reverse()
                        .Select(async pastValue =>
                        {
                            var typeUrl = pastValue.Type?.Url ?? tmpTypeUrl;
                            var power = pastValue.Power ?? tmpPowerUrl;

                            tmpTypeUrl = typeUrl;
                            tmpPowerUrl = power;

                            var versionGroup = await pokeApiService.GetVersionGroup(pastValue.VersionGroup);
                            byte untilGeneration = (byte) (PokeApiService.GetGenerationValue(versionGroup.Generation.Name) - 1);

                            return new StaticMoveGeneration(
                                UntilGeneration: untilGeneration,
                                Type: PokeApiService.GetIdFromUrl(typeUrl),
                                Category: untilGeneration <= 3 ? oldCategory : category,
                                Power: power
                            );
                        })
                        .Reverse()
                )];

                dataUntilGeneration.Add(new(
                    UntilGeneration: 99,
                    Type: PokeApiService.GetIdFromUrl(moveObj.Type.Url),
                    Category: category,
                    Power: moveObj.Power
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
                        Power: dataPostG3.Power
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

    public async Task<Dictionary<int, StaticNature>> GetStaticNatures(string lang)
    {
        using var _ = log.Time($"static-data {lang} process natures");
        var naturesNames = GameInfo.GetStrings(lang).Natures;
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

    public Dictionary<int, StaticAbility> GetStaticAbilities(string lang)
    {
        var abilitiesNames = GameInfo.GetStrings(lang).abilitylist;
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

    public async Task<StaticItemsData> GetStaticItems(string lang)
    {
        using var _ = log.Time($"static-data {lang} process items");

        List<StaticVersionsItems> VersionItems = [];
        Dictionary<string, StaticItem> Items = [];

        // var notFound = new List<string>();
        // log.LogInformation(string.Join('\n', GameInfo.Strings.itemlist.ToList().FindAll(item => item.ToLower().Contains("ball"))));

        List<ComboItem> getItemStrings(GameVersion _version, GameStrings strings)
        {
            var version = GetSingleVersion(_version);
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
                    if (comboItems.TryGetValue(item.Value, out var text))
                    {
                        if (text == item.Text)
                        {
                            continue;
                        }

                        throw new Exception($"Key exists, key={item.Value} existingText={text} tryText={item.Text}");
                    }
                    comboItems.Add(item.Value, item.Text);
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
            var items = getItemStrings(version, GameInfo.GetStrings(lang));

            for (var i = 0; i < items.Count; i++)
            {
                var item = items[i];

                var itemEn = itemsEn.First(it => it.Value == item.Value);
                if (Items.ContainsKey(itemEn.Text))
                {
                    continue;
                }

                var itemNamePokeapi = GetPokeapiItemName(itemEn.Text);
                if (itemNamePokeapi.Trim().Length == 0 || itemNamePokeapi == "???")
                {
                    continue;
                }

                var itemObj = await pokeApiService.GetItem(itemNamePokeapi);
                var sprite = itemObj?.Sprites.Default ?? "";

                // if (itemObj == null)
                // {
                //     log.LogInformation($"Item not found: {itemId} - {itemNamePokeapi}");
                // }

                // if (itemNameEn.ToLower().Contains("belt"))
                // log.LogInformation($"Error with item {itemId} - {itemNameEn} / {PokeApiFileClient.PokeApiNameFromPKHexName(itemNameEn)} / {itemName}");

                Items[itemEn.Text] = new StaticItem(
                    Id: itemEn.Text,
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

    public async Task<Dictionary<byte, StaticGeneration>> GetStaticGenerations(string lang)
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

    public async Task<Dictionary<string, StaticPokedex>> GetStaticPokedexes(string lang)
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

    public Dictionary<string, StaticRibbon> GetStaticRibbons(string lang)
    {
        var ribbonsTxt = GameInfo.GetStrings(lang).Ribbons;

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

    public Dictionary<byte, string> GetStaticLanguages(string lang)
    {
        var languageNames = GameInfo.GetStrings(lang).languageNames;

        return Enum.GetValues<LanguageID>()
            .Select((languageId, i) => ((byte)languageId, languageNames[i]))
            .ToDictionary();
    }

    public static string GetEggSprite()
    {
        return GetPokeapiRelativePath("https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/egg.png");
    }

    public static string GetPokeapiItemName(string pkhexItemName)
    {
        var pokeapiName = PokeApiFileClient.PokeApiNameFromPKHexName(pkhexItemName);

        /**
         * Missing ZA items from pokeapi (may be auto-added later):
         * - 1592 galarica-wreath -> 1643 no-sprite
         * - 1582 galarica-cuff -> 1633 no-sprite
         * - 2570 excadrite
         * - 2560 victreebelite
         * - 2564 feraligite
         * - 2584 zygardite
         * - 2579 floettite
         * - 2569 emboarite
         *
         * Missing Stadium items from pokeapi:
         * - 128 gorgeous-box
         */
        return pokeapiName switch
        {
            "leek" => "stick",
            "upgrade" => "up-grade",
            "strange-ball" => "lastrange-ball",
            "feather-ball" => "lafeather-ball",
            "wing-ball" => "lawing-ball",
            "jet-ball" => "lajet-ball",
            "leaden-ball" => "laleaden-ball",
            "gigaton-ball" => "lagigaton-ball",
            "origin-ball" => "laorigin-ball",
            var _ when pokeapiName.EndsWith("-feather") => $"{pokeapiName[..^8]}-wing",
            var _ when pokeapiName.EndsWith("ium-z") => $"{pokeapiName}--held",
            var _ when pokeapiName.EndsWith("ium-z-[z]") => $"{pokeapiName[..^4]}--bag",
            var _ when pokeapiName.EndsWith("-(la)") => $"la{pokeapiName[..^5]}",
            _ => pokeapiName
        };
    }

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

    private async Task<string> GetVersionName(GameVersion version, string lang)
    {
        var pokeapiVersions = await Task.WhenAll(GetPokeApiVersion(version));

        return string.Join('/', pokeapiVersions
            .OfType<PokeApi.Models.Version>()
            .Select(ver =>
            {
                return PokeApiService.GetNameForLang(ver.Names, lang);
            }).Distinct());
    }

    private async Task<string[]> GetVersionRegionName(GameVersion version, string lang)
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
            GameVersion.GN => [pokeApiService.GetVersion(2)],
            GameVersion.BU => [pokeApiService.GetVersion(46)],
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
            GameVersion.RBY => [.. GetPokeApiVersion(GameVersion.RB), .. GetPokeApiVersion(GameVersion.YW)],
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

            GameVersion.Gen1 => [.. GetPokeApiVersion(GameVersion.RBY)],
            GameVersion.Gen2 => [.. GetPokeApiVersion(GameVersion.GSC)],
            GameVersion.Gen3 => [.. GetPokeApiVersion(GameVersion.RSE), .. GetPokeApiVersion(GameVersion.FRLG)],
            GameVersion.Gen4 => [.. GetPokeApiVersion(GameVersion.DPPt), .. GetPokeApiVersion(GameVersion.HGSS)],
            GameVersion.Gen5 => [.. GetPokeApiVersion(GameVersion.BW), .. GetPokeApiVersion(GameVersion.B2W2)],
            GameVersion.Gen6 => [.. GetPokeApiVersion(GameVersion.XY), .. GetPokeApiVersion(GameVersion.ORAS)],
            GameVersion.Gen7 => [.. GetPokeApiVersion(GameVersion.SM), .. GetPokeApiVersion(GameVersion.USUM)],
            GameVersion.Gen7b => [.. GetPokeApiVersion(GameVersion.GG), .. GetPokeApiVersion(GameVersion.GO)],
            GameVersion.Gen8 => [.. GetPokeApiVersion(GameVersion.SWSH), .. GetPokeApiVersion(GameVersion.BDSP), .. GetPokeApiVersion(GameVersion.PLA)],
            GameVersion.Gen9 => [.. GetPokeApiVersion(GameVersion.SV)],

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

    /**
     * Get a valid single version from any version, including groups.
     */
    public static GameVersion GetSingleVersion(GameVersion version)
    {
        HashSet<GameVersion> ignoredVersions = [
            default,
            GameVersion.Any,
            GameVersion.Invalid,
            GameVersion.GO,
            GameVersion.CP,
        ];

        if (ignoredVersions.Contains(version))
        {
            var context = version.Context;

            try
            {
                return context.GetSingleGameVersion();
            }
            catch
            {
                return default;
            }
        }

        return version.IsValidSavedVersion()
            ? version
            : GameUtil.GameVersions.ToList().Find(v => !ignoredVersions.Contains(v) && version.ContainsFromLumped(v));
    }

    protected override string GetFilenameWithoutExtension() => GetFilename(lang);
}