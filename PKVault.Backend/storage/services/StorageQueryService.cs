/**
 * Data queries related to storage.
 */
public class StorageQueryService(
    IServiceProvider sp,
    ILoadersService loadersService, PkmLegalityService pkmLegalityService
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

        return (await Task.WhenAll(ids.Select(async id =>
        {
            var bank = await bankLoader.GetDto(id);
            return (id, bank);
        }))).ToDictionary();
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

        return (await Task.WhenAll(ids.Select(async id =>
        {
            var box = await boxLoader.GetDto(id);
            return (id, box);
        }))).ToDictionary();
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

        return (await Task.WhenAll(pkmIds.Select(async id =>
        {
            var pkmVersion = await pkmVersionLoader.GetDto(id);
            return (id, pkmVersion);
        }))).ToDictionary();
    }

    public async Task<List<BoxDTO>> GetSaveBoxes(uint saveId)
    {
        var loaders = await loadersService.GetLoaders();

        var saveExists = loaders.saveLoadersDict.TryGetValue(saveId, out var saveLoaders);
        if (!saveExists)
        {
            return [];
        }

        return saveLoaders.Boxes.GetAllDtos();
    }

    public async Task<List<PkmSaveDTO>> GetSavePkms(uint saveId)
    {
        var loaders = await loadersService.GetLoaders();

        var saveExists = loaders.saveLoadersDict.TryGetValue(saveId, out var saveLoaders);
        if (!saveExists)
        {
            return [];
        }

        return saveLoaders.Pkms.GetAllDtos();
    }

    public async Task<Dictionary<string, PkmSaveDTO?>> GetSavePkms(uint saveId, string[] pkmIds)
    {
        var loaders = await loadersService.GetLoaders();

        var saveExists = loaders.saveLoadersDict.TryGetValue(saveId, out var saveLoaders);
        if (!saveExists)
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
        var loaders = await loadersService.GetLoaders();

        return (await Task.WhenAll(pkmIds.Select(async id =>
        {
            if (saveId == null)
            {
                var pkmVersion = await pkmVersionLoader.GetDto(id);
                return (id, pkmVersion == null ? null : pkmLegalityService.CreateDTO(pkmVersion));
            }

            var pkmSave = loaders.saveLoadersDict[(uint)saveId].Pkms.GetDto(id);
            return (id, pkmSave == null ? null : pkmLegalityService.CreateDTO(pkmSave));
        }))).ToDictionary();
    }
}
