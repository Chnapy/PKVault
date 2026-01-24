using PKHeX.Core;

/**
 * Action mutation for current session.
 */
public class ActionService(
    IServiceProvider sp,
    ILoadersService loadersService, PkmConvertService pkmConvertService, BackupService backupService,
    ISettingsService settingsService, PkmLegalityService pkmLegalityService, SessionService sessionService
)
{
    public record ActionRecord(
        Func<IServiceScope, DataUpdateFlags, Task<DataActionPayload?>> ActionFn,
        DataActionPayload Payload
    );

    private readonly List<ActionRecord> actions = [];

    public async Task<DataUpdateFlags> DataNormalize(DataEntityLoaders loaders)
    {
        using var scope = sp.CreateScope();

        return await AddAction(
            scope,
            (scope) => scope.ServiceProvider.GetRequiredService<DataNormalizeAction>(),
            new(),
            loaders
        );
    }

    public async Task<DataUpdateFlags> SynchronizePkm(SynchronizePkmActionInput input)
    {
        using var scope = sp.CreateScope();

        return await AddAction(
            scope,
            (scope) => scope.ServiceProvider.GetRequiredService<SynchronizePkmAction>(),
            input,
            input.loaders
        );
    }

    public async Task<DataUpdateFlags> MainCreateBox(string bankId)
    {
        using var scope = sp.CreateScope();

        return await AddAction(
            scope,
            (scope) => scope.ServiceProvider.GetRequiredService<MainCreateBoxAction>(),
            new(bankId, null)
        );
    }

    public async Task<DataUpdateFlags> MainUpdateBox(string boxId, string boxName, int order, string bankId, int slotCount, BoxType type)
    {
        using var scope = sp.CreateScope();

        return await AddAction(
            scope,
            (scope) => scope.ServiceProvider.GetRequiredService<MainUpdateBoxAction>(),
            new(boxId, boxName, order, bankId, slotCount, type)
        );
    }

    public async Task<DataUpdateFlags> MainDeleteBox(string boxId)
    {
        using var scope = sp.CreateScope();

        return await AddAction(
            scope,
            (scope) => scope.ServiceProvider.GetRequiredService<MainDeleteBoxAction>(),
            new(boxId)
        );
    }

    public async Task<DataUpdateFlags> MainCreateBank()
    {
        using var scope = sp.CreateScope();

        return await AddAction(
            scope,
            (scope) => scope.ServiceProvider.GetRequiredService<MainCreateBankAction>(),
            new()
        );
    }

    public async Task<DataUpdateFlags> MainUpdateBank(string bankId, string bankName, bool isDefault, int order, BankEntity.BankView view)
    {
        using var scope = sp.CreateScope();

        return await AddAction(
            scope,
            (scope) => scope.ServiceProvider.GetRequiredService<MainUpdateBankAction>(),
            new(bankId, bankName, isDefault, order, view)
        );
    }

    public async Task<DataUpdateFlags> MainDeleteBank(string bankId)
    {
        using var scope = sp.CreateScope();

        return await AddAction(
            scope,
            (scope) => scope.ServiceProvider.GetRequiredService<MainDeleteBankAction>(),
            new(bankId)
        );
    }

    public async Task<DataUpdateFlags> MovePkm(
        string[] pkmIds, uint? sourceSaveId,
        uint? targetSaveId, string targetBoxId, int[] targetBoxSlots,
        bool attached
    )
    {
        using var scope = sp.CreateScope();

        return await AddAction(
            scope,
            (scope) => scope.ServiceProvider.GetRequiredService<MovePkmAction>(),
            new(pkmIds, sourceSaveId, targetSaveId, targetBoxId, targetBoxSlots, attached)
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
            scope,
            (scope) => scope.ServiceProvider.GetRequiredService<MovePkmBankAction>(),
            new(pkmIds, sourceSaveId, bankId, attached)
        );
    }

    public async Task<DataUpdateFlags> MainCreatePkmVersion(string pkmVersionId, byte generation)
    {
        using var scope = sp.CreateScope();

        return await AddAction(
            scope,
            (scope) => scope.ServiceProvider.GetRequiredService<MainCreatePkmVersionAction>(),
            new(pkmVersionId, generation)
        );
    }

    public async Task<DataUpdateFlags> MainEditPkmVersion(string pkmVersionId, EditPkmVersionPayload payload)
    {
        using var scope = sp.CreateScope();

        return await AddAction(
            scope,
            (scope) => scope.ServiceProvider.GetRequiredService<EditPkmVersionAction>(),
            new(pkmVersionId, payload)
        );
    }

    public async Task<DataUpdateFlags> SaveEditPkm(uint saveId, string pkmId, EditPkmVersionPayload payload)
    {
        using var scope = sp.CreateScope();

        return await AddAction(
            scope,
            (scope) => scope.ServiceProvider.GetRequiredService<EditPkmSaveAction>(),
            new(saveId, pkmId, payload)
        );
    }

    public async Task<DataUpdateFlags> MainPkmDetachSaves(string[] pkmIds)
    {
        using var scope = sp.CreateScope();

        return await AddAction(
            scope,
            (scope) => scope.ServiceProvider.GetRequiredService<DetachPkmSaveAction>(),
            new(pkmIds)
        );
    }

    public async Task<DataUpdateFlags> MainPkmVersionsDelete(string[] pkmVersionIds)
    {
        using var scope = sp.CreateScope();

        return await AddAction(
            scope,
            (scope) => scope.ServiceProvider.GetRequiredService<DeletePkmVersionAction>(),
            new(pkmVersionIds)
        );
    }

    public async Task<DataUpdateFlags> SaveDeletePkms(uint saveId, string[] pkmIds)
    {
        using var scope = sp.CreateScope();

        return await AddAction(
            scope,
            (scope) => scope.ServiceProvider.GetRequiredService<SaveDeletePkmAction>(),
            new(saveId, pkmIds)
        );
    }

    public async Task<DataUpdateFlags> EvolvePkms(uint? saveId, string[] ids)
    {
        using var scope = sp.CreateScope();

        return await AddAction(
            scope,
            (scope) => scope.ServiceProvider.GetRequiredService<EvolvePkmAction>(),
            new(saveId, ids)
        );
    }

    public async Task<DataUpdateFlags> SortPkms(uint? saveId, int fromBoxId, int toBoxId, bool leaveEmptySlot)
    {
        using var scope = sp.CreateScope();

        return await AddAction(
            scope,
            (scope) => scope.ServiceProvider.GetRequiredService<SortPkmAction>(),
            new(saveId, fromBoxId, toBoxId, leaveEmptySlot)
        );
    }

    public async Task<DataUpdateFlags> DexSync(uint[] saveIds)
    {
        using var scope = sp.CreateScope();

        return await AddAction(
            scope,
            (scope) => scope.ServiceProvider.GetRequiredService<DexSyncAction>(),
            new(saveIds)
        );
    }

    public async Task<DataUpdateFlags> Save()
    {
        var loaders = await loadersService.GetLoaders();
        var flags = new DataUpdateFlags();

        if (actions.Count == 0)
        {
            return flags;
        }

        Console.WriteLine("SAVING IN PROGRESS");

        await backupService.PrepareBackupThenRun(async () =>
        {
            sessionService.PersistSession();

            await loaders.WriteToFiles();

            // TODO
            // pkmVersionLoader.pkmFileLoader.WriteToFiles();
        });

        flags.SaveInfos = true;
        flags.Backups = true;
        flags.Warnings = true;

        return flags;
    }

    public async Task<DataUpdateFlags> RemoveDataActionsAndReset(int actionIndexToRemoveFrom)
    {
        List<ActionRecord> previousActions = [.. actions];
        actions.Clear();

        loadersService.InvalidateLoaders((maintainData: false, checkSaves: false));
        // await loadersService.GetLoaders();

        using var scope = sp.CreateScope();

        var flags = new DataUpdateFlags
        {
            MainBanks = new() { All = true },
            MainBoxes = new() { All = true },
            MainPkmVersions = new() { All = true },
            Saves = new() { All = true },
            Dex = true,
            Warnings = true,
        };

        for (var i = 0; i < previousActions.Count; i++)
        {
            if (actionIndexToRemoveFrom > i)
            {
                await AddActionByRecord(scope, previousActions[i], flags);
            }
        }

        return flags;
    }

    public List<DataActionPayload> GetActionPayloadList()
    {
        return [.. actions.Select(action => action.Payload)];
    }

    public bool HasEmptyActionList()
    {
        return actions.Count == 0;
    }

    private async Task<DataUpdateFlags> AddActionByRecord(
        IServiceScope scope,
        ActionRecord actionRecord,
        DataUpdateFlags? _flags
    )
    {
        var flags = await AddActionInner(scope, actionRecord.ActionFn, _flags);
        flags.Warnings = true;
        return flags;
    }

    private async Task<DataUpdateFlags> AddAction<I>(
        IServiceScope scope,
        Func<IServiceScope, DataAction<I>> getScopedAction,
        I input,
        DataEntityLoaders? loaders = null
    )
    {
        async Task<DataActionPayload?> applyFn(IServiceScope scope, DataUpdateFlags flags)
        {
            var action = getScopedAction(scope);

            var logtime = LogUtil.Time($"Apply action - {action.GetType()}");

            var payload = await action.ExecuteWithPayload(input, flags);

            logtime();

            return payload;
        }

        var flags = await AddActionInner(
            scope,
            applyFn,
            null,
            loaders
        );
        flags.Warnings = true;

        return flags;
    }

    private async Task<DataUpdateFlags> AddActionInner(
        IServiceScope scope,
        Func<IServiceScope, DataUpdateFlags, Task<DataActionPayload?>> actionFn,
        DataUpdateFlags? flags,
        DataEntityLoaders? loaders = null
    )
    {
        flags ??= new();
        var actionRecord = await ApplyAction(
            scope,
            actionFn,
            flags,
            loaders
        );

        var db = scope.ServiceProvider.GetRequiredService<SessionDbContext>();

        flags.MainBanks = new()
        {
            All = flags.MainBanks.All || db.BanksFlags.All,
            Ids = [
                ..flags.MainBanks.Ids,
                ..db.BanksFlags.Ids,
            ]
        };
        flags.MainBoxes = new()
        {
            All = flags.MainBoxes.All || db.BoxesFlags.All,
            Ids = [
                ..flags.MainBoxes.Ids,
                ..db.BoxesFlags.Ids,
            ]
        };
        flags.MainPkmVersions = new()
        {
            All = flags.MainPkmVersions.All || db.PkmVersionsFlags.All,
            Ids = [
                ..flags.MainPkmVersions.Ids,
                ..db.PkmVersionsFlags.Ids,
            ]
        };

        // add to action-list only if action did something
        if (actionRecord != null)
        {
            actions.Add(actionRecord);
        }
        return flags;
    }

    private async Task<ActionRecord?> ApplyAction(
        IServiceScope scope,
        Func<IServiceScope, DataUpdateFlags, Task<DataActionPayload?>> actionFn,
        DataUpdateFlags flags,
        DataEntityLoaders? loaders = null
    )
    {
        loaders ??= await loadersService.GetLoaders();
        loaders.SetFlags(flags);

        var payload = await actionFn(scope, flags);

        // Console.WriteLine($"Context={db.ContextId}");

        return payload != null
            ? new ActionRecord(actionFn, payload)
            : null;
    }

    public async Task<List<MoveItem>> GetPkmAvailableMoves(uint? saveId, string pkmId)
    {
        using var scope = sp.CreateScope();
        var pkmVersionLoader = scope.ServiceProvider.GetRequiredService<IPkmVersionLoader>();
        var loaders = await loadersService.GetLoaders();

        var save = saveId == null
            ? null
            : loaders.saveLoadersDict[(uint)saveId].Save;
        var pkm = (saveId == null
            ? (await pkmVersionLoader.GetDto(pkmId))?.Pkm
            : loaders.saveLoadersDict[(uint)saveId].Pkms.GetDto(pkmId)?.Pkm)
            ?? throw new ArgumentException($"Pkm not found, saveId={saveId} pkmId={pkmId}");

        var legality = pkmLegalityService.GetLegalitySafe(pkm, save);

        var moveComboSource = new LegalMoveComboSource();
        var moveSource = new LegalMoveSource<ComboItem>(moveComboSource);

        save ??= new(BlankSaveFile.Get(
            StaticDataService.GetSingleVersion(pkm.Version),
            pkm.OriginalTrainerName,
            (LanguageID)pkmConvertService.GetPkmLanguage(pkm.GetMutablePkm())
        ));

        var filteredSources = new FilteredGameDataSource(save.GetSave(), GameInfo.Sources);
        moveSource.ChangeMoveSource(filteredSources.Moves);
        moveSource.ReloadMoves(legality);

        var movesStr = GameInfo.GetStrings(settingsService.GetSettings().GetSafeLanguage()).movelist;

        var availableMoves = new List<MoveItem>();

        moveComboSource.DataSource.ToList().ForEach(data =>
        {
            if (data.Value > 0 && moveSource.Info.CanLearn((ushort)data.Value))
            {
                var item = new MoveItem(
                    Id: data.Value
                // Type = MoveInfo.GetType((ushort)data.Value, Pkm.Context),
                // Text = movesStr[data.Value],
                // SourceTypes = moveSourceTypes.FindAll(type => moveSourceTypesRecord[type].Length > data.Value && moveSourceTypesRecord[type][data.Value]),
                );
                availableMoves.Add(item);
            }
        });

        return availableMoves;
    }
}
