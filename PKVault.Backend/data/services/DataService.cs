public class DataService(
    LoadersService loadersService, StorageQueryService storageQueryService, StaticDataService staticDataService,
    WarningsService warningsService, DexService dexService, SaveService saveService,
    BackupService backupService, SettingsService settingsService
)
{
    public async Task<DataDTO> CreateDataFromUpdateFlags(DataUpdateFlags flags)
    {
        var time = LogUtil.Time("Prepare global data payload");

        var staticDataTask = Task.Run(async () => flags.StaticData
            ? await staticDataService.GetStaticData()
            : null);

        // Note: should be done first since it may be used by pkm-version
        var warningsTask = Task.Run(() => flags.Warnings
            ? warningsService.CheckWarnings()
            : null);

        var dexTask = Task.Run(async () => flags.Dex
            ? await dexService.GetDex()
            : null);

        var mainBanksTask = Task.Run<DataDTOState<Dictionary<string, BankDTO?>>?>(async () =>
        {
            if (flags.MainBanks.All)
            {
                return new(
                    All: true,
                    Data: (await storageQueryService.GetMainBanks())
                            .Select(dto => (dto.Id, dto ?? null)).ToDictionary()
                );
            }

            if (flags.MainBanks.Ids.Count > 0)
            {
                return new(
                    All: false,
                    Data: await storageQueryService.GetMainBanks([.. flags.MainBanks.Ids])
                );
            }

            return null;
        });

        var mainBoxesTask = Task.Run<DataDTOState<Dictionary<string, BoxDTO?>>?>(async () =>
        {
            if (flags.MainBoxes.All)
            {
                return new(
                    All: true,
                    Data: (await storageQueryService.GetMainBoxes())
                            .Select(dto => (dto.Id, dto ?? null)).ToDictionary()
                );
            }

            if (flags.MainBoxes.Ids.Count > 0)
            {
                return new(
                    All: false,
                    Data: await storageQueryService.GetMainBoxes([.. flags.MainBoxes.Ids])
                );
            }

            return null;
        });

        var mainPkmsTask = Task.Run<DataDTOState<Dictionary<string, PkmDTO?>>?>(async () =>
        {
            if (flags.MainPkms.All)
            {
                return new(
                    All: true,
                    Data: (await storageQueryService.GetMainPkms())
                            .Select(dto => (dto.Id, dto ?? null)).ToDictionary()
                );
            }

            if (flags.MainPkms.Ids.Count > 0)
            {
                return new(
                    All: false,
                    Data: await storageQueryService.GetMainPkms([.. flags.MainPkms.Ids])
                );
            }

            return null;
        });

        var mainPkmVersionsTask = Task.Run<DataDTOState<Dictionary<string, PkmVersionDTO?>>?>(async () =>
        {
            if (flags.MainPkmVersions.All)
            {
                return new(
                    All: true,
                    Data: (await storageQueryService.GetMainPkmVersions())
                            .Select(dto => (dto.Id, dto ?? null)).ToDictionary()
                );
            }

            if (flags.MainPkmVersions.Ids.Count > 0)
            {
                return new(
                    All: false,
                    Data: await storageQueryService.GetMainPkmVersions([.. flags.MainPkmVersions.Ids])
                );
            }

            return null;
        });

        var mainPkmLegalitiesTask = Task.Run<DataDTOState<Dictionary<string, PkmLegalityDTO?>>?>(async () =>
        {
            var mainPkmVersions = await mainPkmVersionsTask;

            if (mainPkmVersions != null)
            {
                return new(
                    All: mainPkmVersions.All,
                    Data: await storageQueryService.GetPkmsLegality(
                        [.. mainPkmVersions.Data.Keys], null
                    )
                );
            }

            return null;
        });

        var savesTask = Task.WhenAll(flags.Saves.GetSaves().Select(async saveData =>
        {
            var saveBoxesTask = Task.Run(async () => saveData.SaveBoxes
                ? await storageQueryService.GetSaveBoxes(saveData.SaveId)
                : null);

            var savePkmsTask = Task.Run<DataDTOState<Dictionary<string, PkmSaveDTO?>>?>(async () =>
            {
                if (saveData.SavePkms.All)
                {
                    return new(
                        All: true,
                        Data: (await storageQueryService.GetSavePkms(saveData.SaveId))
                                .Select(dto => (dto.Id, dto ?? null)).ToDictionary()
                    );
                }

                if (saveData.SavePkms.Ids.Count > 0)
                {
                    return new(
                        All: false,
                        Data: await storageQueryService.GetSavePkms(saveData.SaveId, [.. saveData.SavePkms.Ids])
                    );
                }

                return null;
            });

            var savePkmLegalitiesTask = Task.Run<DataDTOState<Dictionary<string, PkmLegalityDTO?>>?>(async () =>
            {
                var savePkms = await savePkmsTask;

                if (savePkms != null)
                {
                    return new(
                        All: savePkms.All,
                        Data: await storageQueryService.GetPkmsLegality(
                            [.. savePkms.Data.Keys], saveData.SaveId
                        )
                    );
                }

                return null;
            });

            return new DataSaveDTO(
                SaveId: saveData.SaveId,
                SaveBoxes: await saveBoxesTask,
                SavePkms: await savePkmsTask,
                SavePkmLegality: await savePkmLegalitiesTask
            );
        }));

        var saveInfosTask = Task.Run(async () => flags.SaveInfos
            ? await saveService.GetAllSaveInfos()
            : null);

        var backups = flags.Backups
            ? backupService.GetBackupList()
            : null;

        await warningsTask;

        var dto = new DataDTO(
            Warnings: await warningsService.GetWarningsDTO(),
            Settings: settingsService.GetSettings(),
            Actions: loadersService.GetActionPayloadList(),
            StaticData: await staticDataTask,
            MainBanks: await mainBanksTask,
            MainBoxes: await mainBoxesTask,
            MainPkms: await mainPkmsTask,
            MainPkmVersions: await mainPkmVersionsTask,
            MainPkmLegalities: await mainPkmLegalitiesTask,
            Saves: [.. await savesTask],
            InvalidateAllSaves: flags.Saves.All,
            SaveInfos: await saveInfosTask,
            Backups: backups,
            Dex: await dexTask
        );

        time();

        // time = LogUtil.Time("Response serialization");
        // var json = System.Text.Json.JsonSerializer.Serialize(dto);
        // time();

        // Console.WriteLine($"Response counts, MainBoxes={dto.MainBoxes?.Count} MainPkms={dto.MainPkms?.Count} MainPkmVersions={dto.MainPkmVersions?.Count} Dex={dto.Dex?.Count}");

        return dto;
    }
}
