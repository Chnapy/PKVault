using Microsoft.Extensions.FileSystemGlobbing;
using Microsoft.Extensions.FileSystemGlobbing.Abstractions;
using PKHeX.Core;
using PKVault.Backend;

public class StorageService
{
    private static DataMemoryLoader? _memoryLoader;

    public static async Task<List<BankDTO>> GetMainBanks()
    {
        var memoryLoader = await GetLoader();

        return memoryLoader.loaders.bankLoader.GetAllDtos();
    }

    public static async Task<List<BoxDTO>> GetMainBoxes()
    {
        var memoryLoader = await GetLoader();

        return memoryLoader.loaders.boxLoader.GetAllDtos();
    }

    public static async Task<List<PkmDTO>> GetMainPkms()
    {
        var memoryLoader = await GetLoader();

        return memoryLoader.loaders.pkmLoader.GetAllDtos();
    }

    public static async Task<List<PkmVersionDTO>> GetMainPkmVersions()
    {
        var memoryLoader = await GetLoader();

        return memoryLoader.loaders.pkmVersionLoader.GetAllDtos();
    }

    public static async Task<List<BoxDTO>> GetSaveBoxes(uint saveId)
    {
        var memoryLoader = await GetLoader();

        var saveExists = memoryLoader.loaders.saveLoadersDict.TryGetValue(saveId, out var saveLoaders);
        if (!saveExists)
        {
            return [];
        }

        return saveLoaders.Boxes.GetAllDtos();
    }

    public static async Task<List<PkmSaveDTO>> GetSavePkms(uint saveId)
    {
        var memoryLoader = await GetLoader();

        var saveExists = memoryLoader.loaders.saveLoadersDict.TryGetValue(saveId, out var saveLoaders);
        if (!saveExists)
        {
            return [];
        }

        return saveLoaders.Pkms.GetAllDtos();
    }

    public static async Task<DataUpdateFlags> MainCreateBox(string bankId)
    {
        return await AddAction(
            new MainCreateBoxAction(bankId, null)
        );
    }

    public static async Task<DataUpdateFlags> MainUpdateBox(string boxId, string boxName, int order, string bankId, int slotCount, BoxType type)
    {
        return await AddAction(
            new MainUpdateBoxAction(boxId, boxName, order, bankId, slotCount, type)
        );
    }

    public static async Task<DataUpdateFlags> MainDeleteBox(string boxId)
    {
        return await AddAction(
            new MainDeleteBoxAction(boxId)
        );
    }

    public static async Task<DataUpdateFlags> MainCreateBank()
    {
        return await AddAction(
            new MainCreateBankAction()
        );
    }

    public static async Task<DataUpdateFlags> MainUpdateBank(string bankId, string bankName, bool isDefault, int order, BankEntity.BankView view)
    {
        return await AddAction(
            new MainUpdateBankAction(bankId, bankName, isDefault, order, view)
        );
    }

    public static async Task<DataUpdateFlags> MainDeleteBank(string bankId)
    {
        return await AddAction(
            new MainDeleteBankAction(bankId)
        );
    }

    public static async Task<DataUpdateFlags> MovePkm(
        string[] pkmIds, uint? sourceSaveId,
        uint? targetSaveId, int targetBoxId, int[] targetBoxSlots,
        bool attached
    )
    {
        return await AddAction(
            new MovePkmAction(pkmIds, sourceSaveId, targetSaveId, targetBoxId, targetBoxSlots, attached)
        );
    }

    public static async Task<DataUpdateFlags> MovePkmBank(
        string[] pkmIds, uint? sourceSaveId,
        string bankId,
        bool attached
    )
    {
        return await AddAction(
            new MovePkmBankAction(pkmIds, sourceSaveId, bankId, attached)
        );
    }

    public static async Task<DataUpdateFlags> MainCreatePkmVersion(string pkmId, byte generation)
    {
        return await AddAction(
            new MainCreatePkmVersionAction(pkmId, generation)
        );
    }

    public static async Task<DataUpdateFlags> MainEditPkmVersion(string pkmVersionId, EditPkmVersionPayload payload)
    {
        return await AddAction(
            new EditPkmVersionAction(pkmVersionId, payload)
        );
    }

    public static async Task<DataUpdateFlags> SaveEditPkm(uint saveId, string pkmId, EditPkmVersionPayload payload)
    {
        return await AddAction(
            new EditPkmSaveAction(saveId, pkmId, payload)
        );
    }

    public static async Task<DataUpdateFlags> MainPkmDetachSaves(string[] pkmIds)
    {
        return await AddAction(
            new DetachPkmSaveAction(pkmIds)
        );
    }

    public static async Task<DataUpdateFlags> MainPkmVersionsDelete(string[] pkmVersionIds)
    {
        return await AddAction(
            new DeletePkmVersionAction(pkmVersionIds)
        );
    }

    public static async Task<DataUpdateFlags> SaveDeletePkms(uint saveId, string[] pkmIds)
    {
        return await AddAction(
            new SaveDeletePkmAction(saveId, pkmIds)
        );
    }

    public static async Task<DataUpdateFlags> EvolvePkms(uint? saveId, string[] ids)
    {
        return await AddAction(
            new EvolvePkmAction(saveId, ids)
        );
    }

    public static async Task<DataUpdateFlags> SortPkms(uint? saveId, int fromBoxId, int toBoxId, bool leaveEmptySlot)
    {
        return await AddAction(
            new SortPkmAction(saveId, fromBoxId, toBoxId, leaveEmptySlot)
        );
    }

    public static async Task<DataUpdateFlags> DexSync(uint[] saveIds)
    {
        return await AddAction(
            new DexSyncAction(saveIds)
        );
    }

    public static async Task<DataUpdateFlags> Save()
    {
        var memoryLoader = await GetLoader();
        var flags = new DataUpdateFlags();

        var actions = memoryLoader.actions;
        if (actions.Count == 0)
        {
            return flags;
        }

        Console.WriteLine("SAVING IN PROGRESS");

        await BackupService.PrepareBackupThenRun(async () =>
        {
            memoryLoader.WriteFiles();
        });

        flags.Backups = true;
        flags.Warnings = true;

        return flags;
    }

    private static async Task<DataUpdateFlags> AddAction(DataAction action)
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
            // re-run actions to avoid persisted side-effects, no removal here
            var flags = await RemoveDataActionsAndReset(int.MaxValue);
            throw new DataActionException(ex, flags);
        }
    }

    public static List<DataActionPayload> GetActionPayloadList()
    {
        var actionPayloadList = new List<DataActionPayload>();
        _memoryLoader?.actions.ForEach(action => actionPayloadList.Add(action.payload));
        return actionPayloadList;
    }

    public static bool HasEmptyActionList()
    {
        return _memoryLoader == null || _memoryLoader.actions.Count == 0;
    }

    public static async Task<DataMemoryLoader> ResetDataLoader(bool checkSaveSynchro)
    {
        var logtime = LogUtil.Time($"Data-loader reset");

        _memoryLoader = DataMemoryLoader.Create();

        if (checkSaveSynchro)
        {
            await _memoryLoader.CheckSaveToSynchronize();
        }

        logtime();

        return _memoryLoader;
    }

    public static async Task<DataUpdateFlags> RemoveDataActionsAndReset(int actionIndexToRemoveFrom)
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

    public static async Task<DataMemoryLoader> GetLoader()
    {
        if (_memoryLoader == null)
        {
            await Program.WaitForSetup();
        }

        return _memoryLoader!;
    }

    public static async Task<List<MoveItem>> GetPkmAvailableMoves(uint? saveId, string pkmId)
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

            save ??= BlankSaveFile.Get(
                PkmVersionDTO.GetSingleVersion(pkm.Version),
                pkm.OriginalTrainerName,
                (LanguageID)PkmConvertService.GetPkmLanguage(pkm)
            );

            var filteredSources = new FilteredGameDataSource(save, GameInfo.Sources);
            moveSource.ChangeMoveSource(filteredSources.Moves);
            moveSource.ReloadMoves(legality);

            var movesStr = GameInfo.GetStrings(SettingsService.AppSettings.GetSafeLanguage()).movelist;

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

    public static void CleanWrongData()
    {
        var time = LogUtil.Time("Clean wrong data");

        var bankLoader = new BankLoader();
        var boxLoader = new BoxLoader();
        var pkmLoader = new PkmLoader();
        var pkmVersionLoader = new PkmVersionLoader(pkmLoader);
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

        var banks = bankLoader.GetAllEntities();
        if (banks.Count == 0)
        {
            bankLoader.WriteEntity(new()
            {
                Id = "0",
                Name = "Bank 1",
                IsDefault = true,
                Order = 0,
                View = new(MainBoxIds: [], Saves: []),
            });
            banks = bankLoader.GetAllEntities();
        }
        else
        {
            MainCreateBankAction.NormalizeBankOrders(bankLoader);
        }

        var boxes = boxLoader.GetAllEntities();
        if (boxes.Count == 0)
        {
            boxLoader.WriteEntity(new()
            {
                Id = "0",
                Name = "Box 1",
                Order = 0,
                BankId = banks.First().Key
            });
        }
        else
        {
            boxes.Values.ToList().ForEach(box =>
            {
                if (box.BankId == null)
                {
                    box.BankId = banks.First().Key;
                    boxLoader.WriteEntity(box);
                }
            });

            MainCreateBoxAction.NormalizeBoxOrders(boxLoader);
        }

        /**
         * Convert entities with old/wrong ID format to new one.
         * It checks:
         * - pkm-version entity ID
         * - pkm entity ID
         * - pk filenames
         */
        pkmLoader.GetAllEntities().Values.ToList().ForEach(pkmEntity =>
        {
            var pkmVersions = pkmVersionLoader.GetEntitiesByPkmId(pkmEntity.Id).Values.ToList();

            pkmVersions.ForEach(pkmVersionEntity =>
            {
                try
                {
                    var pkmBytes = File.ReadAllBytes(pkmVersionEntity.Filepath);
                    var pkm = PKMLoader.CreatePKM(pkmBytes, pkmVersionEntity);

                    var oldId = pkmVersionEntity.Id;
                    var expectedId = BasePkmVersionDTO.GetPKMIdBase(pkm);

                    var oldPkmId = pkmVersionEntity.PkmId;

                    var oldFilepath = pkmVersionEntity.Filepath;
                    var expectedFilepath = PKMLoader.GetPKMFilepath(pkm);
                    if (expectedId != oldId)
                    {
                        // must be done first
                        pkmVersionLoader.DeleteEntity(oldId);

                        // update pkm-entity id if main version
                        if (oldPkmId == oldId)
                        {
                            pkmEntity.Id = expectedId;
                            pkmLoader.DeleteEntity(oldId);
                            pkmLoader.WriteEntity(pkmEntity);
                        }

                        // update pk file
                        if (expectedFilepath != oldFilepath)
                        {
                            if (File.Exists(oldFilepath))
                            {
                                Console.WriteLine($"Copy {oldFilepath} to {expectedFilepath}");
                                File.Copy(oldFilepath, expectedFilepath, true);
                            }
                            pkmVersionEntity.Filepath = expectedFilepath;
                        }

                        // update pkm-version-entity id
                        pkmVersionEntity.Id = expectedId;
                        pkmVersionLoader.WriteEntity(pkmVersionEntity);
                    }
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine(ex);
                }
            });

            pkmVersions.ForEach(pkmVersionEntity =>
            {
                if (pkmVersionEntity.PkmId != pkmEntity.Id)
                {
                    pkmVersionEntity.PkmId = pkmEntity.Id;
                    pkmVersionLoader.WriteEntity(pkmVersionEntity);
                }
            });
        });

        // remove pkmVersions with inconsistent data
        pkmVersionLoader.GetAllEntities().Values.ToList().ForEach(pkmVersionEntity =>
        {
            bool deleted = false;
            var pkmEntity = pkmLoader.GetEntity(pkmVersionEntity.PkmId);
            if (pkmEntity == null)
            {
                deleted = pkmVersionLoader.DeleteEntity(pkmVersionEntity.Id);
            }
            else
            {
                var boxEntity = boxLoader.GetEntity(pkmEntity!.BoxId.ToString());
                if (boxEntity == null)
                {
                    deleted = pkmVersionLoader.DeleteEntity(pkmVersionEntity.Id);
                }
                else
                {
                    PKM? pkm = null;
                    try
                    {
                        var pkmBytes = File.ReadAllBytes(pkmVersionEntity.Filepath);
                        pkm = PKMLoader.CreatePKM(pkmBytes, pkmVersionEntity);
                    }
                    catch (Exception ex)
                    {
                        Console.Error.WriteLine($"Path = {pkmVersionEntity.Filepath}");
                        Console.Error.WriteLine(ex);
                    }
                    if (pkm == null)
                    {
                        deleted = pkmVersionLoader.DeleteEntity(pkmVersionEntity.Id);
                    }
                }
            }

            if (!deleted)
            {
                // if filepath is not normalized
                if (pkmVersionEntity.Filepath != MatcherUtil.NormalizePath(pkmVersionEntity.Filepath))
                {
                    pkmVersionEntity.Filepath = MatcherUtil.NormalizePath(pkmVersionEntity.Filepath);
                    pkmVersionLoader.WriteEntity(pkmVersionEntity);
                }
            }
        });

        // remove pkms with inconsistent data
        pkmLoader.GetAllEntities().Values.ToList().ForEach(pkmEntity =>
        {
            var pkmVersions = pkmVersionLoader.GetEntitiesByPkmId(pkmEntity.Id).Values;
            if (pkmVersions.Count == 0)
            {
                pkmLoader.DeleteEntity(pkmEntity.Id);
            }
        });

        var dexService = new DexMainService(loaders);
        pkmVersionLoader.GetAllDtos().ForEach(pkmVersion =>
        {
            dexService.EnablePKM(pkmVersion.Pkm, createOnly: true);
        });

        if (
            bankLoader.HasWritten
            || boxLoader.HasWritten
            || pkmVersionLoader.HasWritten
            || pkmLoader.HasWritten
            || dexLoader.HasWritten
        )
        {
            BackupService.CreateBackup();

            bankLoader.WriteToFile();
            boxLoader.WriteToFile();
            pkmVersionLoader.WriteToFile();
            pkmLoader.WriteToFile();
            dexLoader.WriteToFile();
        }

        time();
    }

    public static async Task CleanMainStorageFiles()
    {
        var time = LogUtil.Time($"Storage obsolete files clean up");

        var loader = await GetLoader();
        var pkmVersionsFilepaths = loader.loaders.pkmVersionLoader.GetAllDtos().Select(dto => dto.PkmVersionEntity.Filepath).ToList();

        var rootDir = ".";
        var storagePath = SettingsService.AppSettings.GetStoragePath();

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
            BackupService.CreateBackup();

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
