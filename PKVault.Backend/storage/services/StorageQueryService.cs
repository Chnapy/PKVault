/**
 * Data queries related to storage.
 */
public class StorageQueryService(LoadersService loadersService)
{
    public async Task<List<BankDTO>> GetMainBanks()
    {
        var loaders = await loadersService.GetLoaders();

        return loaders.bankLoader.GetAllDtos();
    }

    public async Task<Dictionary<string, BankDTO?>> GetMainBanks(string[] ids)
    {
        var loaders = await loadersService.GetLoaders();

        return ids.Select(id =>
        {
            var bank = loaders.bankLoader.GetDto(id);
            return (id, bank);
        }).ToDictionary();
    }

    public async Task<List<BoxDTO>> GetMainBoxes()
    {
        var loaders = await loadersService.GetLoaders();

        return loaders.boxLoader.GetAllDtos();
    }

    public async Task<Dictionary<string, BoxDTO?>> GetMainBoxes(string[] ids)
    {
        var loaders = await loadersService.GetLoaders();

        return ids.Select(id =>
        {
            var box = loaders.boxLoader.GetDto(id);
            return (id, box);
        }).ToDictionary();
    }

    public async Task<List<PkmDTO>> GetMainPkms()
    {
        var loaders = await loadersService.GetLoaders();

        return loaders.pkmLoader.GetAllDtos();
    }

    public async Task<Dictionary<string, PkmDTO?>> GetMainPkms(string[] pkmIds)
    {
        var loaders = await loadersService.GetLoaders();

        return pkmIds.Select(id =>
        {
            var pkm = loaders.pkmLoader.GetDto(id);
            return (id, pkm);
        }).ToDictionary();
    }

    public async Task<List<PkmVersionDTO>> GetMainPkmVersions()
    {
        var loaders = await loadersService.GetLoaders();

        return loaders.pkmVersionLoader.GetAllDtos();
    }

    public async Task<Dictionary<string, PkmVersionDTO?>> GetMainPkmVersions(string[] pkmIds)
    {
        var loaders = await loadersService.GetLoaders();

        return pkmIds.Select(id =>
        {
            var pkmVersion = loaders.pkmVersionLoader.GetDto(id);
            return (id, pkmVersion);
        }).ToDictionary();
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
        var loaders = await loadersService.GetLoaders();

        return pkmIds.Select(id =>
        {
            if (saveId == null)
            {
                var pkmVersion = loaders.pkmVersionLoader.GetDto(id);
                return (id, pkmVersion == null ? null : new PkmLegalityDTO(pkmVersion));
            }

            var pkmSave = loaders.saveLoadersDict[(uint)saveId].Pkms.GetDto(id);
            return (id, pkmSave == null ? null : new PkmLegalityDTO(pkmSave));
        }).ToDictionary();
    }
}
