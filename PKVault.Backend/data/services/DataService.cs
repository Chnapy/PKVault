public class DataService(
    StorageService storageService, StaticDataService staticDataService,
    WarningsService warningsService, DexService dexService, LocalSaveService saveService,
    BackupService backupService, SettingsService settingsService
)
{
    public async Task<DataDTO> CreateDataFromUpdateFlags(DataUpdateFlags flags)
    {
        var time = LogUtil.Time("Prepare global data payload");
        var tasks = new List<Task>();

        var dto = new DataDTO();

        var memoryLoader = await storageService.GetLoader();

        if (flags.StaticData)
        {
            tasks.Add(Task.Run(async () =>
            {
                dto.StaticData = await staticDataService.GetStaticData();
            }));
        }

        // Note: should be done first since it may be used by pkm-version
        if (flags.Warnings)
        {
            tasks.Add(warningsService.CheckWarnings());
        }

        if (flags.Dex)
        {
            tasks.Add(Task.Run(async () =>
            {
                dto.Dex = await dexService.GetDex();
            }));
        }

        if (flags.MainBanks)
        {
            tasks.Add(Task.Run(async () =>
            {
                dto.MainBanks = await storageService.GetMainBanks();
            }));
        }

        if (flags.MainBoxes)
        {
            tasks.Add(Task.Run(async () =>
            {
                dto.MainBoxes = await storageService.GetMainBoxes();
            }));
        }

        if (flags.MainPkms)
        {
            tasks.Add(Task.Run(async () =>
            {
                dto.MainPkms = await storageService.GetMainPkms();
            }));
        }

        if (flags.MainPkmVersions)
        {
            tasks.Add(Task.Run(async () =>
            {
                dto.MainPkmVersions = await storageService.GetMainPkmVersions();
            }));
        }

        var saveDict = new Dictionary<uint, DataSaveDTO>();
        flags.Saves.ForEach(saveData =>
        {
            saveDict.TryAdd(saveData.SaveId, new() { SaveId = saveData.SaveId });
            saveDict.TryGetValue(saveData.SaveId, out var saveDto);

            if (saveDto != null && saveData.SaveId > 0)
            {
                if (saveData.SaveBoxes)
                {
                    tasks.Add(Task.Run(async () =>
                    {
                        if (memoryLoader.loaders.saveLoadersDict.ContainsKey(saveData.SaveId))
                        {
                            saveDto.SaveBoxes ??= await storageService.GetSaveBoxes(saveData.SaveId);
                        }
                        else
                        {
                            saveDto.SaveBoxes = [];
                        }
                    }));
                }

                if (saveData.SavePkms)
                {
                    tasks.Add(Task.Run(async () =>
                    {
                        if (memoryLoader.loaders.saveLoadersDict.ContainsKey(saveData.SaveId))
                        {
                            saveDto.SavePkms ??= await storageService.GetSavePkms(saveData.SaveId);
                        }
                        else
                        {
                            saveDto.SavePkms = [];
                        }
                    }));
                }
            }
        });

        if (flags.SaveInfos)
        {
            dto.SaveInfos = saveService.GetAllSaveInfos();
        }

        if (flags.Backups)
        {
            dto.Backups = backupService.GetBackupList();
        }

        await Task.WhenAll(tasks);

        dto.Saves = saveDict.Count > 0 ? [.. saveDict.Values] : null;

        dto.Actions = storageService.GetActionPayloadList();
        dto.Warnings = warningsService.GetWarningsDTO();
        dto.Settings = settingsService.GetSettings();

        time();

        // time = LogUtil.Time("Response serialization");
        // var json = System.Text.Json.JsonSerializer.Serialize(dto);
        // time();

        // Console.WriteLine($"Response counts, MainBoxes={dto.MainBoxes?.Count} MainPkms={dto.MainPkms?.Count} MainPkmVersions={dto.MainPkmVersions?.Count} Dex={dto.Dex?.Count}");

        return dto;
    }
}
