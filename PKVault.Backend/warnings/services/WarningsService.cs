/**
 * Warnings checks in current session data.
 */
public class WarningsService(
    IServiceProvider sp,
    ISaveService saveService, IFileIOService fileIOService,
    ISessionService sessionService, ISavesLoadersService savesLoadersService
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
        using var _ = LogUtil.Time($"Warnings check");

        var saveChangedWarnings = CheckSaveChangedWarnings();
        var pkmVariantWarnings = CheckPkmVariantWarnings();
        var saveDuplicateWarnings = CheckSaveDuplicates();

        WarningsDTO = new(
            SaveChangedWarnings: await saveChangedWarnings,
            PkmVariantWarnings: await pkmVariantWarnings,
            SaveDuplicateWarnings: await saveDuplicateWarnings
        );

        return WarningsDTO;
    }

    private async Task<List<SaveChangedWarning>> CheckSaveChangedWarnings()
    {
        var warns = new List<SaveChangedWarning>();

        var startTime = sessionService.StartTime;

        var savesLoaders = savesLoadersService.GetAllLoaders();

        if (savesLoaders.Count == 0)
        {
            return [];
        }

        var saveByPath = await saveService.GetSaveByPath();

        return [.. savesLoaders
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

    private async Task<List<PkmVariantWarning>> CheckPkmVariantWarnings()
    {
        using var scope = sp.CreateScope();
        var pkmVariantLoader = scope.ServiceProvider.GetRequiredService<IPkmVariantLoader>();

        var warns = new List<PkmVariantWarning>();

        var attachedPkmVariants = await pkmVariantLoader.GetEntitiesAttached();

        var tasks = attachedPkmVariants.Values.Select(attachedPkmVariant =>
        {
            var saveLoader = savesLoadersService.GetLoaders((uint)attachedPkmVariant.AttachedSaveId!);
            if (saveLoader == null)
            {
                return new PkmVariantWarning(
                    PkmVariantId: attachedPkmVariant.Id
                );
            }

            var save = saveLoader.Save;
            var generation = save.Generation;

            var savePkm = saveLoader.Pkms.GetDtosByIdBase(attachedPkmVariant.AttachedSavePkmIdBase ?? "");

            if (savePkm == null)
            {
                Console.WriteLine($"Pkm-version warning");

                return new PkmVariantWarning(
                    PkmVariantId: attachedPkmVariant.Id
                );
            }
            return null;
        });

        return [.. tasks
            .Where(value => value != null)
            .OfType<PkmVariantWarning>()];
    }

    private async Task<List<SaveDuplicateWarning>> CheckSaveDuplicates()
    {
        var savesLoaders = savesLoadersService.GetAllLoaders();

        if (savesLoaders.Count == 0)
        {
            return [];
        }

        var saveByPath = await saveService.GetSaveByPath();

        var tasks = savesLoaders.Select(async (saveLoader) =>
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
