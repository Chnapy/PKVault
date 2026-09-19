using System.Collections.Concurrent;
using System.Text.Json;
using System.Text.Json.Serialization.Metadata;
using Microsoft.Extensions.DependencyInjection;
using NJsonSchema;
using NJsonSchema.CodeGeneration.TypeScript;
using PKHeX.Core;
using PKVault.Core;
using Serilog;

public partial class GenerateConvertView
{
    public record FrontendTypes(
        StaticSpritesheetsData StaticSpritesheetsData,
        StaticSpeciesData StaticSpeciesData,
        StaticOthersData StaticOthersData,
        IndexJSON IndexJSON,
        ConvertFormJSON ConvertFormJSON
    );

    public record VersionSaveEntry(GameVersion Version, SaveWrapper Save, ImmutablePKM[] Pkms);

    private static readonly GameVersionUtil.VersionChecker VersionChecker = new();

    private static string BasePath
    {
        get
        {
#if DEBUG
            return ".";
#else
            return AppDomain.CurrentDomain.BaseDirectory;
#endif
        }
    }

    private static readonly HashSet<string> PkmVariantPropertiesToUse = [
        // "IsMain",
        // "IsExternal",
        // "AttachedSaveId",
        // "AttachedSavePkmIdBase",
        // "IsFilePresent",
        // "Filepath",
        // "FilepathAbsolute",
        // "VersionChecker",
        // "CanMoveAttachedToSave",
        // "CanDelete",
        // "CanMoveToSave",
        // "CanEdit",
        // "CanEvolve",
        // "CanCreateVariant",
        // "CompatibleWithVersions",
        // "Id",
        "Generation",
        // "BoxId",
        // "BoxSlot",
        // "IsDuplicate",
        // "SettingsLanguage",
        // "Pkm",
        // "Evolves",
        "IdBase",
        // "BoxKey",
        "Version",
        "ContextVersion",
        "Context",
        "PID",
        "IsNicknamed",
        "Nickname",
        "Species",
        "Form",
        "IsEgg",
        "IsShiny",
        "IsAlpha",
        "IsNoble",
        "NSparkle",
        "CanGigantamax",
        "Ball",
        "Gender",
        "Types",
        "TeraType",
        "Level",
        "Exp",
        "ExpToLevelUp",
        "LevelUpPercent",
        "Friendship",
        // "EggHatchCount",
        "IVs",
        "EVs",
        "Stats",
        "BaseStats",
        "HiddenPowerType",
        "HiddenPowerPower",
        "HiddenPowerCategory",
        "Nature",
        "Ability",
        "IsAbilityHidden",
        "Moves",
        "RelearnMoves",
        "AlphaMove",
        "TID",
        "SID",
        "OriginTrainerName",
        "OriginTrainerGender",
        "HandlingTrainerName",
        "HandlingTrainerGender",
        "HandlingTrainerFriendship",
        "IsCurrentHandler",
        "OriginMetDate",
        "OriginMetLocation",
        "OriginMetLevel",
        "FatefulEncounter",
        "HeldItem",
        // "DynamicChecksum",
        // "NicknameMaxLength",
        "LanguageID",
        "HomeTracker",
        "Markings",
        "Contest",
        "Ribbons",
        "PokerusStrain",
        "PokerusDays",
        "IsPokerusInfected",
        "IsPokerusCured",
        "IsShadow",
        // "CanMove",
        // "LoadError",
        // "HasLoadError",
        // "IsEnabled",
    ];

    private static readonly HashSet<string> PkmLegalityPropertiesToUse = [
        // "Id",
        // "SaveId",
        "MovesLegality",
        "RelearnMovesLegality",
        "IsValid",
        "ValidityReport",
        "IllegalitiesCount",
    ];

    private static void IgnoreIrrelevantProperties(JsonTypeInfo typeInfo)
    {
        HashSet<string>? propertiesToUse = typeInfo.Type == typeof(PkmVariantDTO) ? PkmVariantPropertiesToUse
            : typeInfo.Type == typeof(PkmLegalityDTO) ? PkmLegalityPropertiesToUse
            : null;

        if (propertiesToUse == null)
            return;

        foreach (JsonPropertyInfo propertyInfo in typeInfo.Properties)
        {
            // Console.WriteLine(propertyInfo.Name);
            if (!propertiesToUse.Contains(propertyInfo.Name))
                propertyInfo.ShouldSerialize = static (obj, value) => false;
        }
    }

    private static readonly JsonSerializerOptions StaticJsonOptions = new()
    {
        // PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
#if DEBUG
        WriteIndented = true,
#endif
    };

    private static readonly JsonSerializerOptions FormJsonOptions = new()
    {
        // PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
#if DEBUG
        WriteIndented = true,
#endif
        TypeInfoResolver = new DefaultJsonTypeInfoResolver()
        {
            Modifiers = { IgnoreIrrelevantProperties }
        }
    };

    public static async Task Generate(ServiceProvider sp)
    {
        await Task.WhenAll([
            GenerateFrontendStuff(sp),
            GenerateData(sp),
        ]);
    }

    private static async Task GenerateFrontendStuff(ServiceProvider sp)
    {
        var fileIOService = sp.GetRequiredService<IFileIOService>();
        var staticDataService = sp.GetRequiredService<StaticDataService>();

#if DEBUG
        TypeScriptGeneratorSettings tsOptions = new()
        {
            TypeStyle = TypeScriptTypeStyle.Interface,
            TypeScriptVersion = 5.0m,
        };

        var types = new TypeScriptGenerator(JsonSchema.FromType<FrontendTypes>(), tsOptions).GenerateFile();
        types = string.Join('\n', types.Split('\n').Where(line =>
        {
            line = line.Trim();
            return line.Length > 0 && !line.StartsWith("//");
        })) + '\n';
        await File.WriteAllTextAsync("generate-convert-view/frontend/types.gen.ts", types);
#endif

        var sheetsPaths = fileIOService.Matcher.SearchPaths(["../frontend/public/imgs/sheets/"]);
        foreach (var path in sheetsPaths)
        {
            var sheetDestPath = Path.Combine(
                BasePath,
                $"generate-convert-view/frontend/public/sheets/{Path.GetFileName(path)}"
            );
            fileIOService.CreateDirectoryIfAny(sheetDestPath);
            fileIOService.Copy(path, sheetDestPath, true);
        }

        var sheetsJSONDestPath = Path.Combine(
            BasePath,
            $"generate-convert-view/frontend/public/static/spritesheets.json"
        );
        fileIOService.CreateDirectoryIfAny(sheetsJSONDestPath);
        using var sheetsStream = File.Create(sheetsJSONDestPath);
        await JsonSerializer.SerializeAsync(
            sheetsStream,
            await staticDataService.GetStaticSpritesheets(),
            StaticJsonOptions
        );

        var speciesJSONDestPath = Path.Combine(
            BasePath,
            $"generate-convert-view/frontend/public/static/species.json"
        );
        fileIOService.CreateDirectoryIfAny(speciesJSONDestPath);
        using var speciesStream = File.Create(speciesJSONDestPath);
        await JsonSerializer.SerializeAsync(
            speciesStream,
            await staticDataService.GetStaticSpecies(),
            StaticJsonOptions
        );

        var othersJSONDestPath = Path.Combine(
            BasePath,
            $"generate-convert-view/frontend/public/static/others.json"
        );
        fileIOService.CreateDirectoryIfAny(othersJSONDestPath);
        using var othersStream = File.Create(othersJSONDestPath);
        await JsonSerializer.SerializeAsync(
            othersStream,
            await staticDataService.GetStaticOthers(),
            StaticJsonOptions
        );
    }

    private static async Task GenerateData(ServiceProvider sp)
    {
        var fileIOService = sp.GetRequiredService<IFileIOService>();
        var pkmConvertService = sp.GetRequiredService<IPkmConvertService>();
        var pkmLegalityService = sp.GetRequiredService<PkmLegalityService>();
        var staticData = sp.GetRequiredService<StaticDataService>();

        var evolves = await staticData.GetStaticEvolves();

        var savePaths = fileIOService.Matcher.SearchPaths(["./generate-convert-view/saves/"]);

        var saves = savePaths
            .Select(path =>
            {
                if (SaveUtil.TryGetSaveFile(path, out var save))
                    return new SaveWrapper(save);

                Log.Warning($"Cannot load save file : {path}");

                return null;
            })
            .OfType<SaveWrapper>()
            .ToArray();

        var allVersionSaves = Enum.GetValues<GameVersion>().ToList()
            .Where(version => GameVersionUtil.GetSingleVersion(version) != default)
            .Select(version =>
            {
                var versionToUse = GameVersionUtil.GetSingleVersion(version);

                var save = saves.FirstOrDefault(s => s?.Version == versionToUse, null)
                    ?? VersionChecker.allVersionBlankSaves
                        .FirstOrDefault(s => s.Version == versionToUse && s.Save != null).Save
                    ?? new(BlankSaveFile.Get(versionToUse));

                return new VersionSaveEntry(
                    Version: version,
                    Save: save,
                    Pkms: save.GetAllPKM().ToArray()
                );
            })
            .ToArray()
            .OrderBy(entry => entry.Save == null
                ? 9999
                : PkmConvertService.GetPKMTypeWeight(entry.Save.PKMType))
            .ToArray();

        HashSet<string> pkTypes = allVersionSaves
            .Where(versionSave => versionSave.Save != null)
            .Select(versionSave => versionSave.Save.PKMType.Name)
            .ToHashSet();

        List<IndexEntry> entries = [];
        List<(IndexEntry Entry, VersionSaveEntry[] VersionsSaves, Dictionary<string, VersionSaveEntry> SecondaryVersionsToPrimary)> workItems = [];

        for (ushort species = 1; species < (ushort)Species.MAX_COUNT; species++)
        {
            var versionsSaves = allVersionSaves
                .Where(entry => entry.Save.IsSpeciesAllowed(species))
                .ToArray();

            Dictionary<string, VersionSaveEntry> secondaryVersionsToPrimary = [];
            foreach (var versionSave in versionsSaves)
            {
                var pkmType = versionSave.Save.PKMType;
                if (secondaryVersionsToPrimary.ContainsKey(pkmType.Name)
                    || pkmType.Name.StartsWith("PK"))
                    continue;

                var pkmTypeWeight = PkmConvertService.GetPKMTypeWeight(pkmType);
                var primaryVersionSave = versionsSaves.LastOrDefault(s => s.Save.PKMType != pkmType
                    && s.Save.PKMType.Name.StartsWith("PK")
                    && PkmConvertService.GetPKMTypeWeight(s.Save.PKMType) < pkmTypeWeight
                );
                if (primaryVersionSave == null)
                    continue;

                secondaryVersionsToPrimary.Add(pkmType.Name, primaryVersionSave);
            }

            for (byte form = 0; form < byte.MaxValue; form++)
            {
                if (FormInfo.IsBattleOnlyForm(species, form, default))
                    continue;

                var formVersionsSaves = versionsSaves.Where(entry =>
                {
                    var formListEn = species == (ushort)Species.Alcremie
                        ? FormConverter.GetAlcremieFormList(GameInfo.Strings.forms)
                        : FormConverter.GetFormList(species, GameInfo.Strings.Types, GameInfo.Strings.forms, GameInfo.GenderSymbolASCII, entry.Save.Context);

                    return form < formListEn.Length;
                })
                .ToArray();

                if (formVersionsSaves.Length == 0)
                    break;

                var entry = new IndexEntry(
                    Id: $"{species.ToString().PadLeft(4, '0')}-{form.ToString().PadLeft(2, '0')}",
                    Species: species,
                    Form: form
                );
                entries.Add(entry);
                workItems.Add((entry, formVersionsSaves, secondaryVersionsToPrimary));
            }
        }

        var setupedMemoryUsedMB = System.Diagnostics.Process.GetCurrentProcess().WorkingSet64 / 1_000_000;
        Log.Information($"Memory checks: setuped={setupedMemoryUsedMB} MB");

        await Parallel.ForEachAsync(
            workItems,
            new ParallelOptions
            {
                MaxDegreeOfParallelism = Math.Max(1, Environment.ProcessorCount - 2)
            },
            async (p, ct) =>
            {
                await GenerateFormSuites(
                    evolves, fileIOService, pkmLegalityService, pkmConvertService,
                    p.Entry, p.VersionsSaves, p.SecondaryVersionsToPrimary
                );
            }
        );

        var indexJson = new IndexJSON(
            PKTypes: pkTypes.ToArray(),
            PkmVariantProperties: PkmVariantPropertiesToUse.ToArray(),
            PkmLegalityProperties: PkmLegalityPropertiesToUse.ToArray(),
            Entries: entries.ToArray()
        );

        var indexPath = Path.Combine(
            BasePath,
            $"generate-convert-view/frontend/public/export/index.json"
        );
        var jsonBytes = JsonSerializer.SerializeToUtf8Bytes(indexJson, FormJsonOptions);
        await fileIOService.WriteBytes(indexPath, jsonBytes);

        var endMemoryUsedMB = System.Diagnostics.Process.GetCurrentProcess().WorkingSet64 / 1_000_000;
        Log.Information($"Memory checks: setuped={endMemoryUsedMB} MB");
    }

    private static async Task GenerateFormSuites(
        Dictionary<ushort, StaticEvolve> evolves,
        IFileIOService fileIOService, PkmLegalityService pkmLegalityService, IPkmConvertService pkmConvertService,
        IndexEntry indexEntry,
        VersionSaveEntry[] formVersionsSaves, Dictionary<string, VersionSaveEntry> secondaryVersionsToPrimary
    )
    {
        var formJson = new ConvertFormJSON(
            Id: indexEntry.Id,
            Species: indexEntry.Species,
            Form: indexEntry.Form,
            Paths: [],
            MissingSavePkmsPresent: [],
            MissingSavePkmTypes: []
        );

        var mainVersionsSaves = formVersionsSaves.Where(entry => entry.Save.PKMType.Name.StartsWith("PK")).ToArray();
        var mainVersionsSavesReverse = mainVersionsSaves.ToArray().Reverse().ToArray();
        var secondaryVersionsSaves = formVersionsSaves.Except(mainVersionsSaves).ToArray();
        // Console.WriteLine(string.Join(',', secondaryVersionsSaves.Select(s => s.Save.GetSave().GetType().Name)));
        (VersionSaveEntry Entry, ImmutablePKM Pkm) GetVersionSaveWithPkm(VersionSaveEntry[] list)
        {
            foreach (var entry in list)
            {
                var pkmFound = entry.Pkms.FirstOrDefault(pkm => pkm?.Species == indexEntry.Species && pkm.Form == indexEntry.Form, null);
                if (pkmFound != null)
                    return (entry, pkmFound);
            }
            return default;
        }

        var minimalMainVersionSaveSource = GetVersionSaveWithPkm(mainVersionsSaves);
        var maximalMainVersionSaveSource = GetVersionSaveWithPkm(mainVersionsSavesReverse);

        var minimalMainVersionSaveTarget = mainVersionsSaves.FirstOrDefault()!;
        var maximalMainVersionSaveTarget = mainVersionsSaves.LastOrDefault()!;

        Log.Debug($"Species={indexEntry.Species} Form={indexEntry.Form}");

        var forwardSteps = GetSimpleStepSuite(
            evolves, pkmLegalityService, pkmConvertService,
            mainVersionsSaves,
            formJson.Id, ConvertDirection.FORWARD,
            minimalMainVersionSaveSource, maximalMainVersionSaveTarget
        );
        if (forwardSteps.Length > 0)
            formJson.Paths.Add(new(ConvertDirection.FORWARD, forwardSteps));

        var backwardSteps = GetSimpleStepSuite(
            evolves, pkmLegalityService, pkmConvertService,
            mainVersionsSavesReverse,
            formJson.Id, ConvertDirection.BACKWARD,
            maximalMainVersionSaveSource, minimalMainVersionSaveTarget
        );
        if (backwardSteps.Length > 0)
            formJson.Paths.Add(new(ConvertDirection.BACKWARD, backwardSteps));

        foreach (var entry in secondaryVersionsToPrimary)
        {
            var source = GetVersionSaveWithPkm(mainVersionsSaves
                .Where(s => s.Save.PKMType == entry.Value.Save.PKMType)
                .ToArray());
            var target = secondaryVersionsSaves
                .FirstOrDefault(s => s.Save.PKMType.Name == entry.Key);

            Log.Debug(
                $"\t{ConvertDirection.BASE_TO_VARIANT} {(source == default ? null : source.Entry.Save.PKMType.Name)}"
                + $"=>{(target == default ? null : target.Save.PKMType.Name)}"
            );

            List<ConvertStep> baseVariantSteps = [];

            if (source == default)
                formJson.MissingSavePkmsPresent.Add(entry.Value.Save.PKMType.Name);

            if (target == default)
                formJson.MissingSavePkmTypes.Add(entry.Key);

            if (source != default && target != default)
            {
                baseVariantSteps.AddRange(GetSimpleStepSuite(
                    evolves, pkmLegalityService, pkmConvertService,
                    [source.Entry, target],
                    formJson.Id, ConvertDirection.BASE_TO_VARIANT,
                    source, target
                ));
                formJson.Paths.Add(new(ConvertDirection.BASE_TO_VARIANT, baseVariantSteps.ToArray()));
            }

            source = GetVersionSaveWithPkm(secondaryVersionsSaves
                .Where(s => s.Save.PKMType.Name == entry.Key)
                .ToArray());
            target = mainVersionsSaves
                .FirstOrDefault(s => s?.Save.PKMType == entry.Value.Save.PKMType);

            Log.Debug(
                $"\t{ConvertDirection.VARIANT_TO_BASE} {(source == default ? null : source.Entry.Save.PKMType.Name)}"
                + $"=>{(target == default ? null : target.Save.PKMType.Name)}"
            );

            baseVariantSteps = [];

            if (source == default)
                formJson.MissingSavePkmsPresent.Add(entry.Key);

            if (target == default)
                formJson.MissingSavePkmTypes.Add(entry.Value.Save.PKMType.Name);

            if (source != default && target != default)
            {
                baseVariantSteps.AddRange(GetSimpleStepSuite(
                    evolves, pkmLegalityService, pkmConvertService,
                    [source.Entry, target],
                    formJson.Id, ConvertDirection.VARIANT_TO_BASE,
                    source, target
                ));
                formJson.Paths.Add(new(ConvertDirection.VARIANT_TO_BASE, baseVariantSteps.ToArray()));
            }
        }

        var filePath = Path.Combine(
            BasePath,
            $"generate-convert-view/frontend/public/export/{formJson.Id}.json"
        );
        var jsonBytes = JsonSerializer.SerializeToUtf8Bytes(formJson, FormJsonOptions);
        await fileIOService.WriteBytes(filePath, jsonBytes);
    }

    private static ConvertStep[] GetSimpleStepSuite(
        Dictionary<ushort, StaticEvolve> evolves, PkmLegalityService pkmLegalityService, IPkmConvertService pkmConvertService,
        VersionSaveEntry[] versionsSaves,
        string formId, ConvertDirection direction,
        (VersionSaveEntry Entry, ImmutablePKM Pkm) source,
        VersionSaveEntry target
    )
    {
        Log.Debug(
            $"\t{direction} {(source == default ? null : source.Entry.Save.PKMType.Name)}"
            + $"=>{(target == default ? null : target.Save.PKMType.Name)}"
        );

        List<ConvertStep> steps = [];

        if (source != default && target != default)
        {
            var mainVersionSaveSource = source.Entry;
            var pkmSource = source.Pkm;

            var firstSourceDto = GetVariantDTO(pkmSource, evolves);
            var firstSourceLegality = pkmLegalityService.CreateDTO("", pkmSource, mainVersionSaveSource.Save);

            steps.Add(GetStep(
                formId, direction,
                pkmSource.GetMutablePkm(),
                firstSourceDto, firstSourceLegality
            ));

            for (var i = versionsSaves.IndexOf(source.Entry) + 1; i < versionsSaves.Length; i++)
            {
                var mainVersionSaveTarget = versionsSaves[i];
                if (mainVersionSaveTarget.Save.PKMType == mainVersionSaveSource.Save.PKMType)
                    continue;

                try
                {
                    var pkmResult = pkmConvertService.ConvertTo(
                        pkmSource,
                        mainVersionSaveTarget.Save.PKMType,
                        null,
                        mainVersionSaveTarget.Save.GetSave()
                    );

                    var targetDto = GetVariantDTO(pkmResult, evolves);
                    var targetLegality = pkmLegalityService.CreateDTO("", pkmResult, mainVersionSaveTarget.Save);

                    steps.Add(GetStep(
                        formId, direction,
                        pkmResult.GetMutablePkm(),
                        targetDto, targetLegality
                    ));

                    pkmSource = pkmResult;
                    mainVersionSaveSource = mainVersionSaveTarget;
                }
                catch (Exception ex)
                {
                    Log.Error(
                        $"Exception during convert process with {pkmSource.GetMutablePkm().GetType().Name}->{mainVersionSaveTarget.Save.PKMType} Species={pkmSource.Species} Form={pkmSource.Form}",
                        ex
                    );

                    steps.Add(GetStep(
                        formId, direction,
                        mainVersionSaveTarget.Save.PKMType.Name,
                        ex
                    ));
                    break;
                }
            }
        }

        return steps.ToArray();
    }

    private static ConvertStep GetStep(
        string formId,
        ConvertDirection direction,
        PKM pkm,
        PkmVariantDTO pkmVariant,
        PkmLegalityDTO pkmLegality
    )
    {
        return new(
            Id: $"{formId}-{direction}-{pkm.GetType().Name}",
            Type: pkm.GetType().Name,
            Ok: true,
            Error: null,
            PkmVariant: pkmVariant,
            PkmLegality: pkmLegality
        );
    }

    private static ConvertStep GetStep(
        string formId,
        ConvertDirection direction,
        string type,
        Exception ex
    )
    {
        return new(
            Id: $"{formId}-{direction}-{type}",
            Type: type,
            Ok: false,
            Error: ex.ToString(),
            PkmVariant: null,
            PkmLegality: null
        );
    }

    private static PkmVariantDTO GetVariantDTO(ImmutablePKM pkm, Dictionary<ushort, StaticEvolve> evolves) => new(
        Id: "",
        Generation: pkm.Generation,
        SettingsLanguage: "",
        Pkm: pkm,

        BoxId: 0,
        BoxSlot: 0,
        IsMain: true,
        IsExternal: false,
        AttachedSaveId: null,
        AttachedSavePkmIdBase: null,

        IsFilePresent: false,
        Filepath: "",
        FilepathAbsolute: "",

        VersionChecker,
        Evolves: evolves
    );
}
