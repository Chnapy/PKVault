using PKHeX.Core;
using PokeApiNet;

public class StaticSpeciesData : Dictionary<ushort, StaticSpecies>;

public record StaticSpecies(
    ushort Id,
    byte Generation,
    PKHeX.Core.Gender[] Genders,
    // key is EntityContext
    Dictionary<byte, StaticSpeciesForm[]> Forms,
    Dictionary<string, int> PokedexIndexes
);

public record StaticSpeciesForm(
    int Id,
    string Name,
    string SpriteDefault,
    string? SpriteFemale,
    string SpriteShiny,
    string? SpriteShinyFemale,
    string? SpriteShadow,
    bool HasGenderDifferences,
    bool IsBattleOnly
);

public class GenStaticSpecies(
    string lang,
    PokeApiService pokeApiService, IFileIOService fileIOService
    ) : StaticDataGenerator<StaticSpeciesData>(
    jsonTypeInfo: StaticDataJsonContext.Default.StaticSpeciesData,
    jsonTypeInfoIndented: new StaticDataJsonContext(JsonIndentedOptions).StaticSpeciesData,
    fileIOService
)
{
    private static string GetFilename(string lang) => $"StaticSpecies_{lang}";
    public static async Task<StaticSpeciesData> LoadData(string lang)
    {
        var client = new AssemblyClient();

        var data = await client.GetAsyncJsonGz(
            [.. GetDataPathParts(GetFilename(lang))],
            StaticDataJsonContext.Default.StaticSpeciesData
        );
        ArgumentNullException.ThrowIfNull(data);

        return data;
    }

    protected override async Task<StaticSpeciesData> GetData()
    {
        var speciesNames = GameInfo.GetStrings(lang).Species;
        List<Task<StaticSpecies>> tasks = [];

        // List<string> notFound = [];

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

                StaticSpeciesForm getVarietyForm(byte generation, Pokemon pkmObj, PokemonForm[] formObjs, int formIndex, StaticSpeciesForm? defaultForm)
                {
                    var name = speciesName;

                    var formObj = formObjs.Length > 0
                        ? formObjs.First()
                        // rare cases when pokeapi form data is missing
                        // like with some ZA pkms
                        : new()
                        {
                            Id = pkmObj.Id,
                            Names = [new() {
                                Name = pkmObj.Name,
                                Language = new() { Name = SettingsService.DefaultLanguage }
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

                    var hasFemaleForm = formObjs.Any(f => f.Name.Contains("-female"));
                    var hasMaleForm = formObjs.Any(f => f.Name.Contains("-male"));
                    var hasAllGenderForms = hasFemaleForm && hasMaleForm;

                    var formName = formObj.FormName;// male/female/mega/alola etc

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

                    if (formName == "male" || formName == "female")
                    {
                        name = speciesName;
                    }

                    var frontDefaultUrl = formObj.Sprites.FrontDefault;
                    var frontShinyUrl = formObj.Sprites.FrontShiny;

                    if (formName != "mega")
                    {
                        frontDefaultUrl ??= pkmObj.Sprites.FrontDefault;
                        frontShinyUrl ??= pkmObj.Sprites.FrontShiny;
                    }

                    string? spriteFemale;
                    // = (maleOnly || !formObj.IsDefault || formObj.IsMega) ? null : (
                    //     pkmObj.Sprites.FrontFemale != null ? GetGHProxyUrl(pkmObj.Sprites.FrontFemale) : defaultForm?.SpriteFemale
                    // );
                    string? spriteShinyFemale;
                    // = (maleOnly || !formObj.IsDefault || formObj.IsMega) ? null : (
                    //     pkmObj.Sprites.FrontShinyFemale != null ? GetGHProxyUrl(pkmObj.Sprites.FrontShinyFemale) : defaultForm?.SpriteShinyFemale
                    // );
                    var spriteDefault = (
                        frontDefaultUrl != null ? GetPokeapiRelativePath(frontDefaultUrl) : null
                    );
                    var spriteShiny = (
                        frontShinyUrl != null ? GetPokeapiRelativePath(frontShinyUrl) : null
                    );

                    if (formName != "mega")
                    {
                        spriteDefault ??= defaultForm?.SpriteDefault;
                        spriteShiny ??= defaultForm?.SpriteShiny;
                    }

                    if (formName == "")
                    {
                        spriteFemale = pkmObj.Sprites.FrontFemale != null ? GetPokeapiRelativePath(pkmObj.Sprites.FrontFemale) : defaultForm?.SpriteFemale;
                        spriteShinyFemale = pkmObj.Sprites.FrontShinyFemale != null ? GetPokeapiRelativePath(pkmObj.Sprites.FrontShinyFemale) : defaultForm?.SpriteShinyFemale;
                    }
                    else
                    {
                        spriteFemale = pkmObj.Sprites.FrontFemale != null ? GetPokeapiRelativePath(pkmObj.Sprites.FrontFemale) : spriteDefault;
                        spriteShinyFemale = pkmObj.Sprites.FrontShinyFemale != null ? GetPokeapiRelativePath(pkmObj.Sprites.FrontShinyFemale) : spriteShiny;
                    }


                    if (spriteDefault == null && formName != "mega")
                    {
                        spriteDefault = frontDefaultUrl != null ? GetPokeapiRelativePath(frontDefaultUrl) : defaultForm?.SpriteDefault;
                    }
                    if (spriteShiny == null && formName != "mega")
                    {
                        spriteShiny = frontShinyUrl != null ? GetPokeapiRelativePath(frontShinyUrl) : defaultForm?.SpriteShiny;
                    }

                    var hasGenderDifferences = generation > 3
                        // && formObj.FormName == "" && pkmSpeciesObj.HasGenderDifferences;
                        && spriteDefault != spriteFemale && spriteFemale != null;

                    var pkm = new ImmutablePKM(EntityBlank.GetBlank(generation)).Update(pkm =>
                    {
                        pkm.Species = species;
                        pkm.Form = (byte)formIndex;
                        pkm.RefreshChecksum();
                    });

                    var legality = LegalityAnalysisService.GetLegalitySafeRaw(pkm);
                    var battleOnly = legality.Results.Any(result =>
                        result.Identifier == CheckIdentifier.Form
                        && result.Result == LegalityCheckResultCode.FormBattle
                        && !result.Valid
                    );

                    return new StaticSpeciesForm(
                        Id: formObj.Id,
                        Name: name,
                        SpriteDefault: spriteDefault ?? "",
                        SpriteFemale: spriteFemale,
                        SpriteShiny: spriteShiny ?? "",
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
                    [.. defaultData.Item2.Where(form => !form.IsBattleOnly)],
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
                        .Select((data) => getVarietyForm(context.Generation, data.Item1, data.Item2 == null ? [] : [data.Item2], data.Item3, defaultForm));

                    // if (!varietyForms.Any())
                    // {
                    //     Console.WriteLine($"FORMS EMTY FOR {species}-{defaultData.Item1.Name} // {context} // formListEn={string.Join(',', formListEn)} -> {string.Join(',', formListData
                    //     .OfType<(Pokemon, PokemonForm)>().ToList()
                    //     .Select(entry => $"form.{entry.Item2.Id}-{entry.Item2.Name}"))}");
                    // }

                    forms.Add((byte)context, [.. varietyForms]);
                });

                Dictionary<string, int> pokedexIndexes = pkmSpeciesObj.PokedexNumbers
                    .ToDictionary(
                        p => p.Pokedex.Name,
                        p => p.EntryNumber
                    );

                return new StaticSpecies(
                    Id: species,
                    // Name = speciesName,
                    Generation: generation,
                    Genders: genders,
                    Forms: forms,
                    PokedexIndexes: pokedexIndexes
                );
            }));
        }

        var dict = new StaticSpeciesData();
        foreach (var value in await Task.WhenAll(tasks))
        {
            dict.Add(value.Id, value);
        }

        return dict;
    }

    protected override string GetFilenameWithoutExtension() => GetFilename(lang);

    private string GetLugiaShadowSprite()
    {
        return $"custom-sprites/pokemon/shadow/{(ushort)Species.Lugia}.png";
    }
}