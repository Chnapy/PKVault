using System.Collections.Immutable;

public interface ISavesLoadersService
{
    public List<SaveLoadersRecord> GetAllLoaders();
    public SaveLoadersRecord? GetLoaders(uint saveId);
    public Task Setup();
    public void SetFlags(DataUpdateFlags flags);
    public void Clear();
    public Task WriteToFiles();
}

public class SavesLoadersService(
    IServiceProvider sp,
    ISaveService saveService
) : ISavesLoadersService
{
    private ImmutableDictionary<uint, SaveLoadersRecord> Loaders = [];

    public List<SaveLoadersRecord> GetAllLoaders() => [.. Loaders.Values];

    public SaveLoadersRecord? GetLoaders(uint saveId)
    {
        if (!Loaders.TryGetValue(saveId, out var loaders))
        {
            return null;
        }
        return loaders;
    }

    public async Task Setup()
    {
        using var scope = sp.CreateScope();
        var settingsService = scope.ServiceProvider.GetRequiredService<ISettingsService>();
        var staticDataService = scope.ServiceProvider.GetRequiredService<StaticDataService>();
        var pkmConvertService = scope.ServiceProvider.GetRequiredService<PkmConvertService>();

        var staticData = await staticDataService.GetStaticData();

        var language = settingsService.GetSettings().GetSafeLanguage();

        var savesById = await saveService.GetSaveCloneById();

        Loaders = savesById.Values.Select(save =>
        {
            var boxLoader = new SaveBoxLoader(save, sp);
            var pkmLoader = new SavePkmLoader(pkmConvertService, language, staticData.Evolves, save);

            return new SaveLoadersRecord(save, boxLoader, pkmLoader);
        }).ToImmutableDictionary(
            l => l.Save.Id
        );
    }

    public void SetFlags(DataUpdateFlags flags)
    {
        Loaders.Values.ToList().ForEach(saveLoader =>
        {
            saveLoader.Pkms.SetFlags(flags.Saves, flags.Dex);
        });
    }

    public void Clear()
    {
        Loaders = [];
    }

    public async Task WriteToFiles()
    {
        using var _ = LogUtil.Time($"SavesLoadersService.WriteToFiles");

        List<Task> tasks = [];

        foreach (var loaders in Loaders.Values.ToList())
        {
            if (loaders.Pkms.HasWritten || loaders.Boxes.HasWritten)
            {
                tasks.Add(
                    saveService.WriteSave(loaders.Save)
                );
            }
        }

        await Task.WhenAll(tasks);
    }
}

public record SaveLoadersRecord(
    SaveWrapper Save,
    ISaveBoxLoader Boxes,
    ISavePkmLoader Pkms
);
