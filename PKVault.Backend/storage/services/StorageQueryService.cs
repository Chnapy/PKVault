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

    public async Task<List<PkmVersionDTO>> GetMainPkmVersions()
    {
        using var scope = sp.CreateScope();
        var pkmVersionLoader = scope.ServiceProvider.GetRequiredService<IPkmVersionLoader>();

        return await pkmVersionLoader.GetAllDtos();
    }

    public async Task<Dictionary<string, PkmVersionDTO?>> GetMainPkmVersions(string[] pkmIds)
    {
        using var scope = sp.CreateScope();
        var pkmVersionLoader = scope.ServiceProvider.GetRequiredService<IPkmVersionLoader>();

        return await pkmVersionLoader.GetDtosByIds(pkmIds);
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
        var pkmVersionLoader = scope.ServiceProvider.GetRequiredService<IPkmVersionLoader>();

        var pkmVersions = saveId == null
            ? await pkmVersionLoader.GetEntitiesByIds(pkmIds)
            : [];

        return (await Task.WhenAll(pkmIds.Select(async id =>
        {
            if (saveId == null)
            {
                pkmVersions.TryGetValue(id, out var pkmVersion);

                return (id, pkmVersion == null
                    ? null
                    : await pkmLegalityService.CreateDTO(pkmVersion, await pkmVersionLoader.GetPKM(pkmVersion))
                );
            }

            var pkmSave = savesLoadersService.GetLoaders((uint)saveId).Pkms.GetDto(id);
            return (id, pkmSave == null ? null : pkmLegalityService.CreateDTO(pkmSave));
        }))).ToDictionary();
    }
}
