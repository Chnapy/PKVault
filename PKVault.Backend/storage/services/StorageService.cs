
public class StorageService
{
    public static DataMemoryLoader? memoryLoader;

    public static async Task Initialize()
    {
        await ResetDataLoader();
    }

    public static async Task<List<BoxDTO>> GetMainBoxes()
    {
        if (memoryLoader == null)
        {
            return [];
        }

        return await memoryLoader.loaders.boxLoader.GetAllDtos();
    }

    public static async Task<List<PkmDTO>> GetMainPkms()
    {
        if (memoryLoader == null)
        {
            return [];
        }

        return await memoryLoader.loaders.pkmLoader.GetAllDtos();
    }

    public static async Task<List<PkmVersionDTO>> GetMainPkmVersions()
    {
        if (memoryLoader == null)
        {
            return [];
        }

        return await memoryLoader.loaders.pkmVersionLoader.GetAllDtos();
    }

    public static async Task<List<BoxDTO>> GetSaveBoxes(uint saveId)
    {
        if (memoryLoader == null)
        {
            return [];
        }

        var saveExists = memoryLoader.loaders.saveLoadersDict.TryGetValue(saveId, out var saveLoaders);
        if (!saveExists)
        {
            return [];
        }

        return await saveLoaders.Boxes.GetAllDtos();
    }

    public static async Task<List<PkmSaveDTO>> GetSavePkms(uint saveId)
    {
        if (memoryLoader == null)
        {
            return [];
        }

        var saveExists = memoryLoader.loaders.saveLoadersDict.TryGetValue(saveId, out var saveLoaders);
        if (!saveExists)
        {
            return [];
        }

        return await saveLoaders.Pkms.GetAllDtos();
    }

    public static async Task<DataUpdateFlags> MovePkm(
        string pkmId, uint? sourceSaveId,
        uint? targetSaveId, int targetBoxId, int targetBoxSlot,
        bool attached
    )
    {
        return await AddAction(
            new MovePkmAction(pkmId, sourceSaveId, targetSaveId, targetBoxId, targetBoxSlot, attached)
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

    public static async Task<DataUpdateFlags> MainPkmDetachSave(string pkmId)
    {
        return await AddAction(
            new DetachPkmSaveAction(pkmId)
        );
    }

    public static async Task<DataUpdateFlags> MainPkmVersionDelete(string pkmVersionId)
    {
        return await AddAction(
            new DeletePkmVersionAction(pkmVersionId)
        );
    }

    public static async Task<DataUpdateFlags> SaveDeletePkm(uint saveId, string pkmId)
    {
        return await AddAction(
            new SaveDeletePkmAction(saveId, pkmId)
        );
    }

    public static async Task<DataUpdateFlags> SaveSynchronizePkm(uint saveId, string pkmVersionId)
    {
        return await AddAction(
            new SynchronizePkmAction(saveId, pkmVersionId)
        );
    }

    public static async Task<DataUpdateFlags> EvolvePkm(uint? saveId, string id)
    {
        return await AddAction(
            new EvolvePkmAction(saveId, id)
        );
    }

    public static async Task<DataUpdateFlags> Save()
    {
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

        return flags;
    }

    private static async Task<DataUpdateFlags> AddAction(DataAction action)
    {
        try
        {
            return await memoryLoader.AddAction(action, null);
        }
        catch
        {
            // re-run actions to avoid persisted side-effects, no removal here
            return await RemoveDataActionsAndReset(int.MaxValue);
            throw;
        }
    }

    public static List<DataActionPayload> GetActionPayloadList()
    {
        if (memoryLoader == null)
        {
            return [];
        }

        var actionPayloadList = new List<DataActionPayload>();
        memoryLoader.actions.ForEach(action => actionPayloadList.Add(action.GetPayload()));
        return actionPayloadList;
    }

    public static bool HasEmptyActionList()
    {
        return memoryLoader.actions.Count == 0;
    }

    public static async Task ResetDataLoader()
    {
        var logtime = LogUtil.Time($"Data-loader reset");

        memoryLoader = await DataMemoryLoader.Create();

        logtime();
    }

    public static async Task<DataUpdateFlags> RemoveDataActionsAndReset(int actionIndexToRemoveFrom)
    {
        var previousActions = memoryLoader.actions;

        await ResetDataLoader();

        var flags = new DataUpdateFlags
        {
            MainBoxes = true,
            MainPkms = true,
            MainPkmVersions = true,
            Saves = [
                new() {
                    SaveId = 0
                }
            ]
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
