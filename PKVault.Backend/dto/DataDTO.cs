public struct DataDTO
{
    public static async Task<DataDTO> FromDataUpdateFlags(DataUpdateFlags flags)
    {
        var tasks = new List<Task>();

        var dto = new DataDTO();

        if (flags.MainBoxes)
        {
            tasks.Add(Task.Run(async () =>
            {
                dto.MainBoxes = await StorageService.GetMainBoxes();
            }));
        }

        if (flags.MainPkms)
        {
            tasks.Add(Task.Run(async () =>
            {
                dto.MainPkms = await StorageService.GetMainPkms();
            }));
        }

        if (flags.MainPkmVersions)
        {
            tasks.Add(Task.Run(async () =>
            {
                dto.MainPkmVersions = await StorageService.GetMainPkmVersions();
            }));
        }

        var saveDict = new Dictionary<uint, DataSaveDTO>();
        flags.Saves.ForEach(saveData =>
        {
            saveDict.TryAdd(saveData.SaveId, new() { SaveId = saveData.SaveId });
            saveDict.TryGetValue(saveData.SaveId, out var saveDto);

            if (saveData.SaveId > 0)
            {
                if (saveData.SaveBoxes)
                {
                    tasks.Add(Task.Run(async () =>
                    {
                        if (StorageService.memoryLoader.loaders.saveLoadersDict.ContainsKey(saveData.SaveId))
                        {
                            saveDto.SaveBoxes ??= await StorageService.GetSaveBoxes(saveData.SaveId);
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
                        if (StorageService.memoryLoader.loaders.saveLoadersDict.ContainsKey(saveData.SaveId))
                        {
                            saveDto.SavePkms ??= await StorageService.GetSavePkms(saveData.SaveId);
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
            dto.SaveInfos = LocalSaveService.GetAllSaveInfos();
        }

        if (flags.Backups)
        {
            dto.Backups = BackupService.GetBackupList();
        }

        await Task.WhenAll(tasks);

        dto.Saves = saveDict.Count > 0 ? [.. saveDict.Values] : null;

        dto.Actions = StorageService.GetActionPayloadList();
        dto.Warnings = WarningsService.GetWarningsDTO();

        return dto;
    }

    public DataDTOType Type { get; set; } = DataDTOType.DATA_DTO;

    public List<BoxDTO>? MainBoxes { get; set; }
    public List<PkmDTO>? MainPkms { get; set; }
    public List<PkmVersionDTO>? MainPkmVersions { get; set; }
    public List<DataSaveDTO>? Saves { get; set; }
    public List<DataActionPayload>? Actions { get; set; }
    public WarningsDTO? Warnings { get; set; }
    public Dictionary<uint, SaveInfosDTO>? SaveInfos { get; set; }
    public List<BackupDTO>? Backups { get; set; }

    public DataDTO()
    {
    }
}

public class DataSaveDTO
{
    public uint SaveId { get; set; }
    public List<BoxDTO>? SaveBoxes { get; set; }
    public List<PkmSaveDTO>? SavePkms { get; set; }
}

public enum DataDTOType : uint
{
    DATA_DTO = 1
}

public class DataUpdateFlags
{
    public bool MainBoxes;
    public bool MainPkms;
    public bool MainPkmVersions;
    public List<DataUpdateSaveFlags> Saves = [];
    // public bool Actions;
    // public bool Warnings;
    public bool SaveInfos;
    public bool Backups;

    public DataUpdateFlags()
    {
    }
}

public class DataUpdateSaveFlags
{
    public uint SaveId;
    public bool SaveBoxes;
    public bool SavePkms;
}
