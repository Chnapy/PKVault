using PKHeX.Core;
using PokeApiNet;

public class StaticDataService(PokeApiService pokeApiService)
{
    public static readonly EntityContext LAST_ENTITY_CONTEXT = EntityContext.Gen9a;
    public static StaticDataDTO staticData { get; private set; }

    private readonly SpritesheetFileClient spritesheetFileClient = new();

    public async Task<StaticDataDTO> GetStaticData()
    {
        if (staticData == null)
        {
            var client = new AssemblyClient();

            staticData = (await client.GetAsyncJsonGz(
                GetStaticDataPathParts(SettingsService.BaseSettings.GetSafeLanguage()),
                StaticDataJsonContext.Default.StaticDataDTO
            ))!;
        }

        return staticData;
    }

    public async Task<Stream> GetSpritesheetStream(string sheetName)
    {
        return await spritesheetFileClient.GetAsyncString(sheetName);
    }

    public static List<string> GetGeneratedPathParts() => ["pokeapi", "generated"];

    public List<string> GetStaticDataPathParts(string lang) => [
        ..GetGeneratedPathParts(), "api-data", $"StaticData_{lang}.json.gz"
    ];

    public async Task<Dictionary<byte, StaticVersion>> GetStaticVersions(string lang)
    {
        var time = LogUtil.Time("static-data process versions");
        List<Task<StaticVersion>> tasks = [];
        var staticVersions = new Dictionary<int, StaticVersion>();

        foreach (var version in Enum.GetValues<GameVersion>())
        {
            tasks.Add(Task.Run(async () =>
            {
                var saveVersion = PkmVersionDTO.GetSingleVersion(version);
                var blankSave = saveVersion == default
                    ? null
                    : BlankSaveFile.Get(saveVersion);

                var versionName = GetVersionName(version, lang);
                var versionRegion = GetVersionRegionName(version, lang);

                return new StaticVersion(
                    Id: (byte)version,
                    Name: await versionName,
                    Generation: version.Generation,
                    Region: await versionRegion,
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
        time();
        return dict;
    }

    public async Task<Dictionary<ushort, StaticSpecies>> GetStaticSpecies(string lang)
    {
        var time = LogUtil.Time($"static-data {lang} process species");
        var speciesNames = GameInfo.GetStrings(lang).Species;
        List<Task<StaticSpecies>> tasks = [];

        // List<string> notFound = [];

        var hoennDex = await pokeApiService.GetPokedex(PokeApiPokedexEnum.HOENN);
        var hoennDexSpeciesSet = hoennDex!.PokemonEntries.Select(entry =>
        {
            var url = entry.PokemonSpecies.Url;
            return int.Parse(url.TrimEnd('/').Split('/')[^1]);
        }).ToHashSet();

        for (ushort i = 1; i < (ushort)Species.MAX_COUNT; i++)
        {
            var species = i;
            var speciesName = speciesNames[species];

            tasks.Add(Task.Run(async () =>
            {
                var pkmSpeciesObj = await pokeApiService.GetPokemonSpecies(species);
                var generation = PokeApiService.GetGenerationValue(pkmSpeciesObj.Generation.Name);

                PKHeX.Core.Gender[] genders = pkmSpeciesObj.GenderRate switch
                {
                    -1 => [PKHeX.Core.Gender.Genderless],
                    0 => [PKHeX.Core.Gender.Male],
                    8 => [PKHeX.Core.Gender.Female],
                    _ => [PKHeX.Core.Gender.Male, PKHeX.Core.Gender.Female],
                };

                var contexts = Enum.GetValues<EntityContext>().ToList().FindAll(context => context.IsValid);

                var forms = new Dictionary<byte, StaticSpeciesForm[]>();

                async Task<(Pokemon, PokemonForm[])> getVarietyFormsData(PokemonSpeciesVariety pkmVariety)
                {
                    var pkmObj = await pokeApiService.GetPokemon(pkmVariety.Pokemon);
                    var apiForms = await Task.WhenAll(pkmObj.Forms.Select((formUrl) => pokeApiService.GetPokemonForms(formUrl)));
                    // .ToList().FindAll(form => !form.IsBattleOnly).ToArray();

                    return (pkmObj, apiForms);
                }

                StaticSpeciesForm getVarietyForm(byte generation, Pokemon pkmObj, PokemonForm? formObj, int formIndex, StaticSpeciesForm? defaultForm)
                {
                    var name = speciesName;

                    // rare cases when pokeapi form data is missing
                    // like with some ZA pkms (starmie-mega for instance)
                    formObj ??= new()
                    {
                        Id = pkmObj.Id,
                        Names = [new() {
                            Name = pkmObj.Name,
                            Language = new() { Name = "en" }
                        }],
                        FormNames = [],
                        FormName = "",
                        Sprites = new()
                        {
                            BackDefault = pkmObj.Sprites.BackDefault,
                            BackShiny = pkmObj.Sprites.BackShiny,
                            FrontDefault = pkmObj.Sprites.FrontDefault,
                            FrontShiny = pkmObj.Sprites.FrontDefault,
                        }
                    };

                    try
                    {
                        if (formObj.Names.Count > 0)
                        {
                            name = PokeApiService.GetNameForLang(formObj.Names, lang);
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
                            var apiName = PokeApiService.GetNameForLang(formObj.FormNames, lang);
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
                        frontDefaultUrl != null ? GetPokeapiRelativePath(frontDefaultUrl) : defaultForm?.SpriteDefault
                    );
                    var spriteShiny = (
                        frontShinyUrl != null ? GetPokeapiRelativePath(frontShinyUrl) : defaultForm?.SpriteShiny
                    );

                    if (formObj.FormName == "")
                    {
                        spriteFemale = pkmObj.Sprites.FrontFemale != null ? GetPokeapiRelativePath(pkmObj.Sprites.FrontFemale) : defaultForm?.SpriteFemale;
                        spriteShinyFemale = pkmObj.Sprites.FrontShinyFemale != null ? GetPokeapiRelativePath(pkmObj.Sprites.FrontShinyFemale) : defaultForm?.SpriteShinyFemale;
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
                        spriteDefault = frontDefaultUrl != null ? GetPokeapiRelativePath(frontDefaultUrl) : defaultForm?.SpriteDefault;
                    }
                    if (spriteShiny == null)
                    {
                        spriteShiny = frontShinyUrl != null ? GetPokeapiRelativePath(frontShinyUrl) : defaultForm?.SpriteShiny;
                    }

                    var hasGenderDifferences = generation > 3 && formObj.FormName == "" && pkmSpeciesObj.HasGenderDifferences;

                    var pkm = new ImmutablePKM(EntityBlank.GetBlank(generation)).Update(pkm =>
                    {
                        pkm.Species = species;
                        pkm.Form = (byte)formIndex;
                        pkm.RefreshChecksum();
                    });

                    var legality = PkmLegalityDTO.GetLegalitySafe(pkm);
                    var battleOnly = legality.Results.Any(result =>
                        result.Identifier == CheckIdentifier.Form
                        && result.Result == LegalityCheckResultCode.FormBattle
                        && !result.Valid
                    );

                    return new StaticSpeciesForm(
                        Id: formObj.Id,
                        Name: name,
                        SpriteDefault: spriteDefault,
                        SpriteFemale: spriteFemale,
                        SpriteShiny: spriteShiny,
                        SpriteShinyFemale: spriteShinyFemale,
                        SpriteShadow: generation == 3 && species == (ushort)Species.Lugia
                            ? GetLugiaShadowSprite()
                            : null,
                        HasGenderDifferences: hasGenderDifferences,
                        IsBattleOnly: battleOnly
                    );
                }

                var defaultVariety = pkmSpeciesObj.Varieties.Find(variety => variety.IsDefault);
                var otherVarieties = pkmSpeciesObj.Varieties.FindAll(variety => !variety.IsDefault);

                var defaultDataTask = getVarietyFormsData(defaultVariety);
                var otherDatasTask = otherVarieties.Select(variety => getVarietyFormsData(variety));

                var defaultData = await defaultDataTask;
                var otherDatas = await Task.WhenAll(otherDatasTask);
                List<(Pokemon, PokemonForm[])> allDatas = [defaultData, .. otherDatas];

                var defaultForm = getVarietyForm(
                    LAST_ENTITY_CONTEXT.Generation,
                    defaultData.Item1,
                    defaultData.Item2.ToList().Find(form => !form.IsBattleOnly)!,
                    0,
                    null
                );

                var speciesNameEn = defaultData.Item1.Name;

                contexts.ForEach(context =>
                {
                    if (generation > context.Generation)
                    {
                        return;
                    }

                    var formListEn = species == (ushort)Species.Alcremie
                        ? FormConverter.GetAlcremieFormList(GameInfo.Strings.forms)
                        : FormConverter.GetFormList(species, GameInfo.Strings.Types, GameInfo.Strings.forms, GameInfo.GenderSymbolASCII, context);

                    if (formListEn.Length == 0)
                    {
                        formListEn = [""];
                    }

                    (Pokemon, PokemonForm?, int)?[] formListData = [.. formListEn.Select((formNameEn, formIndex) =>
                    {
                        var formApiName = PokeApiFileClient.PokeApiNameFromPKHexName(formNameEn);

                        (Pokemon, PokemonForm?, int)? searchFor (string name, bool intern) {
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
                                return (defaultData.Item1, defaultData.Item2[0], formIndex);
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
                                "medium" => searchFor("average", true),
                                "jumbo" => searchFor("super", true),
                                "mega" => searchFor($"{defaultData.Item1.Name}-{name}", true) ?? searchByPkmPredicate(pkm => pkm.Name.EndsWith($"-{name}"), true),
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
                                // if(defaultData.Item1.Name == "starmie") {
                                // Console.WriteLine(string.Join(',', allDatas.Select(d => string.Join('-', d.Item1.Name))));
                                // Console.WriteLine(string.Join(',', allDatas.Select(d => string.Join('-', d.Item2.Select(i => i.FormName)))));
                                // }
                                    // notFound.Add($"{defaultData.Item1.Name} // {context} // {formApiName} -> {string.Join(',', allDatas
                                    //     .Select(data => data.Item2.Select(form => form.FormName))
                                    //     .SelectMany(list => list).Distinct()
                                    // )}");
                            }

                            return result;
                        }

                        (Pokemon, PokemonForm?, int)? searchByPredicate(Func<PokemonForm, bool> predicate, bool intern) {
                            var data = allDatas.Find(data => data.Item2.Any(predicate));
                            (Pokemon, PokemonForm?, int)? result = data == default ? null : (
                                data.Item1,
                                data.Item2.ToList().Find(form => predicate(form))!,
                                formIndex
                            );

                            return result;
                        }

                        (Pokemon, PokemonForm?, int)? searchByPkmPredicate(Func<Pokemon, bool> predicate, bool intern) {
                            var data = allDatas.Find(data => predicate(data.Item1));
                            (Pokemon, PokemonForm?, int)? result = data == default ? null : (
                                data.Item1,
                                data.Item2.FirstOrDefault(),
                                formIndex
                            );

                            return result;
                        }

                        return searchFor(formApiName, false);
                    })];

                    var varietyForms = formListData.ToList()
                        .OfType<(Pokemon, PokemonForm?, int)>()
                        .Select((data) => getVarietyForm(context.Generation, data.Item1, data.Item2, data.Item3, defaultForm));

                    // if (!varietyForms.Any())
                    // {
                    //     Console.WriteLine($"FORMS EMTY FOR {species}-{defaultData.Item1.Name} // {context} // formListEn={string.Join(',', formListEn)} -> {string.Join(',', formListData
                    //     .OfType<(Pokemon, PokemonForm)>().ToList()
                    //     .Select(entry => $"form.{entry.Item2.Id}-{entry.Item2.Name}"))}");
                    // }

                    forms.Add((byte)context, [.. varietyForms]);
                });

                var isInHoennDex = hoennDexSpeciesSet.Contains(species);

                return new StaticSpecies(
                    Id: species,
                    // Name = speciesName,
                    Generation: generation,
                    Genders: genders,
                    Forms: forms,
                    IsInHoennDex: isInHoennDex
                );
            }));
        }

        var dict = new Dictionary<ushort, StaticSpecies>();
        foreach (var value in await Task.WhenAll(tasks))
        {
            dict.Add(value.Id, value);
        }
        time();
        // File.WriteAllText("toto.txt", string.Join('\n', notFound));
        return dict;
    }

    public async Task<Dictionary<int, StaticStat>> GetStaticStats(string lang)
    {
        var time = LogUtil.Time("static-data process stats");
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
        time();
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
        var time = LogUtil.Time($"static-data {lang} process moves");
        var moveNames = GameInfo.GetStrings(lang).Move;
        List<Task<StaticMove>> tasks = [];

        for (var i = 0; i < 919; i++)  // TODO
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

                var type = PokeApiService.GetIdFromUrl(moveObj.Type.Url);

                var category = GetMoveCategory(moveObj.DamageClass.Name);
                var oldCategory = category == MoveCategory.STATUS ? category : (
                    type < 10 ? MoveCategory.PHYSICAL : MoveCategory.SPECIAL
                );

                var tmpTypeUrl = moveObj.Type.Url;
                var tmpPowerUrl = moveObj.Power;

                List<StaticMoveGeneration> dataUntilGeneration = [.. await Task.WhenAll(
                    moveObj.PastValues
                        .Reverse<PastMoveStatValues>()
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

                if (oldCategory != category && !dataUntilGeneration.Any(data => data.UntilGeneration == 3))
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
        time();
        return dict;
    }

    public async Task<Dictionary<int, StaticNature>> GetStaticNatures(string lang)
    {
        var time = LogUtil.Time($"static-data {lang} process natures");
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
        time();
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

    public async Task<Dictionary<int, StaticItem>> GetStaticItems(string lang)
    {
        var time = LogUtil.Time($"static-data {lang} process items");
        var itemNames = GameInfo.GetStrings(lang).itemlist;
        List<Task<StaticItem>> tasks = [];

        // var notFound = new List<string>();
        // Console.WriteLine(string.Join('\n', GameInfo.Strings.itemlist.ToList().FindAll(item => item.ToLower().Contains("ball"))));

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
                var itemObj = await pokeApiService.GetItem(itemNamePokeapi);
                var sprite = itemObj?.Sprites.Default ?? "";

                // if (itemObj == null)
                // {
                //     Console.WriteLine($"Item not found: {itemId} - {itemNamePokeapi}");
                // }

                // if (itemNameEn.ToLower().Contains("belt"))
                // Console.WriteLine($"Error with item {itemId} - {itemNameEn} / {PokeApiFileClient.PokeApiNameFromPKHexName(itemNameEn)} / {itemName}");

                return new StaticItem(
                    Id: itemId,
                    Name: itemName,
                    Sprite: GetPokeapiRelativePath(sprite)
                );
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

    public async Task<Dictionary<ushort, StaticEvolve>> GetStaticEvolves()
    {
        var staticEvolves = new Dictionary<ushort, StaticEvolve>();

        void actChain(ChainLink chain)
        {
            var species = ushort.Parse(chain.Species.Url.TrimEnd('/').Split('/')[^1]);

            var speciesEvolve = new StaticEvolve(
                Species: species,
                Trade: [],
                TradeWithItem: [],
                Other: []
            );

            chain.EvolvesTo.ForEach(evolveTo =>
            {
                var evolveSpecies = ushort.Parse(evolveTo.Species.Url.TrimEnd('/').Split('/')[^1]);

                evolveTo.EvolutionDetails.ForEach(details =>
                {
                    foreach (var version in Enum.GetValues<GameVersion>())
                    {
                        var saveVersion = PkmVersionDTO.GetSingleVersion(version);
                        if (saveVersion == default)
                        {
                            continue;
                        }

                        var blankSave = new SaveWrapper(BlankSaveFile.Get(saveVersion), "");
                        var speciesAllowed = blankSave.IsSpeciesAllowed(evolveSpecies);
                        if (!speciesAllowed)
                        {
                            // Console.WriteLine($"EVOLVE TRADE NOT ALLOWED {species}->{evolveSpecies} v={version}");
                            continue;
                        }

                        if (species == (ushort)Species.Finizen && details.Trigger.Name == "other")
                        {
                            speciesEvolve.Trade.Add((byte)version, new(evolveSpecies, details.MinLevel ?? 1));
                            continue;
                        }

                        if (details.Trigger.Name != "trade")
                        {
                            if (!speciesEvolve.Other.TryGetValue((byte)version, out var otherValue))
                            {
                                otherValue = [];
                                speciesEvolve.Other.Add((byte)version, otherValue);
                            }
                            otherValue.Add(new(evolveSpecies, details.MinLevel ?? 1));
                            continue;
                        }

                        if (details.HeldItem == null)
                        {
                            speciesEvolve.Trade.Add((byte)version, new(evolveSpecies, details.MinLevel ?? 1));
                            // Console.WriteLine($"EVOLVE TRADE {species}->{evolveSpecies} v={version}");
                        }
                        else
                        {
                            if (!speciesEvolve.TradeWithItem.TryGetValue(details.HeldItem.Name, out var versionTradeDict))
                            {
                                versionTradeDict = [];
                                speciesEvolve.TradeWithItem.Add(details.HeldItem.Name, versionTradeDict);
                            }
                            versionTradeDict.Add((byte)version, new(evolveSpecies, details.MinLevel ?? 1));
                            // Console.WriteLine($"EVOLVE TRADE {species}->{evolveSpecies} item={details.HeldItem.Name} v={version}");
                        }
                    }
                });

                actChain(evolveTo);
            });

            staticEvolves.Add(species, speciesEvolve);
        }

        var evolutionChains = await pokeApiService.GetEvolutionChains();

        evolutionChains.ForEach(evolutionChain => actChain(evolutionChain.Chain));

        foreach (var staticEvolve in staticEvolves.Values)
        {
            var previousSpecies = staticEvolves.Values.ToList().Find(evolve =>
            {
                HashSet<ushort> evolveSpecies = [
                    ..evolve.Other.Values.SelectMany(val => val).Select(val => val.EvolveSpecies),
                    ..evolve.Trade.Values.Select(val => val.EvolveSpecies),
                    ..evolve.TradeWithItem.Values.SelectMany(val => val.Values).Select(val => val.EvolveSpecies),
                ];
                return evolveSpecies.Contains(staticEvolve.Species);
            })?.Species;

            staticEvolve.PreviousSpecies = previousSpecies;
        }

        // var heldItemPokeapiName = GetPokeapiItemName(heldItemName);

        return staticEvolves;
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

    public static string GetEggSprite()
    {
        return GetPokeapiRelativePath("https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/egg.png");
    }

    public string GetLugiaShadowSprite()
    {
        return $"custom-sprites/pokemon/shadow/{(ushort)Species.Lugia}.png";
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
            .OfType<PokeApiNet.Version>()
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
                .OfType<PokeApiNet.Version>()
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

    public static int GetBallPokeApiId(Ball ball) => ball switch
    {
        Ball.None => 0,
        Ball.Master => 1,
        Ball.Ultra => 2,
        Ball.Great => 3,
        Ball.Poke => 4,
        Ball.Safari => 5,
        Ball.Net => 6,
        Ball.Dive => 7,
        Ball.Nest => 8,
        Ball.Repeat => 9,
        Ball.Timer => 10,
        Ball.Luxury => 11,
        Ball.Premier => 12,
        Ball.Dusk => 13,
        Ball.Heal => 14,
        Ball.Quick => 15,
        Ball.Cherish => 16,
        Ball.Fast => 492,
        Ball.Level => 493,
        Ball.Lure => 494,
        Ball.Heavy => 495,
        Ball.Love => 496,
        Ball.Friend => 497,
        Ball.Moon => 498,
        Ball.Sport => 499,
        Ball.Dream => 576,
        Ball.Beast => 851,
        Ball.Strange => 1785,
        Ball.LAPoke => 1710,
        Ball.LAGreat => 1711,
        Ball.LAUltra => 1712,
        Ball.LAFeather => 1713,
        Ball.LAWing => 1746,
        Ball.LAJet => 1747,
        Ball.LAHeavy => 1748,
        Ball.LALeaden => 1749,
        Ball.LAGigaton => 1750,
        Ball.LAOrigin => 1771,
        _ => 0,
    };

    private Task<PokeApiNet.Version?>[] GetPokeApiVersion(GameVersion version)
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
                Task.FromResult<PokeApiNet.Version?>(new() {
                    Names = [
                        new() { Name = "Box Ruby & Sapphire", Language = new() { Name = "en", Url = "https://pokeapi.co/api/v2/language/9/" } },
                        new() { Name = "Box Rubis & Saphir", Language = new() { Name = "fr", Url = "https://pokeapi.co/api/v2/language/5/" } },
                    ]
                })
            ],
            GameVersion.COLO => [pokeApiService.GetVersion(19)],
            GameVersion.XD => [pokeApiService.GetVersion(20)],
            GameVersion.DP => [.. GetPokeApiVersion(GameVersion.D), .. GetPokeApiVersion(GameVersion.P)],
            GameVersion.DPPt => [.. GetPokeApiVersion(GameVersion.DP), .. GetPokeApiVersion(GameVersion.Pt)],
            GameVersion.HGSS => [.. GetPokeApiVersion(GameVersion.HG), .. GetPokeApiVersion(GameVersion.SS)],
            GameVersion.BATREV => [
                Task.FromResult<PokeApiNet.Version?>(new() {
                    Names = [
                        new() { Name = "Battle Revolution", Language = new() { Name = "en", Url = "https://pokeapi.co/api/v2/language/9/" } }
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
                Task.FromResult<PokeApiNet.Version?>(new() {
                    Names = [
                        new() { Name = "Stadium (J)", Language = new() { Name = "en", Url = "https://pokeapi.co/api/v2/language/9/" } }
                    ]
                })
            ],
            GameVersion.Stadium => [
                Task.FromResult<PokeApiNet.Version?>(new() {
                    Names = [
                        new() { Name = "Stadium", Language = new() { Name = "en", Url = "https://pokeapi.co/api/v2/language/9/" } }
                    ]
                })
            ],
            GameVersion.Stadium2 => [
                Task.FromResult<PokeApiNet.Version?>(new() {
                    Names = [
                        new() { Name = "Stadium 2", Language = new() { Name = "en", Url = "https://pokeapi.co/api/v2/language/9/" } }
                    ]
                })
            ],
            GameVersion.EFL => [.. GetPokeApiVersion(GameVersion.E), .. GetPokeApiVersion(GameVersion.FRLG)],
            #endregion
        };
    }

    private const string GH_PREFIX = "https://raw.githubusercontent.com/PokeAPI/sprites/master/";

    private static string GetPokeapiRelativePath(string url)
    {
        if (url.Length < GH_PREFIX.Length)
        {
            return "";
        }

        return url[GH_PREFIX.Length..];
    }
}
