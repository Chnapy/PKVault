
using Microsoft.Extensions.DependencyInjection;

namespace PKVault.Core;

/**
 * Data queries related to storage.
 */
public class StorageQueryService(
    IServiceProvider sp,
    PkmLegalityService pkmLegalityService, ISavesLoadersService savesLoadersService
)
{
    public async Task<List<BankDTO>> GetMainBanks()
    {
        using var scope = sp.CreateScope();
        var bankLoader = scope.ServiceProvider.GetRequiredService<IBankLoader>();

        return await bankLoader.GetAllDtos();
    }

    public async Task<Dictionary<string, BankDTO?>> GetMainBanks(string[] ids)
    {
        using var scope = sp.CreateScope();
        var bankLoader = scope.ServiceProvider.GetRequiredService<IBankLoader>();

        return await bankLoader.GetDtosByIds(ids);
    }

    public async Task<List<BoxDTO>> GetMainBoxes()
    {
        using var scope = sp.CreateScope();
        var boxLoader = scope.ServiceProvider.GetRequiredService<IBoxLoader>();

        return await boxLoader.GetAllDtos();
    }

    public async Task<Dictionary<string, BoxDTO?>> GetMainBoxes(string[] ids)
    {
        using var scope = sp.CreateScope();
        var boxLoader = scope.ServiceProvider.GetRequiredService<IBoxLoader>();

        return await boxLoader.GetDtosByIds(ids);
    }

    public async Task<List<PkmVariantDTO>> GetMainPkmVariants()
    {
        using var scope = sp.CreateScope();
        var pkmVariantLoader = scope.ServiceProvider.GetRequiredService<IPkmVariantLoader>();

        return await pkmVariantLoader.GetAllDtos();
    }

    public async Task<Dictionary<string, PkmVariantDTO?>> GetMainPkmVariants(string[] pkmIds)
    {
        using var scope = sp.CreateScope();
        var pkmVariantLoader = scope.ServiceProvider.GetRequiredService<IPkmVariantLoader>();

        return await pkmVariantLoader.GetDtosByIds(pkmIds);
    }

    public async Task<List<BoxDTO>> GetSaveBoxes(uint saveId)
    {
        var saveLoaders = savesLoadersService.GetLoaders(saveId);
        if (saveLoaders == null)
        {
            return [];
        }

        return saveLoaders.Boxes.GetAllDtos();
    }

    public async Task<List<PkmSaveDTO>> GetSavePkms(uint saveId)
    {
        var saveLoaders = savesLoadersService.GetLoaders(saveId);
        if (saveLoaders == null)
        {
            return [];
        }

        return saveLoaders.Pkms.GetAllDtos();
    }

    public async Task<Dictionary<string, PkmSaveDTO?>> GetSavePkms(uint saveId, string[] pkmIds)
    {
        var saveLoaders = savesLoadersService.GetLoaders(saveId);
        if (saveLoaders == null)
        {
            return [];
        }

        return pkmIds.Select(id =>
        {
            var pkmSave = saveLoaders.Pkms.GetDto(id);
            return (id, pkmSave);
        }).ToDictionary();
    }

    public async Task<Dictionary<string, PkmLegalityDTO?>> GetPkmsLegality(string[] pkmIds, uint? saveId)
    {
        using var scope = sp.CreateScope();
        var pkmVariantLoader = scope.ServiceProvider.GetRequiredService<IPkmVariantLoader>();

        var pkmVariants = saveId == null
            ? await pkmVariantLoader.GetEntitiesByIds(pkmIds)
            : [];

        return (await Task.WhenAll(pkmIds.Select(async id =>
        {
            if (saveId == null)
            {
                pkmVariants.TryGetValue(id, out var pkmVariant);

                var attachedSave = pkmVariant?.AttachedSaveId == null
                    ? null
                    : savesLoadersService.GetLoaders((uint)pkmVariant.AttachedSaveId)?.Save;

                return (id, pkmVariant == null
                    ? null
                    : await pkmLegalityService.CreateDTO(pkmVariant, await pkmVariantLoader.GetPKM(pkmVariant), attachedSave)
                );
            }

            var pkmSave = savesLoadersService.GetLoaders((uint)saveId)?.Pkms.GetDto(id);
            return (id, pkmSave == null ? null : pkmLegalityService.CreateDTO(pkmSave));
        }))).ToDictionary();
    }

    public async Task<Dictionary<string, Tuple<string, string>>> GetMainPkmVariantDiff(string pkmVariantId)
    {
        using var scope = sp.CreateScope();
        var pkmVariantLoader = scope.ServiceProvider.GetRequiredService<IPkmVariantLoader>();

        var pkmVariant = await pkmVariantLoader.GetEntityRequired(pkmVariantId);
        var mainPkmVariant = (await pkmVariantLoader.GetEntitiesByBox(pkmVariant.BoxId)).TryGetValue(pkmVariant.BoxSlot, out var pv)
            ? pv.Values.First(p => p.IsMain)
            : null;
        ArgumentNullException.ThrowIfNull(mainPkmVariant);

        var dto1 = await pkmVariantLoader.CreateDTO(mainPkmVariant);
        var dto2 = await pkmVariantLoader.CreateDTO(pkmVariant);

        var legalities = (await GetPkmsLegality([dto1.Id, dto2.Id], null)).Values.ToArray();

        Dictionary<string, Tuple<string, string>> dict = [];

        foreach (var e in ObjectComparer.GetObjectsDiff(dto1, dto2)
            .Where(e => DtoCompareProperties.PkmVariantPropertiesToUse.Contains(e.Key)))
            dict.TryAdd(e.Key, e.Value);

        foreach (var e in ObjectComparer.GetObjectsDiff(legalities[0]!, legalities[1]!)
            .Where(e => DtoCompareProperties.PkmLegalityPropertiesToUse.Contains(e.Key)))
            dict.TryAdd(e.Key, e.Value);

        return dict;
    }
}
