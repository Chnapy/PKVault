using Microsoft.Extensions.FileSystemGlobbing;
using Microsoft.Extensions.FileSystemGlobbing.Abstractions;
using PKHeX.Core;

public class StorageService(IServiceProvider sp)
{
    private readonly SemaphoreSlim _setupLock = new(1, 1);
    private Task? SetupTask;
    private DataMemoryLoader? _memoryLoader;

    public async Task<DataMemoryLoader> GetLoader()
    {
        if (_memoryLoader == null)
            await WaitForSetup();
        return _memoryLoader ?? throw new InvalidOperationException("Loader not initialized");
    }

    public async Task WaitForSetup()
    {
        await _setupLock.WaitAsync();
        try
        {
            SetupTask ??= Task.Run(Setup);
        }
        finally
        {
            _setupLock.Release();
        }

        await SetupTask;
    }

    private async Task Setup()
    {
        using var scope = sp.CreateScope();

        await scope.ServiceProvider.GetRequiredService<StaticDataService>().GetStaticData();
        await DataSetupMigrateClean();
        try
        {
            scope.ServiceProvider.GetRequiredService<LocalSaveService>().ReadLocalSaves();
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine(ex);
        }
        await ResetDataLoader(true);
        await scope.ServiceProvider.GetRequiredService<WarningsService>().CheckWarnings();
    }

    public async Task<List<BankDTO>> GetMainBanks()
    {
        var memoryLoader = await GetLoader();

        return memoryLoader.loaders.bankLoader.GetAllDtos();
    }

    public async Task<List<BoxDTO>> GetMainBoxes()
    {
        var memoryLoader = await GetLoader();

        return memoryLoader.loaders.boxLoader.GetAllDtos();
    }

    public async Task<List<PkmDTO>> GetMainPkms()
    {
        var memoryLoader = await GetLoader();

        return memoryLoader.loaders.pkmLoader.GetAllDtos();
    }

    public async Task<List<PkmVersionDTO>> GetMainPkmVersions()
    {
        var memoryLoader = await GetLoader();

        return memoryLoader.loaders.pkmVersionLoader.GetAllDtos();
    }

    public async Task<List<BoxDTO>> GetSaveBoxes(uint saveId)
    {
        var memoryLoader = await GetLoader();

        var saveExists = memoryLoader.loaders.saveLoadersDict.TryGetValue(saveId, out var saveLoaders);
        if (!saveExists)
        {
            return [];
        }

        return saveLoaders.Boxes.GetAllDtos();
    }

    public async Task<List<PkmSaveDTO>> GetSavePkms(uint saveId)
    {
        var memoryLoader = await GetLoader();

        var saveExists = memoryLoader.loaders.saveLoadersDict.TryGetValue(saveId, out var saveLoaders);
        if (!saveExists)
        {
            return [];
        }

        return saveLoaders.Pkms.GetAllDtos();
    }

    public async Task<DataUpdateFlags> MainCreateBox(string bankId)
    {
        return await AddAction(
            new MainCreateBoxAction(bankId, null)
        );
    }

    public async Task<DataUpdateFlags> MainUpdateBox(string boxId, string boxName, int order, string bankId, int slotCount, BoxType type)
    {
        return await AddAction(
            new MainUpdateBoxAction(boxId, boxName, order, bankId, slotCount, type)
        );
    }

    public async Task<DataUpdateFlags> MainDeleteBox(string boxId)
    {
        return await AddAction(
            new MainDeleteBoxAction(boxId)
        );
    }

    public async Task<DataUpdateFlags> MainCreateBank()
    {
        return await AddAction(
            new MainCreateBankAction()
        );
    }

    public async Task<DataUpdateFlags> MainUpdateBank(string bankId, string bankName, bool isDefault, int order, BankEntity.BankView view)
    {
        return await AddAction(
            new MainUpdateBankAction(bankId, bankName, isDefault, order, view)
        );
    }

    public async Task<DataUpdateFlags> MainDeleteBank(string bankId)
    {
        return await AddAction(
            new MainDeleteBankAction(bankId)
        );
    }

    public async Task<DataUpdateFlags> MovePkm(
        string[] pkmIds, uint? sourceSaveId,
        uint? targetSaveId, int targetBoxId, int[] targetBoxSlots,
        bool attached
    )
    {
        using var scope = sp.CreateScope();

        return await AddAction(
            new MovePkmAction(
                warningsService: scope.ServiceProvider.GetRequiredService<WarningsService>(),
                staticDataService: scope.ServiceProvider.GetRequiredService<StaticDataService>(),
                pkmConvertService: scope.ServiceProvider.GetRequiredService<PkmConvertService>(),
                pkmIds, sourceSaveId, targetSaveId, targetBoxId, targetBoxSlots, attached)
        );
    }

    public async Task<DataUpdateFlags> MovePkmBank(
        string[] pkmIds, uint? sourceSaveId,
        string bankId,
        bool attached
    )
    {
        using var scope = sp.CreateScope();

        return await AddAction(
            new MovePkmBankAction(
                warningsService: scope.ServiceProvider.GetRequiredService<WarningsService>(),
                pkmConvertService: scope.ServiceProvider.GetRequiredService<PkmConvertService>(),
                pkmIds, sourceSaveId, bankId, attached)
        );
    }

    public async Task<DataUpdateFlags> MainCreatePkmVersion(string pkmId, byte generation)
    {
        using var scope = sp.CreateScope();

        return await AddAction(
            new MainCreatePkmVersionAction(
                warningsService: scope.ServiceProvider.GetRequiredService<WarningsService>(),
                pkmConvertService: scope.ServiceProvider.GetRequiredService<PkmConvertService>(),
                pkmId, generation)
        );
    }

    public async Task<DataUpdateFlags> MainEditPkmVersion(string pkmVersionId, EditPkmVersionPayload payload)
    {
        using var scope = sp.CreateScope();

        return await AddAction(
            new EditPkmVersionAction(this,
                pkmConvertService: scope.ServiceProvider.GetRequiredService<PkmConvertService>(),
                pkmVersionId, payload)
        );
    }

    public async Task<DataUpdateFlags> SaveEditPkm(uint saveId, string pkmId, EditPkmVersionPayload payload)
    {
        using var scope = sp.CreateScope();

        return await AddAction(
            new EditPkmSaveAction(this,
                pkmConvertService: scope.ServiceProvider.GetRequiredService<PkmConvertService>(),
                saveId, pkmId, payload)
        );
    }

    public async Task<DataUpdateFlags> MainPkmDetachSaves(string[] pkmIds)
    {
        return await AddAction(
            new DetachPkmSaveAction(pkmIds)
        );
    }

    public async Task<DataUpdateFlags> MainPkmVersionsDelete(string[] pkmVersionIds)
    {
        return await AddAction(
            new DeletePkmVersionAction(pkmVersionIds)
        );
    }

    public async Task<DataUpdateFlags> SaveDeletePkms(uint saveId, string[] pkmIds)
    {
        return await AddAction(
            new SaveDeletePkmAction(saveId, pkmIds)
        );
    }

    public async Task<DataUpdateFlags> EvolvePkms(uint? saveId, string[] ids)
    {
        using var scope = sp.CreateScope();

        return await AddAction(
            new EvolvePkmAction(
                staticDataService: scope.ServiceProvider.GetRequiredService<StaticDataService>(),
                pkmConvertService: scope.ServiceProvider.GetRequiredService<PkmConvertService>(),
                saveId, ids)
        );
    }

    public async Task<DataUpdateFlags> SortPkms(uint? saveId, int fromBoxId, int toBoxId, bool leaveEmptySlot)
    {
        return await AddAction(
            new SortPkmAction(saveId, fromBoxId, toBoxId, leaveEmptySlot)
        );
    }

    public async Task<DataUpdateFlags> DexSync(uint[] saveIds)
    {
        using var scope = sp.CreateScope();

        return await AddAction(
            new DexSyncAction(
                dexService: scope.ServiceProvider.GetRequiredService<DexService>(),
                saveIds)
        );
    }

    public async Task<DataUpdateFlags> Save()
    {
        var memoryLoader = await GetLoader();
        var flags = new DataUpdateFlags();

        var actions = memoryLoader.actions;
        if (actions.Count == 0)
        {
            return flags;
        }

        Console.WriteLine("SAVING IN PROGRESS");

        using var scope = sp.CreateScope();
        await scope.ServiceProvider.GetRequiredService<BackupService>()
            .PrepareBackupThenRun(memoryLoader.loaders.WriteToFiles);

        flags.Backups = true;
        flags.Warnings = true;

        return flags;
    }

    private async Task<DataUpdateFlags> AddAction(DataAction action)
    {
        var memoryLoader = await GetLoader();

        try
        {
            var flags = await memoryLoader.AddAction(action, null);
            flags.Warnings = true;
            return flags;
        }
        catch (Exception ex)
        {
            // re-run actions to avoid persisted side-effects, int.MaxValue means no action removed, just reset
            var flags = await RemoveDataActionsAndReset(int.MaxValue);
            throw new DataActionException(ex, flags);
        }
    }

    public List<DataActionPayload> GetActionPayloadList()
    {
        var actionPayloadList = new List<DataActionPayload>();
        _memoryLoader?.actions.ForEach(action => actionPayloadList.Add(action.payload));
        return actionPayloadList;
    }

    public bool HasEmptyActionList()
    {
        return _memoryLoader == null || _memoryLoader.actions.Count == 0;
    }

    public async Task<DataMemoryLoader> ResetDataLoader(bool checkSaveSynchro)
    {
        var logtime = LogUtil.Time($"Data-loader reset");

        using var scope = sp.CreateScope();
        _memoryLoader = DataMemoryLoader.Create(
            saveService: scope.ServiceProvider.GetRequiredService<LocalSaveService>(),
            warningsService: scope.ServiceProvider.GetRequiredService<WarningsService>(),
            pkmConvertService: scope.ServiceProvider.GetRequiredService<PkmConvertService>()
        );

        if (checkSaveSynchro)
        {
            await _memoryLoader.CheckSaveToSynchronize();
        }

        logtime();

        return _memoryLoader;
    }

    public async Task<DataUpdateFlags> RemoveDataActionsAndReset(int actionIndexToRemoveFrom)
    {
        var previousActions = (await GetLoader()).actions;

        await ResetDataLoader(false);

        var memoryLoader = await GetLoader();

        var flags = new DataUpdateFlags
        {
            MainBanks = true,
            MainBoxes = true,
            MainPkms = true,
            MainPkmVersions = true,
            Saves = [
                new() {
                    SaveId = 0
                }
            ],
            Dex = true,
            Warnings = true,
        };

        for (var i = 0; i < previousActions.Count; i++)
        {
            if (actionIndexToRemoveFrom > i)
            {
                await memoryLoader.AddAction(previousActions[i], flags);
            }
        }

        return flags;
    }

    public async Task<List<MoveItem>> GetPkmAvailableMoves(uint? saveId, string pkmId)
    {
        var loader = await GetLoader();
        var save = saveId == null
            ? null
            : loader.loaders.saveLoadersDict[(uint)saveId].Save;
        var pkm = (saveId == null
            ? loader.loaders.pkmVersionLoader.GetDto(pkmId)?.Pkm
            : loader.loaders.saveLoadersDict[(uint)saveId].Pkms.GetDto(pkmId)?.Pkm)
            ?? throw new ArgumentException($"Pkm not found, saveId={saveId} pkmId={pkmId}");

        try
        {
            var legality = BasePkmVersionDTO.GetLegalitySafe(pkm, save);

            var moveComboSource = new LegalMoveComboSource();
            var moveSource = new LegalMoveSource<ComboItem>(moveComboSource);

            using var scope = sp.CreateScope();

            save ??= BlankSaveFile.Get(
                PkmVersionDTO.GetSingleVersion(pkm.Version),
                pkm.OriginalTrainerName,
                (LanguageID)scope.ServiceProvider.GetRequiredService<PkmConvertService>()
                    .GetPkmLanguage(pkm)
            );

            var filteredSources = new FilteredGameDataSource(save, GameInfo.Sources);
            moveSource.ChangeMoveSource(filteredSources.Moves);
            moveSource.ReloadMoves(legality);

            var movesStr = GameInfo.GetStrings(SettingsService.BaseSettings.GetSafeLanguage()).movelist;

            var availableMoves = new List<MoveItem>();

            moveComboSource.DataSource.ToList().ForEach(data =>
            {
                if (data.Value > 0 && moveSource.Info.CanLearn((ushort)data.Value))
                {
                    var item = new MoveItem
                    {
                        Id = data.Value,
                        // Type = MoveInfo.GetType((ushort)data.Value, Pkm.Context),
                        // Text = movesStr[data.Value],
                        // SourceTypes = moveSourceTypes.FindAll(type => moveSourceTypesRecord[type].Length > data.Value && moveSourceTypesRecord[type][data.Value]),
                    };
                    availableMoves.Add(item);
                }
            });

            return availableMoves;
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine(ex);
            return [];
        }
    }

    public async Task DataSetupMigrateClean()
    {
        var time = LogUtil.Time("Data Setup + Migrate + Clean");

        using var scope = sp.CreateScope();

        var bankLoader = new BankLoader();
        var boxLoader = new BoxLoader();
        var pkmLoader = new PkmLoader();
        var pkmVersionLoader = new PkmVersionLoader(
            _warningsService: scope.ServiceProvider.GetRequiredService<WarningsService>(),
            pkmLoader);
        var dexLoader = new DexLoader();

        DataEntityLoaders loaders = new()
        {
            bankLoader = bankLoader,
            boxLoader = boxLoader,
            pkmLoader = pkmLoader,
            pkmVersionLoader = pkmVersionLoader,
            dexLoader = dexLoader,
            saveLoadersDict = [],
        };

        loaders.SetupInitialData();
        loaders.MigrateGlobalEntities();
        loaders.CleanData();

        if (loaders.GetHasWritten())
        {
            scope.ServiceProvider.GetRequiredService<BackupService>()
                .CreateBackup();

            await loaders.WriteToFiles();
        }

        time();
    }

    public async Task CleanMainStorageFiles()
    {
        var time = LogUtil.Time($"Storage obsolete files clean up");

        var loader = await GetLoader();
        var pkmVersionsFilepaths = loader.loaders.pkmVersionLoader.GetAllDtos().Select(dto => dto.PkmVersionEntity.Filepath).ToList();

        var rootDir = ".";
        var storagePath = SettingsService.BaseSettings.GetStoragePath();

        var matcher = new Matcher();
        matcher.AddInclude(Path.Combine(storagePath, "**/*"));
        var matches = matcher.Execute(new DirectoryInfoWrapper(new DirectoryInfo(rootDir)));

        var pathsToClean = matches.Files
        .Select(file => Path.Combine(rootDir, file.Path))
        .Select(MatcherUtil.NormalizePath)
        .Select(path => pkmVersionsFilepaths.Contains(path) ? null : path)
        .OfType<string>();

        var pkmVersionFilesToDelete = pkmVersionsFilepaths.Count - (matches.Files.Count() - pathsToClean.Count());

        Console.WriteLine($"Total files count = {matches.Files.Count()}");
        Console.WriteLine($"PkmVersion count = {pkmVersionsFilepaths.Count}");
        Console.WriteLine($"Paths to clean count = {pathsToClean.Count()}");

        if (pkmVersionFilesToDelete != 0)
        {
            throw new Exception($"Inconsistant delete, {pkmVersionFilesToDelete} files for PkmVersions may be deleted");
        }

        if (pathsToClean.Any())
        {
            using var scope = sp.CreateScope();
            scope.ServiceProvider.GetRequiredService<BackupService>()
                .CreateBackup();

            foreach (var path in pathsToClean)
            {
                Console.WriteLine($"Clean obsolete file {path}");
                File.Delete(path);
            }

            Console.WriteLine($"Total files count = {matches.Files.Count()}");
            Console.WriteLine($"PkmVersion count = {pkmVersionsFilepaths.Count}");
            Console.WriteLine($"Paths to clean count = {pathsToClean.Count()}");
        }

        time();
    }
}
