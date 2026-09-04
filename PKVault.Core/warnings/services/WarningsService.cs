
using Microsoft.Extensions.DependencyInjection;
using Serilog;

namespace PKVault.Core;

/**
 * Warnings checks in current session data.
 */
public class WarningsService(
    IServiceProvider sp,
    IFileIOService fileIOService, ISessionService sessionService, ISavesLoadersService savesLoadersService
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
        using var _ = Log.Logger.Time($"Warnings check");

        var saveChangedWarnings = CheckSaveChangedWarnings();
        var pkmVariantWarnings = CheckPkmVariantWarnings();

        WarningsDTO = new(
            SaveChangedWarnings: await saveChangedWarnings,
            PkmVariantWarnings: await pkmVariantWarnings
        );

        return WarningsDTO;
    }

    private async Task<List<SaveChangedWarning>> CheckSaveChangedWarnings()
    {
        var warns = new List<SaveChangedWarning>();

        var startTime = sessionService.StartTime;

        var savesLoaders = savesLoadersService.GetAllLoaders();

        if (savesLoaders.Length == 0)
        {
            return [];
        }

        return [.. savesLoaders
            .Where(saveLoaders => saveLoaders.Boxes.HasWritten || saveLoaders.Pkms.HasWritten)
            .Where(saveLoaders =>
            {
                var path = saveLoaders.Save.Metadata.FilePath;
                ArgumentException.ThrowIfNullOrWhiteSpace(path);

                var lastWriteTime = fileIOService.GetLastWriteTimeUtc(path);
                // log.LogInformation($"Check save {saveLoaders.Save.ID32} to {path}.\nWrite-time from {lastWriteTime} to {startTime}.");
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

            var savePkms = saveLoader.Pkms.GetDtosByIdBase(attachedPkmVariant.AttachedSavePkmIdBase ?? "");

            if (savePkms.Count == 0)
            {
                // log.LogInformation($"Pkm-version warning");

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
}
