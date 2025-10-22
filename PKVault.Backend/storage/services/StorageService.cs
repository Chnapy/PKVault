using PKHeX.Core;
using PKVault.Backend;

public class StorageService
{
    private static DataMemoryLoader? _memoryLoader;

    public static async Task<List<BoxDTO>> GetMainBoxes()
    {
        var memoryLoader = await GetLoader();

        return memoryLoader.loaders.boxLoader.GetAllDtos();
    }

    public static async Task<List<PkmDTO>> GetMainPkms()
    {
        var memoryLoader = await GetLoader();

        return memoryLoader.loaders.pkmLoader.GetAllDtos();
    }

    public static async Task<List<PkmVersionDTO>> GetMainPkmVersions()
    {
        var memoryLoader = await GetLoader();

        return memoryLoader.loaders.pkmVersionLoader.GetAllDtos();
    }

    public static async Task<List<BoxDTO>> GetSaveBoxes(uint saveId)
    {
        var memoryLoader = await GetLoader();

        var saveExists = memoryLoader.loaders.saveLoadersDict.TryGetValue(saveId, out var saveLoaders);
        if (!saveExists)
        {
            return [];
        }

        return saveLoaders.Boxes.GetAllDtos();
    }

    public static async Task<List<PkmSaveDTO>> GetSavePkms(uint saveId)
    {
        var memoryLoader = await GetLoader();

        var saveExists = memoryLoader.loaders.saveLoadersDict.TryGetValue(saveId, out var saveLoaders);
        if (!saveExists)
        {
            return [];
        }

        return saveLoaders.Pkms.GetAllDtos();
    }

    public static async Task<DataUpdateFlags> MainCreateBox(string boxName)
    {
        return await AddAction(
            new MainCreateBoxAction(boxName)
        );
    }

    public static async Task<DataUpdateFlags> MainUpdateBox(string boxId, string boxName)
    {
        return await AddAction(
            new MainUpdateBoxAction(boxId, boxName)
        );
    }

    public static async Task<DataUpdateFlags> MainDeleteBox(string boxId)
    {
        return await AddAction(
            new MainDeleteBoxAction(boxId)
        );
    }

    public static async Task<DataUpdateFlags> MovePkm(
        string[] pkmIds, uint? sourceSaveId,
        uint? targetSaveId, int targetBoxId, int[] targetBoxSlots,
        bool attached
    )
    {
        return await AddAction(
            new MovePkmAction(pkmIds, sourceSaveId, targetSaveId, targetBoxId, targetBoxSlots, attached)
        );
    }

    public static async Task<DataUpdateFlags> MainCreatePkmVersion(string pkmId, uint generation)
    {
        return await AddAction(
            new MainCreatePkmVersionAction(pkmId, generation)
        );
    }

    public static async Task<DataUpdateFlags> MainEditPkmVersion(string pkmVersionId, EditPkmVersionPayload payload)
    {
        return await AddAction(
            new EditPkmVersionAction(pkmVersionId, payload)
        );
    }

    public static async Task<DataUpdateFlags> SaveEditPkm(uint saveId, string pkmId, EditPkmVersionPayload payload)
    {
        return await AddAction(
            new EditPkmSaveAction(saveId, pkmId, payload)
        );
    }

    public static async Task<DataUpdateFlags> MainPkmDetachSaves(string[] pkmIds)
    {
        return await AddAction(
            new DetachPkmSaveAction(pkmIds)
        );
    }

    public static async Task<DataUpdateFlags> MainPkmVersionsDelete(string[] pkmVersionIds)
    {
        return await AddAction(
            new DeletePkmVersionAction(pkmVersionIds)
        );
    }

    public static async Task<DataUpdateFlags> SaveDeletePkms(uint saveId, string[] pkmIds)
    {
        return await AddAction(
            new SaveDeletePkmAction(saveId, pkmIds)
        );
    }

    public static async Task<DataUpdateFlags> EvolvePkms(uint? saveId, string[] ids)
    {
        return await AddAction(
            new EvolvePkmAction(saveId, ids)
        );
    }

    public static async Task<DataUpdateFlags> Save()
    {
        var memoryLoader = await GetLoader();
        var flags = new DataUpdateFlags();

        var actions = memoryLoader.actions;
        if (actions.Count == 0)
        {
            return flags;
        }

        Console.WriteLine("SAVING IN PROGRESS");

        await BackupService.PrepareBackupThenRun(async () =>
        {
            var fileLoader = DataFileLoader.Create();

            for (var i = 0; i < actions.Count; i++)
            {
                await fileLoader.ApplyAction(actions[i], flags);
            }

            fileLoader.WriteSaves();
        });

        flags.Backups = true;
        flags.Warnings = true;

        return flags;
    }

    private static async Task<DataUpdateFlags> AddAction(DataAction action)
    {
        var memoryLoader = await GetLoader();

        try
        {
            var flags = await memoryLoader.AddAction(action, null);
            flags.Warnings = true;
            return flags;
        }
        catch (Exception ex)
        {
            // re-run actions to avoid persisted side-effects, no removal here
            var flags = await RemoveDataActionsAndReset(int.MaxValue);
            throw new DataActionException(ex, flags);
        }
    }

    public static List<DataActionPayload> GetActionPayloadList()
    {
        var actionPayloadList = new List<DataActionPayload>();
        _memoryLoader?.actions.ForEach(action => actionPayloadList.Add(action.payload));
        return actionPayloadList;
    }

    public static bool HasEmptyActionList()
    {
        return _memoryLoader == null || _memoryLoader.actions.Count == 0;
    }

    public static async Task<DataMemoryLoader> ResetDataLoader(bool checkSaveSynchro)
    {
        var logtime = LogUtil.Time($"Data-loader reset");

        _memoryLoader = DataMemoryLoader.Create();

        if (checkSaveSynchro)
        {
            await _memoryLoader.CheckSaveToSynchronize();
        }

        logtime();

        return _memoryLoader;
    }

    public static async Task<DataUpdateFlags> RemoveDataActionsAndReset(int actionIndexToRemoveFrom)
    {
        var previousActions = (await GetLoader()).actions;

        await ResetDataLoader(false);

        var memoryLoader = await GetLoader();

        var flags = new DataUpdateFlags
        {
            MainBoxes = true,
            MainPkms = true,
            MainPkmVersions = true,
            Saves = [
                new() {
                    SaveId = 0
                }
            ],
            Dex = true,
            Warnings = true,
        };

        for (var i = 0; i < previousActions.Count; i++)
        {
            if (actionIndexToRemoveFrom > i)
            {
                await memoryLoader.AddAction(previousActions[i], flags);
            }
        }

        return flags;
    }

    public static async Task<DataMemoryLoader> GetLoader()
    {
        if (_memoryLoader == null)
        {
            await Program.WaitForSetup();
        }

        return _memoryLoader!;
    }

    public static async Task<List<MoveItem>> GetPkmAvailableMoves(uint? saveId, string pkmId)
    {
        var loader = await GetLoader();
        var pkm = (saveId == null
            ? loader.loaders.pkmVersionLoader.GetDto(pkmId)?.Pkm
            : loader.loaders.saveLoadersDict[(uint)saveId].Pkms.GetDto(pkmId)?.Pkm)
            ?? throw new ArgumentException($"Pkm not found, saveId={saveId} pkmId={pkmId}");

        try
        {
            var legality = new LegalityAnalysis(pkm);

            var moveComboSource = new LegalMoveComboSource();
            var moveSource = new LegalMoveSource<ComboItem>(moveComboSource);

            var version = pkm.Version.IsValidSavedVersion() ? pkm.Version : pkm.Version.GetSingleVersion();
            var blankSav = BlankSaveFile.Get(version, pkm.OriginalTrainerName, (LanguageID)pkm.Language);

            var filteredSources = new FilteredGameDataSource(blankSav, GameInfo.Sources);
            moveSource.ChangeMoveSource(filteredSources.Moves);
            moveSource.ReloadMoves(legality);

            var movesStr = GameInfo.GetStrings(SettingsService.AppSettings.GetSafeLanguage()).movelist;

            var availableMoves = new List<MoveItem>();

            moveComboSource.DataSource.ToList().ForEach(data =>
            {
                if (data.Value > 0 && moveSource.Info.CanLearn((ushort)data.Value))
                {
                    var item = new MoveItem
                    {
                        Id = data.Value,
                        // Type = MoveInfo.GetType((ushort)data.Value, Pkm.Context),
                        // Text = movesStr[data.Value],
                        // SourceTypes = moveSourceTypes.FindAll(type => moveSourceTypesRecord[type].Length > data.Value && moveSourceTypesRecord[type][data.Value]),
                    };
                    availableMoves.Add(item);
                }
            });

            return availableMoves;
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine(ex);
            return [];
        }
    }

    public static void CleanWrongData()
    {
        var time = LogUtil.Time("Clean wrong data");

        var dbDir = SettingsService.AppSettings.SettingsMutable.DB_PATH;

        var pkmMemoryLoader = new PKMMemoryLoader();
        var pkmRealFileLoader = new PKMFileLoader();

        var boxLoader = new EntityJSONLoader<BoxDTO, BoxEntity>(
            filePath: Path.Combine(dbDir, "box.json"),
            entityToDto: entity => default,
            dtoToEntity: dto => dto.BoxEntity
        );

        var pkmLoader = new EntityJSONLoader<PkmDTO, PkmEntity>(
           filePath: Path.Combine(dbDir, "pkm.json"),
            entityToDto: entity => default,
            dtoToEntity: dto => dto.PkmEntity
        );

        var pkmVersionLoader = new EntityJSONLoader<PkmVersionDTO, PkmVersionEntity>(
           filePath: Path.Combine(dbDir, "pkm-version.json"),
            entityToDto: entity => default,
            dtoToEntity: dto => dto.PkmVersionEntity
        );

        var boxEntities = boxLoader.GetAllEntities();
        var pkmEntities = pkmLoader.GetAllEntities();

        List<string> pkmVersionToDelete = [];

        // remove pkmVersions with inconsistent data
        pkmVersionLoader.GetAllEntities().Values.ToList().ForEach(pkmVersionEntity =>
        {
            var pkmExists = pkmEntities.TryGetValue(pkmVersionEntity.PkmId, out var pkmEntity);
            if (!pkmExists)
            {
                pkmVersionToDelete.Add(pkmVersionEntity.Id);
            }
            else
            {
                var boxExists = boxEntities.TryGetValue(pkmEntity!.BoxId.ToString(), out var boxEntity);
                if (!boxExists)
                {
                    pkmVersionToDelete.Add(pkmVersionEntity.Id);
                }
                else
                {
                    try
                    {
                        pkmRealFileLoader.GetEntity(pkmVersionEntity.Filepath);
                    }
                    catch (Exception ex)
                    {
                        Console.Error.WriteLine(ex);
                        pkmVersionToDelete.Add(pkmVersionEntity.Id);
                    }
                }
            }
        });

        if (pkmVersionToDelete.Count > 0)
        {
            // bkp
            File.Copy(Path.Combine(dbDir, "pkm-version.json"), Path.Combine(dbDir, "pkm-version.json.bkp"), true);

            pkmVersionToDelete.ForEach(pkmVersionId => pkmVersionLoader.DeleteEntity(pkmVersionId));
            pkmVersionLoader.WriteToFile();
        }

        var pkmVersionEntities = pkmVersionLoader.GetAllEntities();

        List<string> pkmsToDelete = [];

        // remove pkms with inconsistent data
        pkmEntities.Values.ToList().ForEach(pkmEntity =>
        {
            var pkmVersions = pkmVersionEntities.Values.ToList().FindAll(pkmVersion => pkmVersion.PkmId == pkmEntity.Id);
            if (pkmVersions.Count == 0)
            {
                pkmsToDelete.Add(pkmEntity.Id);
            }
        });

        if (pkmsToDelete.Count > 0)
        {
            // bkp
            File.Copy(Path.Combine(dbDir, "pkm.json"), Path.Combine(dbDir, "pkm.json.bkp"), true);

            pkmsToDelete.ForEach(pkmId => pkmLoader.DeleteEntity(pkmId));
            pkmLoader.WriteToFile();
        }

        time();
    }

    // public static void CleanMainStorageFiles()
    // {
    //     Stopwatch sw = new();

    //     Console.WriteLine($"Storage files clean up");

    //     sw.Start();

    //     var pkmVersionsFilepaths = memoryLoader.loaders.pkmVersionLoader.GetAllDtos().Select(dto => dto.PkmVersionEntity.Filepath).ToList();

    //     var rootDir = ".";
    //     var storagePath = SettingsService.AppSettings.STORAGE_PATH;

    //     var matcher = new Matcher();
    //     matcher.AddInclude(Path.Combine(storagePath, "**/*"));
    //     var matches = matcher.Execute(new DirectoryInfoWrapper(new DirectoryInfo(rootDir)));

    //     foreach (var file in matches.Files)
    //     {
    //         var path = Path.Combine(rootDir, file.Path);

    //         if (!pkmVersionsFilepaths.Contains(path))
    //         {
    //             Console.WriteLine($"Clean storage file {path}");
    //             File.Delete(path);
    //         }
    //     }
    //     sw.Stop();

    //     Console.WriteLine($"Storage files cleaned up in {sw.Elapsed}");
    // }
}
