public class StorageQueryService(LoaderService loaderService)
{
    public async Task<List<BankDTO>> GetMainBanks()
    {
        var memoryLoader = await loaderService.GetLoader();

        return memoryLoader.loaders.bankLoader.GetAllDtos();
    }

    public async Task<List<BoxDTO>> GetMainBoxes()
    {
        var memoryLoader = await loaderService.GetLoader();

        return memoryLoader.loaders.boxLoader.GetAllDtos();
    }

    public async Task<List<PkmDTO>> GetMainPkms()
    {
        var memoryLoader = await loaderService.GetLoader();

        return memoryLoader.loaders.pkmLoader.GetAllDtos();
    }

    public async Task<List<PkmVersionDTO>> GetMainPkmVersions()
    {
        var memoryLoader = await loaderService.GetLoader();

        return memoryLoader.loaders.pkmVersionLoader.GetAllDtos();
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
}
