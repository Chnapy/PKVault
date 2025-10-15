
using System.IO.Compression;
using System.Text;
using System.Text.Json;
using PKHeX.Core;
using PokeApiNet;

public class StaticDataService
{
    private static readonly string TmpDirectory = PrepareTmpDirectory();
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    private static string? GetTmpStaticDataPath()
    {
        if (SettingsService.AppSettings.SettingsMutable.LANGUAGE == null)
        {
            return null;
        }

        return Path.Combine(TmpDirectory, $"StaticData-{SettingsService.AppSettings.GetSafeLanguage()}.json.gz");
    }

    public static async Task<StaticDataDTO?> PrepareStaticData()
    {
        var tmpStaticDataPath = GetTmpStaticDataPath();
        if (tmpStaticDataPath == null)
        {
            return null;
        }

        if (File.Exists(tmpStaticDataPath))
        {
            try
            {
                using var fileStream = File.Open(tmpStaticDataPath, FileMode.Open);
                using var gzipStream = new GZipStream(fileStream, CompressionMode.Decompress);

                return JsonSerializer.Deserialize<StaticDataDTO>(gzipStream, JsonOptions)!;
            }
            // file is wrong
            catch (JsonException)
            {
                File.Delete(tmpStaticDataPath);
            }
            // file locked by previous request
            catch (IOException)
            {
                Thread.Sleep(100);
                return await PrepareStaticData();
            }
        }

        var time = LogUtil.Time("static-data process");

        var versions = GetStaticVersions();
        var species = GetStaticSpecies();
        var stats = GetStaticStats();
        var types = GetStaticTypes();
        var moves = GetStaticMoves();
        var natures = GetStaticNatures();
        var abilities = GetStaticAbilities();
        var items = GetStaticItems();

        var dto = new StaticDataDTO
        {
            Versions = await versions,
            Species = await species,
            Stats = await stats,
            Types = types,
            Moves = await moves,
            Natures = await natures,
            Abilities = abilities,
            Items = await items,
            EggSprite = GetEggSprite()
        };

        time();

        time = LogUtil.Time($"Write cached static-data in {tmpStaticDataPath}");

        var jsonContent = JsonSerializer.Serialize(dto, JsonOptions);
        using var originalFileStream = new MemoryStream(Encoding.UTF8.GetBytes(jsonContent));
        using var compressedFileStream = File.Create(tmpStaticDataPath);
        using var compressionStream = new GZipStream(compressedFileStream, CompressionLevel.Optimal);

        originalFileStream.CopyTo(compressionStream);

        time();

        return dto;
    }

    public static async Task<Dictionary<int, StaticVersion>> GetStaticVersions()
    {
        var time = LogUtil.Time("static-data process versions");
        List<Task<StaticVersion>> tasks = [];
        var staticVersions = new Dictionary<int, StaticVersion>();

        foreach (var version in Enum.GetValues<GameVersion>())
        {
            tasks.Add(Task.Run(async () =>
            {
                var blankSave = version.GetContext() == EntityContext.None
                ? null
                : BlankSaveFile.Get(version.GetContext());

                return new StaticVersion
                {
                    Id = version,
                    Name = await GetVersionName(version),
                    Generation = version.GetGeneration(),
                    MaxSpeciesId = blankSave?.MaxSpeciesID ?? 0,
                    MaxIV = blankSave?.MaxIV ?? 0,
                    MaxEV = blankSave?.MaxEV ?? 0,
                };
            }));
        }

        var dict = new Dictionary<int, StaticVersion>();
        foreach (var value in await Task.WhenAll(tasks))
        {
            dict.Add((int)value.Id, value);
        }
        time();
        return dict;
    }

    public static async Task<Dictionary<int, StaticSpecies>> GetStaticSpecies()
    {
        var time = LogUtil.Time("static-data process species");
        var speciesNames = GameInfo.GetStrings(SettingsService.AppSettings.GetSafeLanguage()).Species;
        List<Task<StaticSpecies>> tasks = [];

        // List<string> notFound = [];

        for (var i = 1; i <= 1025; i++)  // TODO
        {
            var species = i;
            var speciesName = speciesNames[species];

            tasks.Add(Task.Run(async () =>
            {
                var pkmSpeciesObj = await PokeApi.GetPokemonSpecies(species);
                var generation = PokeApi.GetGenerationValue(pkmSpeciesObj.Generation.Name);

                PKHeX.Core.Gender[] genders = pkmSpeciesObj.GenderRate switch
                {
                    -1 => [PKHeX.Core.Gender.Genderless],
                    0 => [PKHeX.Core.Gender.Male],
                    8 => [PKHeX.Core.Gender.Female],
                    _ => [PKHeX.Core.Gender.Male, PKHeX.Core.Gender.Female],
                };

                var contexts = Enum.GetValues<EntityContext>().ToList().FindAll(context => context.IsValid());

                var forms = new Dictionary<byte, StaticSpeciesForm[]>();

                async Task<(Pokemon, PokemonForm[])> getVarietyFormsData(PokemonSpeciesVariety pkmVariety)
                {
                    var pkmObj = await PokeApi.GetPokemon(pkmVariety.Pokemon);
                    var apiForms = await Task.WhenAll(pkmObj.Forms.Select((formUrl) => PokeApi.GetPokemonForms(formUrl)));
                    // .ToList().FindAll(form => !form.IsBattleOnly).ToArray();

                    return (pkmObj, apiForms);
                }

                StaticSpeciesForm getVarietyForm(Pokemon pkmObj, PokemonForm formObj, StaticSpeciesForm? defaultForm)
                {
                    var name = speciesName;

                    try
                    {
                        if (formObj.Names.Count > 0)
                        {
                            name = PokeApi.GetNameForCurrentLanguage(formObj.Names);
                        }
                    }
                    catch
                    {
                        // Console.WriteLine($"{formUrl.Url} - ERROR NAMES {ex}");
                    }

                    try
                    {
                        if (
                            name == speciesName
                            && formObj.FormNames.Count > 0)
                        {
                            var apiName = PokeApi.GetNameForCurrentLanguage(formObj.FormNames);
                            if (apiName != speciesName)
                            {
                                name = $"{speciesName} {apiName}";
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"{formObj.Name} - ERROR FORM-NAMES {ex}");
                    }

                    var femaleOnly = formObj.FormName.Contains("female");
                    var maleOnly = !femaleOnly && formObj.FormName.Contains("male");

                    var frontDefaultUrl = formObj.Sprites.FrontDefault ?? pkmObj.Sprites.FrontDefault;
                    var frontShinyUrl = formObj.Sprites.FrontShiny ?? pkmObj.Sprites.FrontShiny;

                    string? spriteFemale;
                    // = (maleOnly || !formObj.IsDefault || formObj.IsMega) ? null : (
                    //     pkmObj.Sprites.FrontFemale != null ? GetGHProxyUrl(pkmObj.Sprites.FrontFemale) : defaultForm?.SpriteFemale
                    // );
                    string? spriteShinyFemale;
                    // = (maleOnly || !formObj.IsDefault || formObj.IsMega) ? null : (
                    //     pkmObj.Sprites.FrontShinyFemale != null ? GetGHProxyUrl(pkmObj.Sprites.FrontShinyFemale) : defaultForm?.SpriteShinyFemale
                    // );
                    var spriteDefault = (
                        frontDefaultUrl != null ? GetGHProxyUrl(frontDefaultUrl) : defaultForm?.SpriteDefault
                    );
                    var spriteShiny = (
                        frontShinyUrl != null ? GetGHProxyUrl(frontShinyUrl) : defaultForm?.SpriteShiny
                    );

                    if (formObj.FormName == "")
                    {
                        spriteFemale = pkmObj.Sprites.FrontFemale != null ? GetGHProxyUrl(pkmObj.Sprites.FrontFemale) : defaultForm?.SpriteFemale;
                        spriteShinyFemale = pkmObj.Sprites.FrontShinyFemale != null ? GetGHProxyUrl(pkmObj.Sprites.FrontShinyFemale) : defaultForm?.SpriteShinyFemale;
                    }
                    else
                    {
                        spriteFemale = spriteDefault;
                        spriteShinyFemale = spriteShiny;
                    }

                    if (maleOnly)
                    {
                        spriteFemale = null;
                        spriteShinyFemale = null;
                    }
                    else if (femaleOnly)
                    {
                        spriteDefault = spriteFemale;
                        spriteShiny = spriteShinyFemale;
                    }

                    if (spriteDefault == null)
                    {
                        spriteDefault = frontDefaultUrl != null ? GetGHProxyUrl(frontDefaultUrl) : defaultForm?.SpriteDefault;
                    }
                    if (spriteShiny == null)
                    {
                        spriteShiny = frontShinyUrl != null ? GetGHProxyUrl(frontShinyUrl) : defaultForm?.SpriteShiny;
                    }

                    return new StaticSpeciesForm
                    {
                        Id = formObj.Id,
                        Name = name,
                        SpriteDefault = spriteDefault,
                        SpriteFemale = spriteFemale,
                        SpriteShiny = spriteShiny,
                        SpriteShinyFemale = spriteShinyFemale,
                        HasGenderDifferences = formObj.FormName == "" && pkmSpeciesObj.HasGenderDifferences,
                    };
                }

                var defaultVariety = pkmSpeciesObj.Varieties.Find(variety => variety.IsDefault);
                var otherVarieties = pkmSpeciesObj.Varieties.FindAll(variety => !variety.IsDefault);

                var defaultDataTask = getVarietyFormsData(defaultVariety);
                var otherDatasTask = otherVarieties.Select(variety => getVarietyFormsData(variety));

                var defaultData = await defaultDataTask;
                var otherDatas = (await Task.WhenAll(otherDatasTask))
                .ToList().FindAll(entry => entry.Item2.Length > 0);
                List<(Pokemon, PokemonForm[])> allDatas = [defaultData, .. otherDatas];

                var defaultForm = getVarietyForm(defaultData.Item1, defaultData.Item2[0], null);

                var speciesNameEn = defaultData.Item1.Name;

                contexts.ForEach(context =>
                {
                    if (generation > context.Generation())
                    {
                        return;
                    }

                    var formListEn = species == (int)Species.Alcremie
                        ? FormConverter.GetAlcremieFormList(GameInfo.Strings.forms)
                        : FormConverter.GetFormList((ushort)species, GameInfo.Strings.Types, GameInfo.Strings.forms, GameInfo.GenderSymbolASCII, context);

                    if (formListEn.Length == 0)
                    {
                        formListEn = [""];
                    }

                    (Pokemon, PokemonForm)?[] formListData = [.. formListEn.Select(formNameEn =>
                    {
                        var formApiName = PokeApiFileClient.PokeApiNameFromPKHexName(formNameEn);

                        (Pokemon, PokemonForm)? searchFor (string name, bool intern) {
                            if(speciesNameEn == "arceus" && name == "legend") {
                                return null;
                            }

                            if(speciesNameEn == "alcremie" && name.Contains('('))
                            {
                                return searchFor($"{name.Replace("(", "").Replace(")", "")}-sweet", true);
                            }

                            if(name.StartsWith("*")) {
                                return null;    // terra
                            }

                            if (speciesNameEn == "greninja" && name == "active") {
                                return searchFor("battle-bond", true);
                            }

                            if (speciesNameEn == "rockruff" && name == "dusk") {
                                return searchFor("own-tempo", true);
                            }

                            if (speciesNameEn == "kleavor" && name == "lord") {
                                return searchFor("", true);
                            }

                            if (name == "" || name == "normal")
                            {
                                return (defaultData.Item1, defaultData.Item2[0]);
                            }

                            var result = searchByPredicate(form => form.FormName == name, intern);

                            if (result != null || intern)
                            {
                                return result;
                            }

                            result = name switch
                            {
                                "!" => searchFor("exclamation", true),
                                "?" => searchFor("question", true),
                                "???" => searchFor("unknown", true),
                                "m" or "-m" => searchFor("male", true),
                                "f" or "-f" => searchFor("female", true),
                                "50%" => searchFor("50", true),
                                "50%-c" => searchFor("50-power-construct", true),
                                "10%" => searchFor("10", true),
                                "10%-c" => searchFor("10-power-construct", true),
                                "lord" or "lady" => searchFor("hisui", true),
                                "large" => searchByPredicate(form => form.FormName.StartsWith("totem"), true),
                                "*busted" => searchFor("totem-busted",true),
                                "water" => searchFor("douse",true),
                                "electric" => searchFor("shock",true),
                                "fire" => searchFor("burn",true),
                                "ice" => searchFor("chill",true),
                                "amped-form" => searchFor("amped",true),
                                "ice-face" => searchFor("ice",true),
                                "noice-face" => searchFor("noice",true),
                                "c-red" => searchFor("red", true),
                                "c-orange" => searchFor("orange", true),
                                "c-yellow" => searchFor("yellow", true),
                                "c-green" => searchFor("green", true),
                                "c-blue" => searchFor("blue", true),
                                "c-indigo" => searchFor("indigo", true),
                                "c-violet" => searchFor("violet", true),
                                "m-red" => searchFor("red-meteor", true),
                                "m-orange" => searchFor("orange-meteor", true),
                                "m-yellow" => searchFor("yellow-meteor", true),
                                "m-green" => searchFor("green-meteor", true),
                                "m-blue" => searchFor("blue-meteor", true),
                                "m-indigo" => searchFor("indigo-meteor", true),
                                "m-violet" => searchFor("violet-meteor", true),
                                "hero" => searchFor("", true),
                                "teal" => searchFor("", true),
                                _ => searchFor($"{name}-cap", true)
                                    ?? searchFor($"{name}-breed", true)
                                    ?? searchFor($"{name}-striped", true)
                                    ?? searchFor($"{name}-standard", true)
                                    ?? searchFor($"{name}-mask", true)
                                    ?? searchFor($"{name}-strawberry-sweet", true)
                                    ?? searchFor($"{name}-plumage", true)
                                    ?? searchFor($"{name}-build", true)
                                    ?? searchFor($"{name}-mode", true)
                                    ?? searchFor($"{name}-eared", true),
                            };

                            if (result == null)
                            {
                                Console.WriteLine($"FORM NOT FOUND for {defaultData.Item1.Name} // {context} // {formApiName} -> {string.Join(',', allDatas
                                    .Select(data => data.Item2.Select(form => form.FormName))
                                    .SelectMany(list => list).Distinct()
                                )}");
                                    // notFound.Add($"{defaultData.Item1.Name} // {context} // {formApiName} -> {string.Join(',', allDatas
                                    //     .Select(data => data.Item2.Select(form => form.FormName))
                                    //     .SelectMany(list => list).Distinct()
                                    // )}");
                            }

                            return result;
                        }

                        (Pokemon, PokemonForm)? searchByPredicate(Func<PokemonForm, bool> predicate, bool intern) {
                            var data = allDatas.Find(data => data.Item2.Any(predicate));
                            (Pokemon, PokemonForm)? result = data == default ? null : (
                                data.Item1,
                                data.Item2.ToList().Find(form => predicate(form))!
                            );

                            return result;
                        }

                        return searchFor(formApiName, false);
                    })];

                    var varietyForms = formListData.ToList()
                        .OfType<(Pokemon, PokemonForm)>().ToList()
                        .FindAll(entry => !entry.Item2.IsBattleOnly)
                        .Select((data) => getVarietyForm(data.Item1, data.Item2, defaultForm))
                        .Select((data) =>
                        {
                            if (context.Generation() < 4)
                            {
                                data.HasGenderDifferences = false;
                            }
                            return data;
                        });

                    // if (!varietyForms.Any())
                    // {
                    //     Console.WriteLine($"FORMS EMTY FOR {species}-{defaultData.Item1.Name} // {context} // formListEn={string.Join(',', formListEn)} -> {string.Join(',', formListData
                    //     .OfType<(Pokemon, PokemonForm)>().ToList()
                    //     .Select(entry => $"form.{entry.Item2.Id}-{entry.Item2.Name}"))}");
                    // }

                    forms.Add((byte)context, [.. varietyForms]);
                });

                return new StaticSpecies
                {
                    Id = species,
                    // Name = speciesName,
                    Generation = generation,
                    Genders = genders,
                    Forms = forms,
                };
            }));
        }

        var dict = new Dictionary<int, StaticSpecies>();
        foreach (var value in await Task.WhenAll(tasks))
        {
            dict.Add(value.Id, value);
        }
        time();
        // File.WriteAllText("toto.txt", string.Join('\n', notFound));
        return dict;
    }

    public static async Task<Dictionary<int, StaticStat>> GetStaticStats()
    {
        var time = LogUtil.Time("static-data process stats");
        List<Task<StaticStat>> tasks = [];

        for (var i = 1; i <= 6; i++)
        {
            var statIndex = i;
            tasks.Add(Task.Run(async () =>
            {
                var statObj = await PokeApi.GetStat(statIndex);

                return new StaticStat
                {
                    Id = statIndex,
                    Name = PokeApi.GetNameForCurrentLanguage(statObj.Names),
                };
            }));
        }

        var dict = new Dictionary<int, StaticStat>();
        foreach (var value in await Task.WhenAll(tasks))
        {
            dict.Add(value.Id, value);
        }
        time();
        return dict;
    }

    public static Dictionary<int, StaticType> GetStaticTypes()
    {
        var typeNames = GameInfo.GetStrings(SettingsService.AppSettings.GetSafeLanguage()).Types;
        var dict = new Dictionary<int, StaticType>();

        for (var i = 0; i < typeNames.Count; i++)
        {
            var typeName = typeNames[i];
            var typeId = i + 1;
            dict.Add(typeId, new()
            {
                Id = typeId,
                Name = typeName,
            });
        }

        return dict;
    }

    public static async Task<Dictionary<int, StaticMove>> GetStaticMoves()
    {
        var time = LogUtil.Time("static-data process moves");
        var moveNames = GameInfo.GetStrings(SettingsService.AppSettings.GetSafeLanguage()).Move;
        List<Task<StaticMove>> tasks = [];

        for (var i = 0; i < 919; i++)  // TODO
        {
            var moveId = i;
            var moveName = moveNames[moveId];
            tasks.Add(Task.Run(async () =>
            {
                if (moveId == 0)
                {
                    return new StaticMove()
                    {
                        Id = moveId,
                        Name = moveName,
                        DataUntilGeneration = [new()
                        {
                            UntilGeneration = 99,
                            Type = 1,   // normal
                            Category = MoveCategory.STATUS,
                            Power = null,
                        }],
                    };
                }

                var moveObj = await PokeApi.GetMove(moveId);

                var type = PokeApi.GetIdFromUrl(moveObj.Type.Url);

                var category = GetMoveCategory(moveObj.DamageClass.Name);
                var oldCategory = category == MoveCategory.STATUS ? category : (
                    type < 10 ? MoveCategory.PHYSICAL : MoveCategory.SPECIAL
                );

                var tmpTypeUrl = moveObj.Type.Url;
                var tmpPowerUrl = moveObj.Power;

                List<StaticMoveGeneration> dataUntilGeneration = [.. await Task.WhenAll(
                    moveObj.PastValues
                        .Reverse<PokeApiNet.PastMoveStatValues>()
                        .Select(async pastValue =>
                        {
                            var typeUrl = pastValue.Type?.Url ?? tmpTypeUrl;
                            var power = pastValue.Power ?? tmpPowerUrl;

                            tmpTypeUrl = typeUrl;
                            tmpPowerUrl = power;

                            var versionGroup = await PokeApi.GetVersionGroup(pastValue.VersionGroup);
                            var untilGeneration = PokeApi.GetGenerationValue(versionGroup.Generation.Name);

                            return new StaticMoveGeneration()
                            {
                                UntilGeneration = untilGeneration,
                                Type = PokeApi.GetIdFromUrl(typeUrl),
                                Category = untilGeneration <= 3 ? oldCategory : category,
                                Power = power,
                            };
                        })
                        .Reverse()
                )];

                dataUntilGeneration.Add(new()
                {
                    UntilGeneration = 99,
                    Type = PokeApi.GetIdFromUrl(moveObj.Type.Url),
                    Category = category,
                    Power = moveObj.Power,
                });

                if (oldCategory != category && !dataUntilGeneration.Any(data => data.UntilGeneration == 3))
                {
                    var dataPostG3 = dataUntilGeneration.Find(data => data.UntilGeneration > 3);
                    dataUntilGeneration.Add(new()
                    {
                        UntilGeneration = 3,
                        Type = dataPostG3.Type,
                        Category = oldCategory,
                        Power = dataPostG3.Power,
                    });
                }

                dataUntilGeneration.Sort((a, b) => a.UntilGeneration < b.UntilGeneration ? -1 : 1);

                return new StaticMove
                {
                    Id = moveId,
                    Name = moveName,
                    DataUntilGeneration = [.. dataUntilGeneration],
                };
            }));
        }

        var dict = new Dictionary<int, StaticMove>();
        foreach (var value in await Task.WhenAll(tasks))
        {
            dict.Add(value.Id, value);
        }
        time();
        return dict;
    }

    public static async Task<Dictionary<int, StaticNature>> GetStaticNatures()
    {
        var time = LogUtil.Time("static-data process natures");
        var naturesNames = GameInfo.GetStrings(SettingsService.AppSettings.GetSafeLanguage()).Natures;
        List<Task<StaticNature>> tasks = [];

        for (var i = 0; i < naturesNames.Count; i++)
        {
            var natureId = i;
            var natureName = naturesNames[natureId];
            tasks.Add(Task.Run(async () =>
            {
                var natureNameEn = GameInfo.Strings.natures[natureId];
                var natureObj = await PokeApi.GetNature(natureNameEn);

                return new StaticNature
                {
                    Id = natureId,
                    Name = natureName,
                    IncreasedStatIndex = natureObj.IncreasedStat != null
                        ? PokeApi.GetIdFromUrl(natureObj.IncreasedStat.Url)
                        : null,
                    DecreasedStatIndex = natureObj.DecreasedStat != null
                        ? PokeApi.GetIdFromUrl(natureObj.DecreasedStat.Url)
                        : null,
                };
            }));
        }

        var dict = new Dictionary<int, StaticNature>();
        foreach (var value in await Task.WhenAll(tasks))
        {
            dict.Add(value.Id, value);
        }
        time();
        return dict;
    }

    public static Dictionary<int, StaticAbility> GetStaticAbilities()
    {
        var abilitiesNames = GameInfo.GetStrings(SettingsService.AppSettings.GetSafeLanguage()).abilitylist;
        var dict = new Dictionary<int, StaticAbility>();

        for (var i = 0; i < abilitiesNames.Length; i++)
        {
            var abilityId = i;
            var abilityName = abilitiesNames[abilityId];
            dict.Add(abilityId, new StaticAbility
            {
                Id = abilityId,
                Name = abilityName,
            });
        }

        return dict;
    }

    public static async Task<Dictionary<int, StaticItem>> GetStaticItems()
    {
        var time = LogUtil.Time("static-data process items");
        var itemNames = GameInfo.GetStrings(SettingsService.AppSettings.GetSafeLanguage()).itemlist;
        List<Task<StaticItem>> tasks = [];

        // var notFound = new List<string>();

        for (var i = 0; i < itemNames.Length; i++)
        {
            var itemId = i;
            var itemName = itemNames[itemId];
            var itemNamePokeapi = GetPokeapiItemName(
                GameInfo.Strings.itemlist[itemId]
            );

            if (itemNamePokeapi.Trim().Length == 0 || itemNamePokeapi == "???")
            {
                continue;
            }

            tasks.Add(Task.Run(async () =>
            {
                var itemObj = await PokeApi.GetItem(itemNamePokeapi);
                var sprite = itemObj?.Sprites.Default ?? "";

                // if (itemObj == null)
                // {
                //     notFound.Add($"{itemId}\t{itemNamePokeapi}");
                // }

                // if (itemNameEn.ToLower().Contains("belt"))
                // Console.WriteLine($"Error with item {itemId} - {itemNameEn} / {PokeApiFileClient.PokeApiNameFromPKHexName(itemNameEn)} / {itemName}");

                return new StaticItem
                {
                    Id = itemId,
                    Name = itemName,
                    Sprite = GetGHProxyUrl(sprite),
                };
            }));
        }

        var dict = new Dictionary<int, StaticItem>();
        foreach (var value in await Task.WhenAll(tasks))
        {
            dict.Add(value.Id, value);
        }
        time();

        // File.WriteAllText("./item-not-found.md", string.Join('\n', notFound));
        return dict;
    }

    public static string GetEggSprite()
    {
        return GetGHProxyUrl("https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/egg.png");
    }

    public static string GetPokeapiItemName(string pkhexItemName)
    {
        var pokeapiName = PokeApiFileClient.PokeApiNameFromPKHexName(pkhexItemName);

        return pokeapiName switch
        {
            "leek" => "stick",
            "upgrade" => "up-grade",
            var _ when pokeapiName.EndsWith("-feather") => $"{pokeapiName[..^8]}-wing",
            var _ when pokeapiName.EndsWith("ium-z") => $"{pokeapiName}--held",
            var _ when pokeapiName.EndsWith("ium-z-[z]") => $"{pokeapiName[..^4]}--bag",
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

    private static async Task<string> GetVersionName(GameVersion version)
    {
        var pokeapiVersions = await Task.WhenAll(GetPokeApiVersion(version));

        return string.Join('/', pokeapiVersions.Select(ver =>
        {
            return PokeApi.GetNameForCurrentLanguage(ver.Names);
        }).Distinct());
    }

    private static Task<PokeApiNet.Version>[] GetPokeApiVersion(GameVersion version)
    {
        return version switch
        {
            GameVersion.Any => [],
            GameVersion.Invalid => [],

            #region Gen3
            GameVersion.S => [PokeApi.GetVersion(8)],
            GameVersion.R => [PokeApi.GetVersion(7)],
            GameVersion.E => [PokeApi.GetVersion(9)],
            GameVersion.FR => [PokeApi.GetVersion(10)],
            GameVersion.LG => [PokeApi.GetVersion(11)],
            GameVersion.CXD => [PokeApi.GetVersion(19), PokeApi.GetVersion(20)],
            #endregion

            #region Gen4
            GameVersion.D => [PokeApi.GetVersion(12)],
            GameVersion.P => [PokeApi.GetVersion(13)],
            GameVersion.Pt => [PokeApi.GetVersion(14)],
            GameVersion.HG => [PokeApi.GetVersion(15)],
            GameVersion.SS => [PokeApi.GetVersion(16)],
            #endregion

            #region Gen5
            GameVersion.W => [PokeApi.GetVersion(18)],
            GameVersion.B => [PokeApi.GetVersion(17)],
            GameVersion.W2 => [PokeApi.GetVersion(22)],
            GameVersion.B2 => [PokeApi.GetVersion(21)],
            #endregion

            #region Gen6
            GameVersion.X => [PokeApi.GetVersion(23)],
            GameVersion.Y => [PokeApi.GetVersion(24)],
            GameVersion.AS => [PokeApi.GetVersion(26)],
            GameVersion.OR => [PokeApi.GetVersion(25)],
            #endregion

            #region Gen7
            GameVersion.SN => [PokeApi.GetVersion(27)],
            GameVersion.MN => [PokeApi.GetVersion(28)],
            GameVersion.US => [PokeApi.GetVersion(29)],
            GameVersion.UM => [PokeApi.GetVersion(30)],
            #endregion
            GameVersion.GO => [],

            #region Virtual Console (3DS) Gen1
            GameVersion.RD => [PokeApi.GetVersion(1)],
            GameVersion.GN => [PokeApi.GetVersion(2)],
            GameVersion.BU => [PokeApi.GetVersion(46)],
            GameVersion.YW => [PokeApi.GetVersion(3)],
            #endregion

            #region Virtual Console (3DS) Gen2
            GameVersion.GD => [PokeApi.GetVersion(4)],
            GameVersion.SI => [PokeApi.GetVersion(5)],
            GameVersion.C => [PokeApi.GetVersion(6)],
            #endregion

            #region Nintendo Switch
            GameVersion.GP => [PokeApi.GetVersion(31)],
            GameVersion.GE => [PokeApi.GetVersion(32)],
            GameVersion.SW => [PokeApi.GetVersion(33)],
            GameVersion.SH => [PokeApi.GetVersion(34)],
            GameVersion.PLA => [PokeApi.GetVersion(39)],
            GameVersion.BD => [PokeApi.GetVersion(37)],
            GameVersion.SP => [PokeApi.GetVersion(38)],
            GameVersion.SL => [PokeApi.GetVersion(40)],
            GameVersion.VL => [PokeApi.GetVersion(41)],
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
            GameVersion.RSBOX => [],
            GameVersion.COLO => [PokeApi.GetVersion(19)],
            GameVersion.XD => [PokeApi.GetVersion(20)],
            GameVersion.DP => [.. GetPokeApiVersion(GameVersion.D), .. GetPokeApiVersion(GameVersion.P)],
            GameVersion.DPPt => [.. GetPokeApiVersion(GameVersion.DP), .. GetPokeApiVersion(GameVersion.Pt)],
            GameVersion.HGSS => [.. GetPokeApiVersion(GameVersion.HG), .. GetPokeApiVersion(GameVersion.SS)],
            GameVersion.BATREV => [],
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

            GameVersion.StadiumJ => [],
            GameVersion.Stadium => [],
            GameVersion.Stadium2 => [],
            GameVersion.EFL => [.. GetPokeApiVersion(GameVersion.E), .. GetPokeApiVersion(GameVersion.FRLG)],
            #endregion
        };
    }

    private const string GH_PREFIX = "https://raw.githubusercontent.com/";

    private static string GetGHProxyUrl(string url)
    {
        var path = GetGHPath(url);
        if (path == "")
        {
            return "";
        }

        return $"/api/static-data/gh-proxy/{path}";
    }

    private static string GetGHPath(string url)
    {
        if (url.Length < GH_PREFIX.Length)
        {
            return "";
        }

        return url[GH_PREFIX.Length..];
    }

    public static string GetGHUrl(string path)
    {
        return $"{GH_PREFIX}{path}";
    }

    private static string PrepareTmpDirectory()
    {
        var tmpRootFolder = Path.Combine(Path.GetTempPath(), "pkvault");
        var tmpFolder = Path.Combine(tmpRootFolder, SettingsService.AppSettings.BuildID.ToString());

        if (!Directory.Exists(tmpFolder))
        {
            Directory.CreateDirectory(tmpFolder);
        }

        return tmpFolder;
    }
}
