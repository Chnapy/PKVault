using Microsoft.Extensions.DependencyInjection;
using PKHeX.Core;
using Serilog;

namespace PKVault.Core;

/**
 * Action mutation for current session.
 */
public class ActionService(
    IServiceProvider sp,
    PkmUpdateService pkmUpdateService, BackupService backupService, ISettingsService settingsService,
    ISessionService sessionService, ISavesLoadersService savesLoadersService
)
{
    public async Task<DataUpdateFlags> DataNormalize(DataNormalizeActionInput input, IServiceScope scope, DataUpdateFlags? flags = null)
    {
        return await AddAction(
            scope,
            (scope) => scope.ServiceProvider.GetRequiredService<DataNormalizeAction>(),
            input,
            flags
        );
    }

    public async Task<DataUpdateFlags> UpdateExternalPkm(UpdateExternalPkmActionInput input, IServiceScope scope, DataUpdateFlags? flags = null)
    {
        return await AddAction(
            scope,
            (scope) => scope.ServiceProvider.GetRequiredService<UpdateExternalPkmAction>(),
            input,
            flags
        );
    }

    public async Task<DataUpdateFlags> SynchronizePkm(SynchronizePkmActionInput input, IServiceScope scope, DataUpdateFlags? flags = null)
    {
        return await AddAction(
            scope,
            (scope) => scope.ServiceProvider.GetRequiredService<SynchronizePkmAction>(),
            input,
            flags
        );
    }

    public async Task<DataUpdateFlags> MainCreateBox(MainCreateBoxActionInput input)
    {
        using var scope = sp.CreateScope();

        return await AddAction(
            scope,
            (scope) => scope.ServiceProvider.GetRequiredService<MainCreateBoxAction>(),
            input
        );
    }

    public async Task<DataUpdateFlags> MainUpdateBox(MainUpdateBoxActionInput input)
    {
        using var scope = sp.CreateScope();

        return await AddAction(
            scope,
            (scope) => scope.ServiceProvider.GetRequiredService<MainUpdateBoxAction>(),
            input
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

    public async Task<DataUpdateFlags> MainUpdateBank(MainUpdateBankActionInput input)
    {
        using var scope = sp.CreateScope();

        return await AddAction(
            scope,
            (scope) => scope.ServiceProvider.GetRequiredService<MainUpdateBankAction>(),
            input
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

    public async Task<DataUpdateFlags> MovePkm(MovePkmActionInput input)
    {
        using var scope = sp.CreateScope();

        return await AddAction(
            scope,
            (scope) => scope.ServiceProvider.GetRequiredService<MovePkmAction>(),
            input
        );
    }

    public async Task<DataUpdateFlags> MovePkmBank(MovePkmBankActionInput input)
    {
        using var scope = sp.CreateScope();

        return await AddAction(
            scope,
            (scope) => scope.ServiceProvider.GetRequiredService<MovePkmBankAction>(),
            input
        );
    }

    public async Task<DataUpdateFlags> MoveItem(MoveItemActionInput input)
    {
        using var scope = sp.CreateScope();

        return await AddAction(
            scope,
            (scope) => scope.ServiceProvider.GetRequiredService<MoveItemAction>(),
            input
        );
    }

    public async Task<DataUpdateFlags> MoveItemBank(MoveItemBankActionInput input)
    {
        using var scope = sp.CreateScope();

        return await AddAction(
            scope,
            (scope) => scope.ServiceProvider.GetRequiredService<MoveItemBankAction>(),
            input
        );
    }

    public async Task<DataUpdateFlags> MainCreatePkmVariant(MainCreatePkmVariantActionInput input)
    {
        using var scope = sp.CreateScope();

        return await AddAction(
            scope,
            (scope) => scope.ServiceProvider.GetRequiredService<MainCreatePkmVariantAction>(),
            input
        );
    }

    public async Task<DataUpdateFlags> MainEditPkmVariant(EditPkmVariantActionInput input)
    {
        using var scope = sp.CreateScope();

        return await AddAction(
            scope,
            (scope) => scope.ServiceProvider.GetRequiredService<EditPkmVariantAction>(),
            input
        );
    }

    public async Task<DataUpdateFlags> MainSetPkmVariantMain(string pkmVariantId)
    {
        using var scope = sp.CreateScope();

        return await AddAction(
            scope,
            (scope) => scope.ServiceProvider.GetRequiredService<SetPkmVariantMainAction>(),
            new(pkmVariantId)
        );
    }

    public async Task<DataUpdateFlags> SaveEditPkm(EditPkmSaveActionInput input)
    {
        using var scope = sp.CreateScope();

        return await AddAction(
            scope,
            (scope) => scope.ServiceProvider.GetRequiredService<EditPkmSaveAction>(),
            input
        );
    }

    public async Task<DataUpdateFlags> MainPkmDetachSaves(DetachPkmSaveActionInput input)
    {
        using var scope = sp.CreateScope();

        return await AddAction(
            scope,
            (scope) => scope.ServiceProvider.GetRequiredService<DetachPkmSaveAction>(),
            input
        );
    }

    public async Task<DataUpdateFlags> MainPkmVariantsDelete(DeletePkmVariantActionInput input)
    {
        using var scope = sp.CreateScope();

        return await AddAction(
            scope,
            (scope) => scope.ServiceProvider.GetRequiredService<DeletePkmVariantAction>(),
            input
        );
    }

    public async Task<DataUpdateFlags> SaveDeletePkms(SaveDeletePkmActionInput input)
    {
        using var scope = sp.CreateScope();

        return await AddAction(
            scope,
            (scope) => scope.ServiceProvider.GetRequiredService<SaveDeletePkmAction>(),
            input
        );
    }

    public async Task<DataUpdateFlags> EvolvePkms(EvolvePkmActionInput input)
    {
        using var scope = sp.CreateScope();

        return await AddAction(
            scope,
            (scope) => scope.ServiceProvider.GetRequiredService<EvolvePkmAction>(),
            input
        );
    }

    public async Task<DataUpdateFlags> SortPkms(SortPkmActionInput input)
    {
        using var scope = sp.CreateScope();

        return await AddAction(
            scope,
            (scope) => scope.ServiceProvider.GetRequiredService<SortPkmAction>(),
            input
        );
    }

    public async Task<DataUpdateFlags> DexSync(DexSyncActionInput input)
    {
        using var scope = sp.CreateScope();

        return await AddAction(
            scope,
            (scope) => scope.ServiceProvider.GetRequiredService<DexSyncAction>(),
            input
        );
    }

    public async Task<DataUpdateFlags> Save()
    {
        var flags = new DataUpdateFlags();

        if (sessionService.HasEmptyActionList())
        {
            return flags;
        }

        Log.Information("SAVING IN PROGRESS");

        await backupService.PrepareBackupThenRun("backup_before_save", flags, async () =>
        {
            using var scope = sp.CreateScope();

            await sessionService.PersistSession(scope);
        });

        return flags;
    }

    public async Task<DataUpdateFlags> RemoveDataActionsAndReset(int actionIndexToRemoveFrom)
    {
        List<SessionService.ActionRecord> previousActions = [.. sessionService.Actions];

        DataUpdateFlags flags = new();

        await sessionService.StartNewSession(checkInitialActions: false, flags);

        using var scope = sp.CreateScope();

        for (var i = 0; i < previousActions.Count; i++)
        {
            if (actionIndexToRemoveFrom > i)
            {
                await AddActionByRecord(scope, previousActions[i], flags);
            }
        }

        await scope.ServiceProvider.GetRequiredService<SessionDbContext>()
            .SaveChangesAsync();

        return flags;
    }

    private async Task<DataUpdateFlags> AddActionByRecord(
        IServiceScope scope,
        SessionService.ActionRecord actionRecord,
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
        DataUpdateFlags? _flags = null
    )
    {
        async Task<DataActionPayload> applyFn(IServiceScope scope, DataUpdateFlags flags)
        {
            var action = getScopedAction(scope);

            using var _ = Log.Logger.Time($"Apply action - {action.GetType()}");

            return await action.ExecuteWithPayload(input, flags);
        }

        try
        {
            var flags = await AddActionInner(
                scope,
                applyFn,
                _flags
            );

            await scope.ServiceProvider.GetRequiredService<SessionDbContext>()
                .SaveChangesAsync();

            flags.Warnings = true;

            return flags;
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Exception during action add");

            await RemoveDataActionsAndReset(sessionService.Actions.Count);

            throw;
        }
    }

    private async Task<DataUpdateFlags> AddActionInner(
        IServiceScope scope,
        Func<IServiceScope, DataUpdateFlags, Task<DataActionPayload>> actionFn,
        DataUpdateFlags? flags
    )
    {
        flags ??= new();
        var actionRecord = await ApplyAction(
            scope,
            actionFn,
            flags
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
        flags.MainPkmVariants = new()
        {
            All = flags.MainPkmVariants.All || db.PkmVariantsFlags.All,
            Ids = [
                ..flags.MainPkmVariants.Ids,
                ..db.PkmVariantsFlags.Ids,
            ]
        };
        flags.MainInventoryItems = flags.MainInventoryItems || db.InventoryItemsFlags.All || db.InventoryItemsFlags.Ids.Count > 0;
        flags.Dex = new()
        {
            All = flags.Dex.All || db.DexFlags.All,
            Ids = [
                ..flags.Dex.Ids,
                ..db.DexFlags.Ids,
            ]
        };

        sessionService.Actions.Add(actionRecord);

        return flags;
    }

    private async Task<SessionService.ActionRecord> ApplyAction(
        IServiceScope scope,
        Func<IServiceScope, DataUpdateFlags, Task<DataActionPayload>> actionFn,
        DataUpdateFlags flags
    )
    {
        savesLoadersService.SetFlags(flags);

        var payload = await actionFn(scope, flags);

        // log.LogInformation($"Context={db.ContextId}");

        return new SessionService.ActionRecord(actionFn, payload);
    }

    public async Task<List<MoveItem>> GetPkmAvailableMoves(uint? saveId, string pkmId)
    {
        using var scope = sp.CreateScope();
        var pkmVariantLoader = scope.ServiceProvider.GetRequiredService<IPkmVariantLoader>();

        var saveLoader = saveId == null ? null : savesLoadersService.GetLoaders((uint)saveId);

        var save = saveLoader?.Save;

        async Task<ImmutablePKM> GetPkm()
        {
            if (saveLoader == null)
            {
                var pkmVariant = await pkmVariantLoader.GetEntityRequired(pkmId);

                return await pkmVariantLoader.GetPKM(pkmVariant);
            }

            return saveLoader.Pkms.GetDto(pkmId)?.Pkm
                ?? throw new ArgumentException($"Pkm not found, saveId={saveId} pkmId={pkmId}");
        }

        var pkm = await GetPkm();

        var legality = LegalityAnalysisService.GetLegalitySafeRaw(pkm, save);

        var moveComboSource = new LegalMoveComboSource();
        var moveSource = new LegalMoveSource<ComboItem>(moveComboSource);

        save ??= new(BlankSaveFile.Get(
            pkm.Context,
            pkm.OriginalTrainerName,
            (LanguageID)pkmUpdateService.GetPkmLanguage(pkm.GetMutablePkm())
        ));

        var filteredSources = new FilteredGameDataSource(save.GetSave(), GameInfo.Sources);
        moveSource.ChangeMoveSource(filteredSources.Moves);
        moveSource.ReloadMoves(legality);

        var movesStr = GameInfo.GetStrings(settingsService.GetSettings().GetLanguageForPKHeX()).movelist;

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
