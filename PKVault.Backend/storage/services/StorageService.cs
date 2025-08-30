
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

        return await memoryLoader.loaders.saveLoadersDict[saveId].Boxes.GetAllDtos();
    }

    public static async Task<List<PkmSaveDTO>> GetSavePkms(uint saveId)
    {
        if (memoryLoader == null)
        {
            return [];
        }

        return await memoryLoader.loaders.saveLoadersDict[saveId].Pkms.GetAllDtos();
    }

    public static async Task MainMovePkm(string pkmId, uint boxId, uint boxSlot)
    {
        await memoryLoader.AddAction(
            new MainMovePkmAction(pkmId, boxId, boxSlot)
        );
    }

    public static async Task MainCreatePkmVersion(string pkmId, uint generation)
    {
        await memoryLoader.AddAction(
            new MainCreatePkmVersionAction(pkmId, generation)
        );
    }

    public static async Task MainEditPkmVersion(string pkmVersionId, EditPkmVersionPayload payload)
    {
        await memoryLoader.AddAction(
            new EditPkmVersionAction(pkmVersionId, payload)
        );
    }

    public static async Task SaveEditPkm(uint saveId, string pkmId, EditPkmVersionPayload payload)
    {
        await memoryLoader.AddAction(
            new EditPkmSaveAction(saveId, pkmId, payload)
        );
    }

    public static async Task SaveMovePkm(uint saveId, string pkmId, int boxId, int boxSlot)
    {
        await memoryLoader.AddAction(
            new SaveMovePkmAction(saveId, pkmId, boxId, boxSlot)
        );
    }

    public static async Task SaveMovePkmToStorage(uint saveId, string savePkmId, uint storageBoxId, uint storageSlot)
    {
        await memoryLoader.AddAction(
            new SaveMovePkmToStorageAction(
                saveId,
                savePkmId,
                storageBoxId,
                storageSlot
            )
        );
    }

    public static async Task SaveMovePkmFromStorage(uint saveId, string pkmVersionId, int saveBoxId, int saveSlot)
    {
        await memoryLoader.AddAction(
            new SaveMovePkmFromStorageAction(
                saveId,
                pkmVersionId,
                saveBoxId,
                saveSlot
            )
        );
    }

    public static async Task MainPkmDetachSave(string pkmId)
    {
        await memoryLoader.AddAction(
            new DetachPkmSaveAction(pkmId)
        );
    }

    public static async Task MainPkmVersionDelete(string pkmVersionId)
    {
        await memoryLoader.AddAction(
            new DeletePkmVersionAction(pkmVersionId)
        );
    }

    public static async Task SaveDeletePkm(uint saveId, string pkmId)
    {
        await memoryLoader.AddAction(
            new SaveDeletePkmAction(saveId, pkmId)
        );
    }

    public static async Task SaveSynchronizePkm(uint saveId, string pkmVersionId)
    {
        await memoryLoader.AddAction(
            new SynchronizePkmAction(saveId, pkmVersionId)
        );
    }

    public static async Task EvolvePkm(uint? saveId, string id)
    {
        await memoryLoader.AddAction(
            new EvolvePkmAction(saveId, id)
        );
    }

    public static async Task Save()
    {
        var actions = memoryLoader.actions;
        if (actions.Count == 0)
        {
            return;
        }

        Console.WriteLine("SAVING IN PROGRESS");

        await BackupService.PrepareBackupThenRun(async () =>
        {
            var fileLoader = DataFileLoader.Create();

            for (var i = 0; i < actions.Count; i++)
            {
                await fileLoader.ApplyAction(actions[i]);
            }

            fileLoader.WriteSaves();
        });
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

    public static async Task RemoveDataActions(int actionIndexToRemoveFrom)
    {
        var previousActions = memoryLoader.actions;

        await ResetDataLoader();

        for (var i = 0; i < previousActions.Count; i++)
        {
            if (actionIndexToRemoveFrom > i)
            {
                await memoryLoader.AddAction(previousActions[i]);
            }
        }
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
