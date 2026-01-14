using PKHeX.Core;

/**
 * Action mutation for current session.
 */
public class ActionService(
    LoadersService loadersService, PkmConvertService pkmConvertService, StaticDataService staticDataService,
    DexService dexService, BackupService backupService, SettingsService settingsService,
    PkmLegalityService pkmLegalityService
)
{
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
        return await AddAction(
            new MovePkmAction(
                staticDataService, pkmConvertService,
                pkmIds, sourceSaveId, targetSaveId, targetBoxId, targetBoxSlots, attached)
        );
    }

    public async Task<DataUpdateFlags> MovePkmBank(
        string[] pkmIds, uint? sourceSaveId,
        string bankId,
        bool attached
    )
    {
        return await AddAction(
            new MovePkmBankAction(
                pkmConvertService,
                pkmIds, sourceSaveId, bankId, attached)
        );
    }

    public async Task<DataUpdateFlags> MainCreatePkmVersion(string pkmId, byte generation)
    {
        return await AddAction(
            new MainCreatePkmVersionAction(
                pkmConvertService,
                pkmId, generation)
        );
    }

    public async Task<DataUpdateFlags> MainEditPkmVersion(string pkmVersionId, EditPkmVersionPayload payload)
    {
        return await AddAction(
            new EditPkmVersionAction(this,
                pkmConvertService,
                pkmVersionId, payload)
        );
    }

    public async Task<DataUpdateFlags> SaveEditPkm(uint saveId, string pkmId, EditPkmVersionPayload payload)
    {
        return await AddAction(
            new EditPkmSaveAction(this,
                pkmConvertService,
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
        return await AddAction(
            new EvolvePkmAction(
                staticDataService,
                pkmConvertService,
                saveId, ids)
        );
    }

    public async Task<DataUpdateFlags> SortPkms(uint? saveId, int fromBoxId, int toBoxId, bool leaveEmptySlot)
    {
        return await AddAction(
            new SortPkmAction(
                saveId, fromBoxId, toBoxId, leaveEmptySlot
            )
        );
    }

    public async Task<DataUpdateFlags> DexSync(uint[] saveIds)
    {
        return await AddAction(
            new DexSyncAction(
                dexService,
                saveIds)
        );
    }

    public async Task<DataUpdateFlags> Save()
    {
        var loaders = await loadersService.GetLoaders();
        var flags = new DataUpdateFlags();

        var actions = loaders.actions;
        if (actions.Count == 0)
        {
            return flags;
        }

        Console.WriteLine("SAVING IN PROGRESS");

        await backupService.PrepareBackupThenRun(loaders.WriteToFiles);

        flags.SaveInfos = true;
        flags.Backups = true;
        flags.Warnings = true;

        return flags;
    }

    private async Task<DataUpdateFlags> AddAction(DataAction action)
    {
        var flags = await loadersService.AddAction(action, null);
        flags.Warnings = true;
        return flags;
    }

    private async Task<DataUpdateFlags> CloneLoaderKeepingAction()
    {
        // int.MaxValue means no action removed, just reset keeping actions
        return await RemoveDataActionsAndReset(int.MaxValue);
    }

    public async Task<DataUpdateFlags> RemoveDataActionsAndReset(int actionIndexToRemoveFrom)
    {
        var loaders = await loadersService.GetLoaders();
        var previousActions = loaders.actions;

        loadersService.InvalidateLoaders((maintainData: false, checkSaves: false));

        var flags = new DataUpdateFlags
        {
            MainBanks = new() { All = true },
            MainBoxes = new() { All = true },
            MainPkms = new() { All = true },
            MainPkmVersions = new() { All = true },
            Saves = new() { All = true },
            Dex = true,
            Warnings = true,
        };

        for (var i = 0; i < previousActions.Count; i++)
        {
            if (actionIndexToRemoveFrom > i)
            {
                await loadersService.AddAction(previousActions[i], flags);
            }
        }

        return flags;
    }

    public async Task<List<MoveItem>> GetPkmAvailableMoves(uint? saveId, string pkmId)
    {
        var loaders = await loadersService.GetLoaders();
        var save = saveId == null
            ? null
            : loaders.saveLoadersDict[(uint)saveId].Save;
        var pkm = (saveId == null
            ? loaders.pkmVersionLoader.GetDto(pkmId)?.Pkm
            : loaders.saveLoadersDict[(uint)saveId].Pkms.GetDto(pkmId)?.Pkm)
            ?? throw new ArgumentException($"Pkm not found, saveId={saveId} pkmId={pkmId}");

        var legality = pkmLegalityService.GetLegalitySafe(pkm, save);

        var moveComboSource = new LegalMoveComboSource();
        var moveSource = new LegalMoveSource<ComboItem>(moveComboSource);

        save ??= new(BlankSaveFile.Get(
            StaticDataService.GetSingleVersion(pkm.Version),
            pkm.OriginalTrainerName,
            (LanguageID)pkmConvertService.GetPkmLanguage(pkm.GetMutablePkm())
        ), "");

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
