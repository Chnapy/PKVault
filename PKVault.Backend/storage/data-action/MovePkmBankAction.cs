using PKHeX.Core;

public record MovePkmBankActionInput(string[] pkmIds, uint? sourceSaveId, string bankId, bool attached);

public class MovePkmBankAction(
    IServiceProvider sp,
    IBoxLoader boxLoader, IBankLoader bankLoader, IPkmVariantLoader pkmVariantLoader, ISavesLoadersService savesLoadersService,
    MainCreateBoxAction mainCreateBoxAction, SynchronizePkmAction synchronizePkmAction
) : DataAction<MovePkmBankActionInput>
{
    protected override async Task<DataActionPayload> Execute(MovePkmBankActionInput input, DataUpdateFlags flags)
    {
        if (input.pkmIds.Length == 0)
        {
            throw new ArgumentException($"Pkm ids cannot be empty");
        }

        var bank = (await bankLoader.GetEntity(input.bankId))
            ?? throw new ArgumentException($"Bank not found");

        var mainBoxes = (await boxLoader.GetEntitiesByBank(input.bankId)).Values
            .OrderBy(box => box.Order).ToList();

        var boxDict = new Dictionary<int, int[]>();
        var boxesOccupationDict = (
            await Task.WhenAll(mainBoxes.Select(async box => (
                box.Id,
                (await pkmVariantLoader.GetEntitiesByBox(box.Id))
                    .Select(dict => dict.Key)   // boxSlot
                    .ToHashSet()
            )))
        ).ToDictionary();
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

            var box = await mainCreateBoxAction.CreateBox(new(input.bankId, boxSlotCount));

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

            return await SaveToMain(input, flags, pkmId, boxId, boxSlot);
        }

        // Console.WriteLine($"ENTRIES [{moveDirection}]:\n{string.Join('\n', entries.Select(e => e.Item1 + "_" + e.Item2 + "_" + e.Item3))}");

        List<DataActionPayload> payloads = [];
        foreach (var pkmId in input.pkmIds)
        {
            payloads.Add(await act(pkmId));
        }

        return payloads[0];
    }

    private async Task<DataActionPayload> MainToMain(MovePkmBankActionInput input, string pkmVariantId, string targetBoxId, int targetBoxSlot)
    {
        var entity = (await pkmVariantLoader.GetEntity(pkmVariantId)) ?? throw new KeyNotFoundException("PkmVariant not found");
        var pkm = await pkmVariantLoader.GetPKM(entity);

        var pkmsAlreadyPresent = (await pkmVariantLoader.GetEntitiesByBox(targetBoxId, targetBoxSlot)).Values;
        if (pkmsAlreadyPresent.Any())
        {
            throw new Exception("Pkm already present");
        }

        entity.BoxId = targetBoxId;
        entity.BoxSlot = targetBoxSlot;
        await pkmVariantLoader.UpdateEntity(entity);

        var boxName = (await boxLoader.GetEntity(targetBoxId.ToString()))?.Name;

        return new(
            type: DataActionType.MOVE_PKM,
            parameters: [pkm.Nickname, null, null, boxName, targetBoxSlot, input.attached]
        );
    }

    private async Task<DataActionPayload> SaveToMain(MovePkmBankActionInput input, DataUpdateFlags flags, string pkmId, string targetBoxId, int targetBoxSlot)
    {
        var saveLoaders = savesLoadersService.GetLoaders((uint)input.sourceSaveId!);

        var savePkm = saveLoaders.Pkms.GetDto(pkmId)
            ?? throw new ArgumentException($"Save Pkm not found, id={pkmId}");

        if (input.attached)
        {
            if (savePkm.IsDuplicate)
            {
                throw new ArgumentException($"Target save already have a pkm with same ID, move attached cannot be done.");
            }
        }

        var pkmVariant = await pkmVariantLoader.GetEntity(savePkm.IdBase);

        if (pkmVariant != null && pkmVariant.AttachedSaveId != input.sourceSaveId)
        {
            throw new ArgumentException($"Pkm with same ID already exists, id={savePkm.IdBase}");
        }

        var existingSlots = await pkmVariantLoader.GetEntitiesByBox(targetBoxId, targetBoxSlot);
        if (existingSlots.Count > 0)
        {
            throw new Exception("Pkm already present");
        }

        await SaveToMainWithoutCheckTarget(
                input, flags, (uint)input.sourceSaveId, targetBoxId, targetBoxSlot, savePkm
            );

        saveLoaders.Pkms.FlushParty();

        MovePkmAction.IncrementSaveTradeRecord(saveLoaders.Save);

        var boxName = (await boxLoader.GetEntity(targetBoxId.ToString()))?.Name;

        return new(
            type: DataActionType.MOVE_PKM,
            parameters: [savePkm?.Nickname, saveLoaders.Save.Version, null, boxName, targetBoxSlot, input.attached]
        );
    }

    private async Task SaveToMainWithoutCheckTarget(
        MovePkmBankActionInput input,
        DataUpdateFlags flags,
        uint sourceSaveId, string targetBoxId, int targetBoxSlot,
        PkmSaveDTO savePkm
    )
    {
        var saveLoaders = savesLoadersService.GetLoaders(sourceSaveId);

        if (savePkm.Pkm is IShadowCapture savePkmShadow && savePkmShadow.IsShadow)
        {
            throw new ArgumentException($"Action forbidden for PkmSave shadow for id={savePkm.Id}");
        }

        if (savePkm.Pkm.IsEgg)
        {
            throw new ArgumentException($"Action forbidden for PkmSave egg for id={savePkm.Id}");
        }

        // get pkm-version
        var pkmVariantEntity = await pkmVariantLoader.GetEntity(savePkm.Id);
        var mainPkmAlreadyExists = pkmVariantEntity != null;

        if (pkmVariantEntity == null)
        {
            // create pkm-version
            pkmVariantEntity = await pkmVariantLoader.AddEntity(new(
                BoxId: targetBoxId,
                BoxSlot: targetBoxSlot,
                IsMain: true,
                AttachedSaveId: input.attached ? sourceSaveId : null,
                AttachedSavePkmIdBase: input.attached ? savePkm.IdBase : null,
                Generation: savePkm.Generation,
                Pkm: savePkm.Pkm
            ));
        }

        // if moved to already attached pkm, just update it
        if (mainPkmAlreadyExists && pkmVariantEntity.AttachedSaveId != null)
        {
            await synchronizePkmAction.SynchronizeSaveToPkmVariant(new([(pkmVariantEntity.Id, pkmVariantEntity.AttachedSavePkmIdBase!)]));

            if (!input.attached)
            {
                pkmVariantEntity.AttachedSaveId = null;
                pkmVariantEntity.AttachedSavePkmIdBase = null;
                await pkmVariantLoader.UpdateEntity(pkmVariantEntity);
            }
        }

        if (!input.attached)
        {
            // remove pkm from save
            saveLoaders.Pkms.DeleteDto(savePkm.Id);
        }

        await new DexMainService(sp).EnablePKM(savePkm.Pkm, savePkm.Save);

        flags.Dex.Ids.Add(savePkm.Species.ToString());
    }
}
