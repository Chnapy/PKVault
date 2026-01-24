/**
 * Warnings checks in current session data.
 */
public class WarningsService(
    IServiceProvider sp,
    ILoadersService loadersService, ISaveService saveService, IFileIOService fileIOService
)
{
    private WarningsDTO? WarningsDTO = null;

    public async Task<WarningsDTO> GetWarningsDTO()
    {
        if (WarningsDTO == null)
        {
            return await CheckWarnings();
        }

        return WarningsDTO;
    }

    public async Task<WarningsDTO> CheckWarnings()
    {
        var logtime = LogUtil.Time($"Warnings check");

        var saveChangedWarnings = CheckSaveChangedWarnings();
        var pkmVersionWarnings = CheckPkmVersionWarnings();
        var saveDuplicateWarnings = CheckSaveDuplicates();

        WarningsDTO = new(
            SaveChangedWarnings: await saveChangedWarnings,
            PkmVersionWarnings: await pkmVersionWarnings,
            SaveDuplicateWarnings: await saveDuplicateWarnings
        );

        logtime();

        return WarningsDTO;
    }

    private async Task<List<SaveChangedWarning>> CheckSaveChangedWarnings()
    {
        var warns = new List<SaveChangedWarning>();

        var loaders = await loadersService.GetLoaders();

        var startTime = loaders.startTime;

        if (loaders.saveLoadersDict.Count == 0)
        {
            return [];
        }

        var saveByPath = await saveService.GetSaveByPath();

        return [.. loaders.saveLoadersDict.Values
            .Where(saveLoaders => saveLoaders.Boxes.HasWritten || saveLoaders.Pkms.HasWritten)
            .Where(saveLoaders =>
            {
                var path = saveByPath.Keys.ToList().Find(path => saveByPath[path].Id == saveLoaders.Save.Id);
                if (path == default)
                {
                    throw new KeyNotFoundException($"Path not found for given save {saveLoaders.Save.Id}");
                }

                var lastWriteTime = fileIOService.GetLastWriteTimeUtc(path);
                // Console.WriteLine($"Check save {saveLoaders.Save.ID32} to {path}.\nWrite-time from {lastWriteTime} to {startTime}.");
                return lastWriteTime > startTime;
            })
            .Select(saveLoaders => new SaveChangedWarning( SaveId: saveLoaders.Save.Id ))];
    }

    private async Task<List<PkmVersionWarning>> CheckPkmVersionWarnings()
    {
        using var scope = sp.CreateScope();
        var pkmVersionLoader = scope.ServiceProvider.GetRequiredService<IPkmVersionLoader>();

        var warns = new List<PkmVersionWarning>();

        var loaders = await loadersService.GetLoaders();

        var pkms = pkmVersionLoader.GetAllEntities();

        var tasks = pkms.Values.Select(pkmVersion =>
        {
            if (pkmVersion.AttachedSaveId != default)
            {
                var exists = loaders.saveLoadersDict.TryGetValue((uint)pkmVersion.AttachedSaveId!, out var saveLoader);
                if (!exists)
                {
                    return new PkmVersionWarning(
                        PkmVersionId: pkmVersion.Id
                    );
                }

                var save = saveLoader.Save;
                var generation = save.Generation;

                var savePkm = saveLoader.Pkms.GetDtosByIdBase(pkmVersion.AttachedSavePkmIdBase ?? "");

                if (savePkm == null)
                {
                    Console.WriteLine($"Pkm-version warning");

                    return new PkmVersionWarning(
                        PkmVersionId: pkmVersion.Id
                    );
                }
            }
            return null;
        });

        return [.. tasks
            .Where(value => value != null)
            .OfType<PkmVersionWarning>()];
    }

    private async Task<List<SaveDuplicateWarning>> CheckSaveDuplicates()
    {
        var loaders = await loadersService.GetLoaders();

        if (loaders.saveLoadersDict.Count == 0)
        {
            return [];
        }

        var saveByPath = await saveService.GetSaveByPath();

        var tasks = loaders.saveLoadersDict.Values.Select(async (saveLoader) =>
        {
            var paths = saveByPath.ToList()
                .FindAll(entry => entry.Value.Id == saveLoader.Save.Id)
                .Select(entry => entry.Key);

            return new SaveDuplicateWarning(
                SaveId: saveLoader.Save.Id,
                Paths: [.. paths]
            );
        });

        return (await Task.WhenAll(tasks)).ToList().FindAll(warn => warn.Paths.Length > 1);
    }
}
