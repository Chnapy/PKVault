using PKHeX.Core;

public class ActionService(
    LoaderService loaderService, PkmConvertService pkmConvertService, StaticDataService staticDataService,
    WarningsService warningsService, DexService dexService, BackupService backupService
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
                warningsService,
                staticDataService,
                pkmConvertService,
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
                warningsService,
                pkmConvertService,
                pkmIds, sourceSaveId, bankId, attached)
        );
    }

    public async Task<DataUpdateFlags> MainCreatePkmVersion(string pkmId, byte generation)
    {
        return await AddAction(
            new MainCreatePkmVersionAction(
                warningsService,
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
            new SortPkmAction(saveId, fromBoxId, toBoxId, leaveEmptySlot)
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
        var memoryLoader = await loaderService.GetLoader();
        var flags = new DataUpdateFlags();

        var actions = memoryLoader.actions;
        if (actions.Count == 0)
        {
            return flags;
        }

        Console.WriteLine("SAVING IN PROGRESS");

        await backupService.PrepareBackupThenRun(memoryLoader.loaders.WriteToFiles);

        flags.Backups = true;
        flags.Warnings = true;

        return flags;
    }

    private async Task<DataUpdateFlags> AddAction(DataAction action)
    {
        var memoryLoader = await loaderService.GetLoader();

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

    public async Task<DataUpdateFlags> RemoveDataActionsAndReset(int actionIndexToRemoveFrom)
    {
        var memoryLoader = await loaderService.GetLoader();
        var previousActions = memoryLoader.actions;

        await loaderService.ResetDataLoader(false);

        memoryLoader = await loaderService.GetLoader();

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
        var loader = await loaderService.GetLoader();
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

            save ??= BlankSaveFile.Get(
                PkmVersionDTO.GetSingleVersion(pkm.Version),
                pkm.OriginalTrainerName,
                (LanguageID)pkmConvertService.GetPkmLanguage(pkm)
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
}
