using PKHeX.Core;

public class MovePkmBankAction(
    PkmConvertService pkmConvertService,
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
        var mainPkms = loaders.pkmLoader.GetAllDtos();

        var boxDict = new Dictionary<uint, int[]>();
        var boxesOccupationDict = mainBoxes.Select(box => (
            (uint)box.IdInt,
            mainPkms.FindAll(pkm => pkm.BoxId == box.IdInt)
                .Select(pkm => pkm.BoxSlot)
                .ToHashSet()
        )).ToDictionary();
        var boxesUnoccupationDict = new Dictionary<uint, HashSet<uint>>();

        var availableSlotCount = 0;

        foreach (var boxId in boxesOccupationDict.Keys)
        {
            var box = mainBoxes.Find(box => box.IdInt == boxId);
            HashSet<uint> unoccupiedSlots = [];
            for (uint slot = 0; slot < box.SlotCount; slot++)
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

            HashSet<uint> unoccupiedSlots = [];
            for (uint slot = 0; slot < box.SlotCount; slot++)
            {
                unoccupiedSlots.Add(slot);
                availableSlotCount++;
            }
            if (unoccupiedSlots.Count > 0)
            {
                boxesUnoccupationDict.Add((uint)box.IdInt, unoccupiedSlots);
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

    private DataActionPayload MainToMain(DataEntityLoaders loaders, DataUpdateFlags flags, string pkmId, uint targetBoxId, uint targetBoxSlot)
    {
        var dto = loaders.pkmLoader.GetDto(pkmId);
        if (dto == default)
        {
            throw new KeyNotFoundException("Pkm not found");
        }

        var pkmAlreadyPresent = loaders.pkmLoader.GetAllDtos().Find(pkm =>
            pkm.Id != pkmId
            && pkm.BoxId == targetBoxId
            && pkm.BoxSlot == targetBoxSlot
        );
        if (pkmAlreadyPresent != null)
        {
            throw new Exception("Pkm already present");
        }

        loaders.pkmLoader.WriteEntity(dto.PkmEntity with
        {
            BoxId = targetBoxId,
            BoxSlot = targetBoxSlot
        });

        var pkmName = loaders.pkmVersionLoader.GetDto(pkmId)?.Nickname;
        var boxName = loaders.boxLoader.GetDto(targetBoxId.ToString())?.Name;

        return new(
            type: DataActionType.MOVE_PKM,
            parameters: [pkmName, null, null, boxName, targetBoxSlot, attached]
        );
    }

    private async Task<DataActionPayload> SaveToMain(DataEntityLoaders loaders, DataUpdateFlags flags, string pkmId, uint targetBoxId, uint targetBoxSlot)
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

        var pkmDto = loaders.pkmLoader.GetDto(savePkm.IdBase);

        if (pkmDto != null && pkmDto.SaveId != sourceSaveId)
        {
            throw new ArgumentException($"Pkm with same ID already exists, id={savePkm.IdBase}");
        }

        var existingSlot = loaders.pkmLoader.GetAllDtos().Find(dto => dto.BoxId == targetBoxId && dto.BoxSlot == targetBoxSlot);
        if (existingSlot != null)
        {
            throw new Exception("Pkm already present");
        }
        var relatedPkmVersionDtos = existingSlot != null
            ? loaders.pkmVersionLoader.GetDtosByPkmId(existingSlot.Id).Values.ToList()
            : [];

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
        uint sourceSaveId, uint targetBoxId, uint targetBoxSlot,
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
            // create pkm & pkm-version
            var pkmEntityToCreate = loaders.pkmLoader.WriteEntity(new(
                SchemaVersion: loaders.pkmLoader.GetLastSchemaVersion(),
                Id: savePkm.IdBase,
                BoxId: targetBoxId,
                BoxSlot: targetBoxSlot,
                SaveId: attached ? sourceSaveId : null
            ));

            pkmVersionEntity = loaders.pkmVersionLoader.WriteEntity(new(
                SchemaVersion: loaders.pkmVersionLoader.GetLastSchemaVersion(),
                Id: savePkm.IdBase,
                PkmId: pkmEntityToCreate.Id,
                Generation: savePkm.Generation,
                Filepath: PKMLoader.GetPKMFilepath(savePkm.Pkm)
            ), savePkm.Pkm);
        }

        var pkmDto = loaders.pkmLoader.GetDto(pkmVersionEntity.PkmId);

        // if moved to already attached pkm, just update it
        if (mainPkmAlreadyExists && pkmDto!.SaveId != default)
        {
            await SynchronizePkmAction.SynchronizeSaveToPkmVersion(pkmConvertService, loaders, flags, [(pkmVersionEntity.PkmId, null)]);

            if (!attached)
            {
                loaders.pkmLoader.WriteEntity(pkmDto.PkmEntity with { SaveId = default });
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
