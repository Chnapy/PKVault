public class StorageQueryService(LoaderService loaderService)
{
    public async Task<List<BankDTO>> GetMainBanks()
    {
        var memoryLoader = await loaderService.GetLoader();

        return memoryLoader.loaders.bankLoader.GetAllDtos();
    }

    public async Task<Dictionary<string, BankDTO?>> GetMainBanks(string[] ids)
    {
        var memoryLoader = await loaderService.GetLoader();

        return ids.Select(id =>
        {
            var bank = memoryLoader.loaders.bankLoader.GetDto(id);
            return (id, bank);
        }).ToDictionary();
    }

    public async Task<List<BoxDTO>> GetMainBoxes()
    {
        var memoryLoader = await loaderService.GetLoader();

        return memoryLoader.loaders.boxLoader.GetAllDtos();
    }

    public async Task<Dictionary<string, BoxDTO?>> GetMainBoxes(string[] ids)
    {
        var memoryLoader = await loaderService.GetLoader();

        return ids.Select(id =>
        {
            var box = memoryLoader.loaders.boxLoader.GetDto(id);
            return (id, box);
        }).ToDictionary();
    }

    public async Task<List<PkmDTO>> GetMainPkms()
    {
        var memoryLoader = await loaderService.GetLoader();

        return memoryLoader.loaders.pkmLoader.GetAllDtos();
    }

    public async Task<Dictionary<string, PkmDTO?>> GetMainPkms(string[] pkmIds)
    {
        var memoryLoader = await loaderService.GetLoader();

        return pkmIds.Select(id =>
        {
            var pkm = memoryLoader.loaders.pkmLoader.GetDto(id);
            return (id, pkm);
        }).ToDictionary();
    }

    public async Task<List<PkmVersionDTO>> GetMainPkmVersions()
    {
        var memoryLoader = await loaderService.GetLoader();

        return memoryLoader.loaders.pkmVersionLoader.GetAllDtos();
    }

    public async Task<Dictionary<string, PkmVersionDTO?>> GetMainPkmVersions(string[] pkmIds)
    {
        var memoryLoader = await loaderService.GetLoader();

        return pkmIds.Select(id =>
        {
            var pkmVersion = memoryLoader.loaders.pkmVersionLoader.GetDto(id);
            return (id, pkmVersion);
        }).ToDictionary();
    }

    public async Task<List<BoxDTO>> GetSaveBoxes(uint saveId)
    {
        var memoryLoader = await loaderService.GetLoader();

        var saveExists = memoryLoader.loaders.saveLoadersDict.TryGetValue(saveId, out var saveLoaders);
        if (!saveExists)
        {
            return [];
        }

        return saveLoaders.Boxes.GetAllDtos();
    }

    public async Task<List<PkmSaveDTO>> GetSavePkms(uint saveId)
    {
        var memoryLoader = await loaderService.GetLoader();

        var saveExists = memoryLoader.loaders.saveLoadersDict.TryGetValue(saveId, out var saveLoaders);
        if (!saveExists)
        {
            return [];
        }

        return saveLoaders.Pkms.GetAllDtos();
    }

    public async Task<Dictionary<string, PkmSaveDTO?>> GetSavePkms(uint saveId, string[] pkmIds)
    {
        var memoryLoader = await loaderService.GetLoader();

        var saveExists = memoryLoader.loaders.saveLoadersDict.TryGetValue(saveId, out var saveLoaders);
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
        var memoryLoader = await loaderService.GetLoader();

        return pkmIds.Select(id =>
        {
            if (saveId == null)
            {
                var pkmVersion = memoryLoader.loaders.pkmVersionLoader.GetDto(id);
                return (id, pkmVersion == null ? null : new PkmLegalityDTO(pkmVersion));
            }

            var pkmSave = memoryLoader.loaders.saveLoadersDict[(uint)saveId].Pkms.GetDto(id);
            return (id, pkmSave == null ? null : new PkmLegalityDTO(pkmSave));
        }).ToDictionary();
    }
}
