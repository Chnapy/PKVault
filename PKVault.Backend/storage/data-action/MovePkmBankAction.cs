using PKHeX.Core;

public class MovePkmBankAction(
    PkmConvertService pkmConvertService,
    Dictionary<ushort, StaticEvolve> Evolves,
    string[] pkmIds, uint? sourceSaveId,
    string bankId,
    bool attached
) : DataAction
{
    protected override async Task<DataActionPayload> Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        if (pkmIds.Length == 0)
        {
            throw new ArgumentException($"Pkm ids cannot be empty");
        }

        var bank = loaders.bankLoader.GetEntity(bankId)
            ?? throw new ArgumentException($"Bank not found");

        var mainBoxes = loaders.boxLoader.GetAllDtos()
            .FindAll(box => box.BankId == bankId)
            .OrderBy(box => box.Order).ToList();

        var boxDict = new Dictionary<int, int[]>();
        var boxesOccupationDict = mainBoxes.Select(box => (
            box.IdInt,
            loaders.pkmVersionLoader.GetEntitiesByBox(box.IdInt)
                .Select(dict => dict.Key)   // boxSlot
                .ToHashSet()
        )).ToDictionary();
        var boxesUnoccupationDict = new Dictionary<int, HashSet<int>>();

        var availableSlotCount = 0;

        foreach (var boxId in boxesOccupationDict.Keys)
        {
            var box = mainBoxes.Find(box => box.IdInt == boxId);
            HashSet<int> unoccupiedSlots = [];
            for (int slot = 0; slot < box.SlotCount; slot++)
            {
                if (!boxesOccupationDict[boxId].Contains(slot))
                {
                    unoccupiedSlots.Add(slot);
                    availableSlotCount++;
                }
            }
            if (unoccupiedSlots.Count > 0)
            {
                boxesUnoccupationDict.Add(boxId, unoccupiedSlots);
            }
        }

        if (availableSlotCount < pkmIds.Length)
        {
            var missingSlotCount = pkmIds.Length - availableSlotCount;
            var boxSlotCount = new int[] { missingSlotCount, 30 }.Max();

            var box = MainCreateBoxAction.CreateBox(loaders, flags, bankId, boxSlotCount);

            HashSet<int> unoccupiedSlots = [];
            for (int slot = 0; slot < box.SlotCount; slot++)
            {
                unoccupiedSlots.Add(slot);
                availableSlotCount++;
            }
            if (unoccupiedSlots.Count > 0)
            {
                boxesUnoccupationDict.Add(box.IdInt, unoccupiedSlots);
            }
        }

        async Task<DataActionPayload> act(string pkmId)
        {
            var boxId = boxesUnoccupationDict.Keys.First();
            var boxSlot = boxesUnoccupationDict[boxId].First();
            boxesUnoccupationDict[boxId].Remove(boxSlot);
            if (boxesUnoccupationDict[boxId].Count == 0)
            {
                boxesUnoccupationDict.Remove(boxId);
            }

            if (sourceSaveId == null)
            {
                return MainToMain(loaders, flags, pkmId, boxId, boxSlot);
            }

            return await SaveToMain(loaders, flags, pkmId, boxId, boxSlot);
        }

        // Console.WriteLine($"ENTRIES [{moveDirection}]:\n{string.Join('\n', entries.Select(e => e.Item1 + "_" + e.Item2 + "_" + e.Item3))}");

        List<DataActionPayload> payloads = [];
        foreach (var pkmId in pkmIds)
        {
            payloads.Add(await act(pkmId));
        }

        return payloads[0];
    }

    private DataActionPayload MainToMain(DataEntityLoaders loaders, DataUpdateFlags flags, string pkmVersionId, int targetBoxId, int targetBoxSlot)
    {
        var entity = loaders.pkmVersionLoader.GetEntity(pkmVersionId) ?? throw new KeyNotFoundException("PkmVersion not found");
        var pkm = loaders.pkmVersionLoader.GetPkmVersionEntityPkm(entity);

        var pkmsAlreadyPresent = loaders.pkmVersionLoader.GetEntitiesByBox(targetBoxId, targetBoxSlot).Values;
        if (pkmsAlreadyPresent.Any())
        {
            throw new Exception("Pkm already present");
        }

        loaders.pkmVersionLoader.WriteEntity(entity with
        {
            BoxId = targetBoxId,
            BoxSlot = targetBoxSlot
        });

        var boxName = loaders.boxLoader.GetDto(targetBoxId.ToString())?.Name;

        return new(
            type: DataActionType.MOVE_PKM,
            parameters: [pkm.Nickname, null, null, boxName, targetBoxSlot, attached]
        );
    }

    private async Task<DataActionPayload> SaveToMain(DataEntityLoaders loaders, DataUpdateFlags flags, string pkmId, int targetBoxId, int targetBoxSlot)
    {
        var saveLoaders = loaders.saveLoadersDict[(uint)sourceSaveId!];

        var savePkm = saveLoaders.Pkms.GetDto(pkmId)
            ?? throw new ArgumentException($"Save Pkm not found, id={pkmId}");

        if (attached)
        {
            if (savePkm.IsDuplicate)
            {
                throw new ArgumentException($"Target save already have a pkm with same ID, move attached cannot be done.");
            }
        }

        var pkmVersion = loaders.pkmVersionLoader.GetEntity(savePkm.IdBase);

        if (pkmVersion != null && pkmVersion.AttachedSaveId != sourceSaveId)
        {
            throw new ArgumentException($"Pkm with same ID already exists, id={savePkm.IdBase}");
        }

        var existingSlots = loaders.pkmVersionLoader.GetEntitiesByBox(targetBoxId, targetBoxSlot);
        if (existingSlots.Count > 0)
        {
            throw new Exception("Pkm already present");
        }

        await SaveToMainWithoutCheckTarget(
                loaders, flags, (uint)sourceSaveId, targetBoxId, targetBoxSlot, savePkm
            );

        saveLoaders.Pkms.FlushParty();

        CheckPkmTradeRecord(saveLoaders.Save);

        var boxName = loaders.boxLoader.GetDto(targetBoxId.ToString())?.Name;

        return new(
            type: DataActionType.MOVE_PKM,
            parameters: [savePkm?.Nickname, saveLoaders.Save.Version, null, boxName, targetBoxSlot, attached]
        );
    }

    private async Task SaveToMainWithoutCheckTarget(
        DataEntityLoaders loaders, DataUpdateFlags flags,
        uint sourceSaveId, int targetBoxId, int targetBoxSlot,
        PkmSaveDTO savePkm
    )
    {
        var saveLoaders = loaders.saveLoadersDict[sourceSaveId];

        if (savePkm.Pkm is IShadowCapture savePkmShadow && savePkmShadow.IsShadow)
        {
            throw new ArgumentException($"Action forbidden for PkmSave shadow for id={savePkm.Id}");
        }

        if (savePkm.Pkm.IsEgg)
        {
            throw new ArgumentException($"Action forbidden for PkmSave egg for id={savePkm.Id}");
        }

        // get pkm-version
        var pkmVersionEntity = loaders.pkmVersionLoader.GetEntity(savePkm.Id);
        var mainPkmAlreadyExists = pkmVersionEntity != null;

        if (pkmVersionEntity == null)
        {
            // create pkm-version
            pkmVersionEntity = loaders.pkmVersionLoader.WriteEntity(new(
                SchemaVersion: loaders.pkmVersionLoader.GetLastSchemaVersion(),
                Id: savePkm.IdBase,
                BoxId: targetBoxId,
                BoxSlot: targetBoxSlot,
                IsMain: true,
                AttachedSaveId: attached ? sourceSaveId : null,
                AttachedSavePkmIdBase: attached ? savePkm.IdBase : null,
                Generation: savePkm.Generation,
                Filepath: loaders.pkmVersionLoader.pkmFileLoader.GetPKMFilepath(savePkm.Pkm, Evolves)
            ), savePkm.Pkm);
        }

        // if moved to already attached pkm, just update it
        if (mainPkmAlreadyExists && pkmVersionEntity.AttachedSaveId != null)
        {
            await SynchronizePkmAction.SynchronizeSaveToPkmVersion(pkmConvertService, loaders, flags, Evolves, [(pkmVersionEntity.Id, pkmVersionEntity.AttachedSavePkmIdBase!)]);

            if (!attached)
            {
                loaders.pkmVersionLoader.WriteEntity(pkmVersionEntity with
                {
                    AttachedSaveId = null,
                    AttachedSavePkmIdBase = null
                });
            }
        }

        if (!attached)
        {
            // remove pkm from save
            saveLoaders.Pkms.DeleteDto(savePkm.Id);
        }

        new DexMainService(loaders).EnablePKM(savePkm.Pkm, savePkm.Save);

        flags.Dex = true;
    }

    private static void CheckPkmTradeRecord(SaveWrapper save)
    {
        if (save.GetSave() is SAV3FRLG saveG3FRLG)
        {
            var records = new Record3(saveG3FRLG);

            var pkmTradeIndex = 21;

            var pkmTradeCount = records.GetRecord(pkmTradeIndex);
            records.SetRecord(pkmTradeIndex, pkmTradeCount + 1);
        }
        else if (save.GetSave() is SAV4HGSS saveG4HGSS)
        {
            /**
             * Found record data types from Record32:
             * - times-linked
             * - link-battles-win
             * - link-battles-lost
             * - link-trades
             */
            int linkTradesIndex1 = 20;  // cable I guess
            // int linkTradesIndex2 = 25;  // wifi I guess
            // List<int> timesLinkedIndexes = [linkTradesIndex1, linkTradesIndex2, 25, 26, 33];
            // List<int> linkBattlesWinIndexes = [22, 27]; // cable/wifi I guess
            // List<int> linkBattlesLostIndexes = [23, 28]; // cable/wifi I guess
            // List<int> linkTradesIndexes = [linkTradesIndex1, linkTradesIndex2];

            int pkmTradeIndex = linkTradesIndex1;

            // required since SAV4.Records getter creates new instance each call
            var records = saveG4HGSS.Records;

            uint pkmTradeCount = records.GetRecord32(pkmTradeIndex);
            records.SetRecord32(pkmTradeIndex, pkmTradeCount + 1);
            records.EndAccess();
        }
    }
}
