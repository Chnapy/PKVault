using PKHeX.Core;

public record MovePkmBankActionInput(string[] pkmIds, uint? sourceSaveId, string bankId, bool attached);

public class MovePkmBankAction(
    IServiceProvider sp,
    ILoadersService loadersService, StaticDataService staticDataService,
    IBoxLoader boxLoader, IBankLoader bankLoader, IPkmVersionLoader pkmVersionLoader,
    MainCreateBoxAction mainCreateBoxAction, SynchronizePkmAction synchronizePkmAction
) : DataAction<MovePkmBankActionInput>
{
    protected override async Task<DataActionPayload?> Execute(MovePkmBankActionInput input, DataUpdateFlags flags)
    {
        if (input.pkmIds.Length == 0)
        {
            throw new ArgumentException($"Pkm ids cannot be empty");
        }

        var loaders = await loadersService.GetLoaders();

        var bank = bankLoader.GetEntity(input.bankId)
            ?? throw new ArgumentException($"Bank not found");

        var mainBoxes = (await boxLoader.GetAllDtos())
            .FindAll(box => box.BankId == input.bankId)
            .OrderBy(box => box.Order).ToList();

        var boxDict = new Dictionary<int, int[]>();
        var boxesOccupationDict = mainBoxes.Select(box => (
            box.Id,
            pkmVersionLoader.GetEntitiesByBox(box.Id)
                .Select(dict => dict.Key)   // boxSlot
                .ToHashSet()
        )).ToDictionary();
        var boxesUnoccupationDict = new Dictionary<string, HashSet<int>>();

        var availableSlotCount = 0;

        foreach (var boxId in boxesOccupationDict.Keys)
        {
            var box = mainBoxes.Find(box => box.Id == boxId);
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

        if (availableSlotCount < input.pkmIds.Length)
        {
            var missingSlotCount = input.pkmIds.Length - availableSlotCount;
            var boxSlotCount = new int[] { missingSlotCount, 30 }.Max();

            var box = mainCreateBoxAction.CreateBox(new(input.bankId, boxSlotCount));

            HashSet<int> unoccupiedSlots = [];
            for (int slot = 0; slot < box.SlotCount; slot++)
            {
                unoccupiedSlots.Add(slot);
                availableSlotCount++;
            }
            if (unoccupiedSlots.Count > 0)
            {
                boxesUnoccupationDict.Add(box.Id, unoccupiedSlots);
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

            if (input.sourceSaveId == null)
            {
                return await MainToMain(input, pkmId, boxId, boxSlot);
            }

            return await SaveToMain(input, loaders, flags, pkmId, boxId, boxSlot);
        }

        // Console.WriteLine($"ENTRIES [{moveDirection}]:\n{string.Join('\n', entries.Select(e => e.Item1 + "_" + e.Item2 + "_" + e.Item3))}");

        List<DataActionPayload> payloads = [];
        foreach (var pkmId in input.pkmIds)
        {
            payloads.Add(await act(pkmId));
        }

        return payloads[0];
    }

    private async Task<DataActionPayload> MainToMain(MovePkmBankActionInput input, string pkmVersionId, string targetBoxId, int targetBoxSlot)
    {
        var entity = pkmVersionLoader.GetEntity(pkmVersionId) ?? throw new KeyNotFoundException("PkmVersion not found");
        var pkm = pkmVersionLoader.GetPkmVersionEntityPkm(entity);

        var pkmsAlreadyPresent = pkmVersionLoader.GetEntitiesByBox(targetBoxId, targetBoxSlot).Values;
        if (pkmsAlreadyPresent.Any())
        {
            throw new Exception("Pkm already present");
        }

        pkmVersionLoader.WriteEntity(entity with
        {
            BoxId = targetBoxId,
            BoxSlot = targetBoxSlot
        });

        var boxName = (await boxLoader.GetDto(targetBoxId.ToString()))?.Name;

        return new(
            type: DataActionType.MOVE_PKM,
            parameters: [pkm.Nickname, null, null, boxName, targetBoxSlot, input.attached]
        );
    }

    private async Task<DataActionPayload> SaveToMain(MovePkmBankActionInput input, DataEntityLoaders loaders, DataUpdateFlags flags, string pkmId, string targetBoxId, int targetBoxSlot)
    {
        var saveLoaders = loaders.saveLoadersDict[(uint)input.sourceSaveId!];

        var savePkm = saveLoaders.Pkms.GetDto(pkmId)
            ?? throw new ArgumentException($"Save Pkm not found, id={pkmId}");

        if (input.attached)
        {
            if (savePkm.IsDuplicate)
            {
                throw new ArgumentException($"Target save already have a pkm with same ID, move attached cannot be done.");
            }
        }

        var pkmVersion = pkmVersionLoader.GetEntity(savePkm.IdBase);

        if (pkmVersion != null && pkmVersion.AttachedSaveId != input.sourceSaveId)
        {
            throw new ArgumentException($"Pkm with same ID already exists, id={savePkm.IdBase}");
        }

        var existingSlots = pkmVersionLoader.GetEntitiesByBox(targetBoxId, targetBoxSlot);
        if (existingSlots.Count > 0)
        {
            throw new Exception("Pkm already present");
        }

        await SaveToMainWithoutCheckTarget(
                input, loaders, flags, (uint)input.sourceSaveId, targetBoxId, targetBoxSlot, savePkm
            );

        saveLoaders.Pkms.FlushParty();

        MovePkmAction.IncrementSaveTradeRecord(saveLoaders.Save);

        var boxName = (await boxLoader.GetDto(targetBoxId.ToString()))?.Name;

        return new(
            type: DataActionType.MOVE_PKM,
            parameters: [savePkm?.Nickname, saveLoaders.Save.Version, null, boxName, targetBoxSlot, input.attached]
        );
    }

    private async Task SaveToMainWithoutCheckTarget(
        MovePkmBankActionInput input,
        DataEntityLoaders loaders, DataUpdateFlags flags,
        uint sourceSaveId, string targetBoxId, int targetBoxSlot,
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
        var pkmVersionEntity = pkmVersionLoader.GetEntity(savePkm.Id);
        var mainPkmAlreadyExists = pkmVersionEntity != null;

        if (pkmVersionEntity == null)
        {
            var staticData = await staticDataService.GetStaticData();

            // create pkm-version
            pkmVersionEntity = await pkmVersionLoader.WriteEntity(new(
                Id: savePkm.IdBase,
                BoxId: targetBoxId,
                BoxSlot: targetBoxSlot,
                IsMain: true,
                AttachedSaveId: input.attached ? sourceSaveId : null,
                AttachedSavePkmIdBase: input.attached ? savePkm.IdBase : null,
                Generation: savePkm.Generation,
                Filepath: pkmVersionLoader.pkmFileLoader.GetPKMFilepath(savePkm.Pkm, staticData.Evolves)
            ), savePkm.Pkm);
        }

        // if moved to already attached pkm, just update it
        if (mainPkmAlreadyExists && pkmVersionEntity.AttachedSaveId != null)
        {
            await synchronizePkmAction.SynchronizeSaveToPkmVersion(new([(pkmVersionEntity.Id, pkmVersionEntity.AttachedSavePkmIdBase!)], loaders));

            if (!input.attached)
            {
                pkmVersionLoader.WriteEntity(pkmVersionEntity with
                {
                    AttachedSaveId = null,
                    AttachedSavePkmIdBase = null
                });
            }
        }

        if (!input.attached)
        {
            // remove pkm from save
            saveLoaders.Pkms.DeleteDto(savePkm.Id);
        }

        new DexMainService(sp, loaders).EnablePKM(savePkm.Pkm, savePkm.Save);

        flags.Dex = true;
    }
}
