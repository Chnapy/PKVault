public class DataEntityLoaders
{
    public static async Task<DataEntityLoaders> Create(
        IServiceProvider sp,
        ISaveService saveService, SettingsDTO settings, PkmConvertService pkmConvertService,
        Dictionary<ushort, StaticEvolve> evolves
    )
    {
        var saveLoadersDict = new Dictionary<uint, SaveLoaders>();

        var saveById = await saveService.GetSaveCloneById();
        if (saveById.Count > 0)
        {
            saveById.Values.ToList().ForEach((save) =>
            {
                saveLoadersDict.Add(save.Id, new(
                    Save: save,
                    Boxes: new SaveBoxLoader(save, sp),
                    Pkms: new SavePkmLoader(pkmConvertService, language: settings.GetSafeLanguage(), evolves, save)
                ));
            });
        }

        return new()
        {
            saveService = saveService,
            saveLoadersDict = saveLoadersDict
        };
    }

    public required ISaveService saveService;

    public DateTime startTime = DateTime.UtcNow;

    public required Dictionary<uint, SaveLoaders> saveLoadersDict;

    private DataEntityLoaders()
    { }

    public void SetFlags(DataUpdateFlags flags)
    {
        saveLoadersDict.Values.ToList().ForEach(saveLoader =>
        {
            saveLoader.Pkms.SetFlags(flags.Saves);
        });
    }

    public async Task WriteToFiles()
    {
        List<Task> tasks = [];

        foreach (var saveLoaders in saveLoadersDict.Values.ToList())
        {
            if (saveLoaders.Pkms.HasWritten || saveLoaders.Boxes.HasWritten)
            {
                tasks.Add(
                    saveService.WriteSave(saveLoaders.Save)
                );
            }
        }

        await Task.WhenAll(tasks);
    }
}

public record SaveLoaders(
    SaveWrapper Save,
    ISaveBoxLoader Boxes,
    ISavePkmLoader Pkms
);
