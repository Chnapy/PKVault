/**
 * Data response after action, providing only data mutated.
 */
public class DataService(
    ISessionService sessionService, StorageQueryService storageQueryService, StaticDataService staticDataService,
    WarningsService warningsService, DexService dexService, ISaveService saveService,
    BackupService backupService, ISettingsService settingsService
)
{
    public async Task<DataDTO> CreateDataFromUpdateFlags(DataUpdateFlags flags)
    {
        using var _ = LogUtil.Time("Prepare global data payload");

        var staticDataTask = GetPossibleStaticData(flags.StaticData);

        // Note: should be done first since it may be used by pkm-version
        var warningsTask = GetPossibleWarnings(flags.Warnings);

        var dexTask = GetPossibleDex(flags.Dex);

        var mainBanksTask = GetPossibleMainBanks(flags.MainBanks);
        var mainBoxesTask = GetPossibleMainBoxes(flags.MainBoxes);
        var mainPkmVariantsTask = GetPossibleMainPkmVariants(flags.MainPkmVariants);
        var mainPkmLegalitiesTask = GetPossibleMainPkmLegalities(mainPkmVariantsTask);

        var savesTask = Task.WhenAll(flags.Saves.GetSaves().Select(async flag =>
        {
            var saveBoxesTask = GetPossibleSaveBoxes(flag.SaveId, flag.SaveBoxes);
            var savePkmsTask = GetPossibleSavePkms(flag.SaveId, flag.SavePkms);
            var savePkmLegalitiesTask = GetPossibleSaveLegalities(flag.SaveId, savePkmsTask);

            return new DataSaveDTO(
                SaveId: flag.SaveId,
                SaveBoxes: await saveBoxesTask,
                SavePkms: await savePkmsTask,
                SavePkmLegality: await savePkmLegalitiesTask
            );
        }));

        var saveInfosTask = GetPossibleSaveInfos(flags.SaveInfos);

        var backups = flags.Backups
            ? backupService.GetBackupList()
            : null;

        // using (var w = LogUtil.Time("warningsTask"))
        // {
        //     await warningsTask;
        // }

        // using (var w = LogUtil.Time("staticDataTask"))
        // {
        //     await staticDataTask;
        // }

        // using (var w = LogUtil.Time("mainBanksTask"))
        // {
        //     await mainBanksTask;
        // }

        // using (var w = LogUtil.Time("mainBoxesTask"))
        // {
        //     await mainBoxesTask;
        // }

        // using (var w = LogUtil.Time("mainPkmVariantsTask"))
        // {
        //     await mainPkmVariantsTask;
        // }

        // using (var w = LogUtil.Time("mainPkmLegalitiesTask"))
        // {
        //     await mainPkmLegalitiesTask;
        // }

        // using (var w = LogUtil.Time("savesTask"))
        // {
        //     await savesTask;
        // }

        // using (var w = LogUtil.Time("saveInfosTask"))
        // {
        //     await saveInfosTask;
        // }

        // using (var w = LogUtil.Time("dexTask"))
        // {
        //     await dexTask;
        // }

        var dto = new DataDTO(
            Warnings: await warningsTask,
            Settings: settingsService.GetSettings(),
            Actions: sessionService.GetActionPayloadList(),
            StaticData: await staticDataTask,
            MainBanks: await mainBanksTask,
            MainBoxes: await mainBoxesTask,
            MainPkmVariants: await mainPkmVariantsTask,
            MainPkmLegalities: await mainPkmLegalitiesTask,
            Saves: [.. await savesTask],
            InvalidateAllSaves: flags.Saves.All,
            SaveInfos: await saveInfosTask,
            Backups: backups,
            Dex: await dexTask
        );

        // time = LogUtil.Time("Response serialization");
        // var json = System.Text.Json.JsonSerializer.Serialize(dto);
        // time();

        // Console.WriteLine($"Response counts, MainBoxes={dto.MainBoxes?.Count} MainPkms={dto.MainPkms?.Count} MainPkmVariants={dto.MainPkmVariants?.Count} Dex={dto.Dex?.Count}");

        return dto;
    }

    private async Task<StaticDataDTO?> GetPossibleStaticData(bool flag)
    {
        if (!flag)
        {
            return null;
        }

        return await staticDataService.GetStaticData();
    }

    private async Task<WarningsDTO?> GetPossibleWarnings(bool flag)
    {
        if (!flag)
        {
            return null;
        }

        return await warningsService.CheckWarnings();
    }

    private async Task<DataDTOState<Dictionary<ushort, Dictionary<uint, DexItemDTO>>>?> GetPossibleDex(DataUpdateFlagsState flag)
    {
        if (flag.All)
        {
            return new(
                All: true,
                Data: await dexService.GetDex(null)
            );
        }

        if (flag.Ids.Count > 0)
        {
            return new(
                All: false,
                Data: await dexService.GetDex([.. flag.Ids.Select(ushort.Parse)])
            );
        }

        return null;
    }

    private async Task<DataDTOState<Dictionary<string, BankDTO?>>?> GetPossibleMainBanks(DataUpdateFlagsState flag)
    {
        if (flag.All)
        {
            return new(
                All: true,
                Data: (await storageQueryService.GetMainBanks())
                        .ToDictionary(dto => dto.Id, dto => dto ?? null)
            );
        }

        if (flag.Ids.Count > 0)
        {
            return new(
                All: false,
                Data: await storageQueryService.GetMainBanks([.. flag.Ids])
            );
        }

        return null;
    }

    private async Task<DataDTOState<Dictionary<string, BoxDTO?>>?> GetPossibleMainBoxes(DataUpdateFlagsState flag)
    {
        if (flag.All)
        {
            return new(
                All: true,
                Data: (await storageQueryService.GetMainBoxes())
                        .ToDictionary(dto => dto.Id, dto => dto ?? null)
            );
        }

        if (flag.Ids.Count > 0)
        {
            return new(
                All: false,
                Data: await storageQueryService.GetMainBoxes([.. flag.Ids])
            );
        }

        return null;
    }

    private async Task<DataDTOState<Dictionary<string, PkmVariantDTO?>>?> GetPossibleMainPkmVariants(DataUpdateFlagsState flag)
    {
        if (flag.All)
        {
            return new(
                All: true,
                Data: (await storageQueryService.GetMainPkmVariants())
                        .ToDictionary(dto => dto.Id, dto => dto ?? null)
            );
        }

        if (flag.Ids.Count > 0)
        {
            return new(
                All: false,
                Data: await storageQueryService.GetMainPkmVariants([.. flag.Ids])
            );
        }

        return null;
    }

    private async Task<DataDTOState<Dictionary<string, PkmLegalityDTO?>>?> GetPossibleMainPkmLegalities(
        Task<DataDTOState<Dictionary<string, PkmVariantDTO?>>?> mainPkmVariantsTask
    )
    {
        var mainPkmVariants = await mainPkmVariantsTask;

        if (mainPkmVariants != null)
        {
            return new(
                All: mainPkmVariants.All,
                Data: await storageQueryService.GetPkmsLegality(
                    [.. mainPkmVariants.Data.Keys], null
                )
            );
        }

        return null;
    }

    private async Task<List<BoxDTO>?> GetPossibleSaveBoxes(uint saveId, bool flag)
    {
        if (!flag)
        {
            return null;
        }

        return await storageQueryService.GetSaveBoxes(saveId);
    }

    private async Task<DataDTOState<Dictionary<string, PkmSaveDTO?>>?> GetPossibleSavePkms(uint saveId, DataUpdateFlagsState flag)
    {
        if (flag.All)
        {
            return new(
                All: true,
                Data: (await storageQueryService.GetSavePkms(saveId))
                        .Select(dto => (dto.Id, dto ?? null)).ToDictionary()
            );
        }

        if (flag.Ids.Count > 0)
        {
            return new(
                All: false,
                Data: await storageQueryService.GetSavePkms(saveId, [.. flag.Ids])
            );
        }

        return null;
    }

    private async Task<DataDTOState<Dictionary<string, PkmLegalityDTO?>>?> GetPossibleSaveLegalities(uint saveId,
        Task<DataDTOState<Dictionary<string, PkmSaveDTO?>>?> savePkmsTask
    )
    {
        var savePkms = await savePkmsTask;

        if (savePkms != null)
        {
            return new(
                All: savePkms.All,
                Data: await storageQueryService.GetPkmsLegality(
                    [.. savePkms.Data.Keys], saveId
                )
            );
        }

        return null;
    }

    private async Task<Dictionary<uint, SaveInfosDTO>?> GetPossibleSaveInfos(bool flag)
    {
        if (!flag)
        {
            return null;
        }

        return await saveService.GetAllSaveInfos();
    }
}
