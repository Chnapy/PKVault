using PKHeX.Core;

public record MovePkmActionInput(string[] pkmIds, uint? sourceSaveId,
    uint? targetSaveId, string targetBoxId, int[] targetBoxSlots,
    bool attached);

// TODO refacto, this part is too complex to maintain
public class MovePkmAction(
    IServiceProvider sp,
    StaticDataService staticDataService,
    SynchronizePkmAction synchronizePkmAction, MainCreatePkmVariantAction mainCreatePkmVariantAction,
    IPkmVariantLoader pkmVariantLoader, IBoxLoader boxLoader, ISavesLoadersService savesLoadersService
) : DataAction<MovePkmActionInput>
{
    protected override async Task<DataActionPayload> Execute(MovePkmActionInput input, DataUpdateFlags flags)
    {
        if (input.pkmIds.Length == 0 || input.targetBoxSlots.Length == 0)
        {
            throw new ArgumentException($"Pkm ids and box slots cannot be empty");
        }

        if (input.pkmIds.Length != input.targetBoxSlots.Length)
        {
            throw new ArgumentException($"Pkm ids and box slots should have same length");
        }

        async Task<DataActionPayload> act(string pkmId, int targetBoxSlot)
        {

            if (input.sourceSaveId == null && input.targetSaveId == null)
            {
                return await MainToMain(input, pkmId, targetBoxSlot);
            }

            if (input.sourceSaveId == null && input.targetSaveId != null)
            {
                return await MainToSave(input, flags, pkmId, targetBoxSlot);
            }

            if (input.sourceSaveId != null && input.targetSaveId == null)
            {
                return await SaveToMain(input, flags, pkmId, targetBoxSlot);
            }

            return await SaveToSave(input, pkmId, targetBoxSlot);
        }

        // pkmId, pkmSlot, targetSlot
        List<(string, int, int)> entries = [];

        // Pkms can overlap if moved as group & trigger error
        // They should be sorted following move direction to avoid that
        var mayHaveConflicts = input.sourceSaveId == input.targetSaveId;
        if (mayHaveConflicts)
        {
            for (var i = 0; i < input.pkmIds.Length; i++)
            {
                var pkmSlot = await GetPkmSlot(input.sourceSaveId, input.pkmIds[i]);
                entries.Add((input.pkmIds[i], pkmSlot, input.targetBoxSlots[i]));
            }

            // right => +, left => -
            var moveDirection = entries[0].Item3 - entries[0].Item2;

            // 1. sort by pkm pos
            entries.Sort((a, b) => a.Item2 < b.Item2 ? -1 : 1);

            // 2. sort by move direction: first pkms for left, last pkms for right
            entries.Sort((a, b) => a.Item2 < b.Item2 ? moveDirection : -moveDirection);
        }
        else
        {
            for (var i = 0; i < input.pkmIds.Length; i++)
            {
                entries.Add((input.pkmIds[i], -1, input.targetBoxSlots[i]));
            }
        }

        // Console.WriteLine($"ENTRIES [{moveDirection}]:\n{string.Join('\n', entries.Select(e => e.Item1 + "_" + e.Item2 + "_" + e.Item3))}");

        List<DataActionPayload> payloads = [];
        for (var i = 0; i < entries.Count; i++)
        {
            payloads.Add(await act(entries[i].Item1, entries[i].Item3));
        }

        return payloads[0];
    }

    private async Task<int> GetPkmSlot(uint? saveId, string pkmId)
    {
        if (saveId == null)
        {
            var mainDto = await pkmVariantLoader.GetEntity(pkmId);
            return mainDto.BoxSlot;
        }

        var saveLoaders = savesLoadersService.GetLoaders((uint)saveId);
        var saveDto = saveLoaders.Pkms.GetDto(pkmId);
        return saveDto.BoxSlot;
    }

    private async Task<DataActionPayload> MainToMain(MovePkmActionInput input, string pkmVariantId, int targetBoxSlot)
    {
        var baseEntity = await pkmVariantLoader.GetEntity(pkmVariantId) ?? throw new KeyNotFoundException("Pkm not found");
        var entities = await pkmVariantLoader.GetEntitiesByBox(baseEntity.BoxId, baseEntity.BoxSlot);
        var pkm = await pkmVariantLoader.GetPKM(baseEntity);

        var pkmsAlreadyPresent = (await pkmVariantLoader.GetEntitiesByBox(input.targetBoxId, targetBoxSlot)).Values.ToList();

        foreach (var pkmAlreadyPresent in pkmsAlreadyPresent)
        {
            pkmAlreadyPresent.BoxId = baseEntity.BoxId;
            pkmAlreadyPresent.BoxSlot = baseEntity.BoxSlot;
            await pkmVariantLoader.UpdateEntity(pkmAlreadyPresent);
        }

        foreach (var entity in entities.Values)
        {
            entity.BoxId = input.targetBoxId;
            entity.BoxSlot = targetBoxSlot;
            await pkmVariantLoader.UpdateEntity(entity);
        }

        var boxName = (await boxLoader.GetEntity(input.targetBoxId.ToString()))?.Name;

        return new(
            type: DataActionType.MOVE_PKM,
            parameters: [pkm.Nickname, null, null, boxName, targetBoxSlot, input.attached]
        );
    }

    private async Task<DataActionPayload> SaveToSave(MovePkmActionInput input, string pkmId, int targetBoxSlot)
    {
        var sourceSaveLoaders = savesLoadersService.GetLoaders((uint)input.sourceSaveId!);
        var targetSaveLoaders = savesLoadersService.GetLoaders((uint)input.targetSaveId!);

        var sourcePkmDto = sourceSaveLoaders.Pkms.GetDto(pkmId);
        if (sourcePkmDto == default)
        {
            throw new KeyNotFoundException($"Save Pkm not found, id={pkmId}");
        }

        if (!sourcePkmDto.CanMove)
        {
            throw new ArgumentException("Save Pkm cannot move");
        }

        if (sourcePkmDto.Generation != targetSaveLoaders.Save.Generation)
        {
            throw new ArgumentException($"Save Pkm not compatible with save for id={sourcePkmDto.Id}, generation={sourcePkmDto.Generation}, save.generation={targetSaveLoaders.Save.Generation}");
        }

        if (!targetSaveLoaders.Save.IsSpeciesAllowed(sourcePkmDto.Species))
        {
            throw new ArgumentException($"Save Pkm Species not compatible with save for id={sourcePkmDto.Id}, species={sourcePkmDto.Species}, save.maxSpecies={targetSaveLoaders.Save.MaxSpeciesID}");
        }

        var targetPkmDto = targetSaveLoaders.Pkms.GetDto(input.targetBoxId, targetBoxSlot);
        if (targetPkmDto != null && !targetPkmDto.CanMove)
        {
            throw new ArgumentException("Save Pkm cannot move");
        }

        var sourceAttachedVariant = await pkmVariantLoader.GetEntityBySave(sourcePkmDto.SaveId, sourcePkmDto.IdBase);

        sourceSaveLoaders.Pkms.DeleteDto(sourcePkmDto.Id);

        if (targetPkmDto != null)
        {
            var switchAttachedVariant = await pkmVariantLoader.GetEntityBySave(targetPkmDto.SaveId, targetPkmDto.IdBase);

            var switchedSourcePkmDto = sourceSaveLoaders.Pkms.CreateDTO(
                sourceSaveLoaders.Save, targetPkmDto.Pkm, sourcePkmDto.BoxId, sourcePkmDto.BoxSlot
            );
            sourceSaveLoaders.Pkms.WriteDto(switchedSourcePkmDto);

            if (switchAttachedVariant != null && switchAttachedVariant.AttachedSaveId != sourceSaveLoaders.Save.Id)
            {
                switchAttachedVariant.AttachedSaveId = sourceSaveLoaders.Save.Id;
                switchAttachedVariant.AttachedSavePkmIdBase = switchedSourcePkmDto.IdBase;
                await pkmVariantLoader.UpdateEntity(switchAttachedVariant);
            }
        }

        sourcePkmDto = sourceSaveLoaders.Pkms.CreateDTO(
            targetSaveLoaders.Save, sourcePkmDto.Pkm, input.targetBoxId, targetBoxSlot
        );

        targetSaveLoaders.Pkms.WriteDto(sourcePkmDto);

        if (sourceAttachedVariant != null && sourceAttachedVariant.AttachedSaveId != targetSaveLoaders.Save.Id)
        {
            sourceAttachedVariant.AttachedSaveId = targetSaveLoaders.Save.Id;
            sourceAttachedVariant.AttachedSavePkmIdBase = sourcePkmDto.IdBase;
            await pkmVariantLoader.UpdateEntity(sourceAttachedVariant);
        }

        sourceSaveLoaders.Pkms.FlushParty();
        targetSaveLoaders.Pkms.FlushParty();

        var boxName = targetSaveLoaders.Boxes.GetDto(input.targetBoxId.ToString())?.Name;

        return new(
            type: DataActionType.MOVE_PKM,
            parameters: [sourcePkmDto.Nickname, sourceSaveLoaders.Save.Version, targetSaveLoaders.Save.Version, boxName, targetBoxSlot, input.attached]
        );
    }

    private async Task<DataActionPayload> MainToSave(MovePkmActionInput input, DataUpdateFlags flags, string pkmVariantId, int targetBoxSlot)
    {
        var saveLoaders = savesLoadersService.GetLoaders((uint)input.targetSaveId!);

        var pkmVariant = await pkmVariantLoader.GetEntity(pkmVariantId);
        var pkm = await pkmVariantLoader.GetPKM(pkmVariant);

        var pkmVariants = (await pkmVariantLoader.GetEntitiesByBox(pkmVariant.BoxId!, pkmVariant.BoxSlot!)).Values.ToList();

        var pkmVariantForGen = pkmVariants.Find(version => version.Generation == saveLoaders.Save.Generation);

        // if pkmVariant for generation doesn't exist
        // create pkmVariant
        // and retry action
        if (pkmVariantForGen == default)
        {
            var mainVariant = pkmVariants.Find(variant => variant.IsMain);

            await mainCreatePkmVariantAction.ExecuteWithPayload(new(
                pkmVariantId: mainVariant.Id,
                generation: saveLoaders.Save.Generation
            ), flags);

            // now pkmVariant for generation is created
            // so retry the action, with attached mode
            return await MainToSave(
                new(input.pkmIds, input.sourceSaveId, input.targetSaveId, input.targetBoxId, input.targetBoxSlots, true),
                flags,
                pkmVariantId,
                targetBoxSlot
            );
        }

        // if move not-attached with multiple variants
        // retry as attached
        if (!input.attached && pkmVariants.Count > 1)
        {
            // retry the action, with attached mode
            return await MainToSave(
                new(input.pkmIds, input.sourceSaveId, input.targetSaveId, input.targetBoxId, input.targetBoxSlots, true),
                flags,
                pkmVariantId,
                targetBoxSlot
            );
        }

        if (input.attached)
        {
            var hasDuplicates = pkmVariants.Any(pkm => saveLoaders.Pkms.GetDtosByIdBase(pkm.Id).Count > 0);
            if (hasDuplicates)
            {
                throw new ArgumentException($"Target save already have a pkm with same ID, move attached cannot be done.");
            }
        }

        var existingSlot = saveLoaders.Pkms.GetDto(input.targetBoxId, targetBoxSlot);
        if (input.attached && existingSlot != null)
        {
            throw new ArgumentException("Switch not possible with attached move");
        }

        await MainToSaveWithoutCheckTarget(input, flags, (uint)input.targetSaveId, input.targetBoxId, targetBoxSlot, pkmVariants);

        if (existingSlot != null)
        {
            await SaveToMainWithoutCheckTarget(input, flags, (uint)input.targetSaveId, pkmVariant.BoxId, pkmVariant.BoxSlot, existingSlot);
        }

        saveLoaders.Pkms.FlushParty();

        IncrementSaveTradeRecord(saveLoaders.Save);

        var boxName = saveLoaders.Boxes.GetDto(input.targetBoxId.ToString())?.Name;

        return new(
            type: DataActionType.MOVE_PKM,
            parameters: [pkm.Nickname, null, saveLoaders.Save.Version, boxName, targetBoxSlot, input.attached]
        );
    }

    private async Task<DataActionPayload> SaveToMain(MovePkmActionInput input, DataUpdateFlags flags, string pkmId, int targetBoxSlot)
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

        var existingSlots = (await pkmVariantLoader.GetEntitiesByBox(input.targetBoxId, targetBoxSlot)).Values.ToList();
        if (input.attached && existingSlots.Count > 0)
        {
            throw new ArgumentException("Switch not possible with attached move");
        }

        await SaveToMainWithoutCheckTarget(
            input, flags, (uint)input.sourceSaveId, input.targetBoxId, targetBoxSlot, savePkm
        );

        if (existingSlots.Count > 0)
        {
            await MainToSaveWithoutCheckTarget(
                input, flags, (uint)input.sourceSaveId, savePkm!.BoxId.ToString(), savePkm.BoxSlot, existingSlots
            );
        }

        saveLoaders.Pkms.FlushParty();

        IncrementSaveTradeRecord(saveLoaders.Save);

        var boxName = (await boxLoader.GetEntity(input.targetBoxId.ToString()))?.Name;

        return new(
            type: DataActionType.MOVE_PKM,
            parameters: [savePkm?.Nickname, saveLoaders.Save.Version, null, boxName, targetBoxSlot, input.attached]
        );
    }

    private async Task MainToSaveWithoutCheckTarget(
        MovePkmActionInput input,
        DataUpdateFlags flags,
        uint targetSaveId, string targetBoxId, int targetBoxSlot,
        List<PkmVariantEntity> relatedPkmVariants
    )
    {
        var saveLoaders = savesLoadersService.GetLoaders(targetSaveId);

        if (!input.attached && relatedPkmVariants.Count > 1)
        {
            throw new ArgumentException($"Not-attached move from main to save requires a single version");
        }

        var pkmVariant = relatedPkmVariants.Find(version => version.Generation == saveLoaders.Save.Generation);

        if (pkmVariant == default)
        {
            throw new ArgumentException($"PkmVariantEntity not found for generation={saveLoaders.Save.Generation}");
        }

        var attachedPkmVariant = relatedPkmVariants.Find(version => version.AttachedSaveId != default);
        if (attachedPkmVariant != null)
        {
            throw new ArgumentException($"PkmVariantEntity already in save, id={attachedPkmVariant.Id}, saveId={attachedPkmVariant.AttachedSaveId}");
        }

        if (pkmVariant.Generation != saveLoaders.Save.Generation)
        {
            throw new ArgumentException($"PkmVariantEntity Generation not compatible with save for id={pkmVariant.Id}, generation={pkmVariant.Generation}, save.generation={saveLoaders.Save.Generation}");
        }

        var pkm = await pkmVariantLoader.GetPKM(pkmVariant);

        if (!saveLoaders.Save.IsSpeciesAllowed(pkm.Species))
        {
            throw new ArgumentException($"PkmVariantEntity Species not compatible with save for id={pkmVariant.Id}, species={pkm.Species}, save.maxSpecies={saveLoaders.Save.MaxSpeciesID}");
        }

        await CheckG3NationalDex(saveLoaders.Save, pkm.Species);

        var pkmSaveDTO = saveLoaders.Pkms.CreateDTO(
            saveLoaders.Save, pkm, targetBoxId, targetBoxSlot
        );
        saveLoaders.Pkms.WriteDto(pkmSaveDTO);

        if (input.attached)
        {
            pkmVariant.AttachedSaveId = saveLoaders.Save.Id;
            pkmVariant.AttachedSavePkmIdBase = pkmSaveDTO.IdBase;
            await pkmVariantLoader.UpdateEntity(pkmVariant);
        }
        else
        {
            await pkmVariantLoader.DeleteEntity(pkmVariant);
        }

        if (input.attached && (await pkmVariantLoader.GetEntityBySave(pkmSaveDTO.SaveId, pkmSaveDTO.IdBase)) == null)
        {
            throw new ArgumentException($"pkmSaveDTO.PkmVariantId is null, should be {pkmSaveDTO.Id}");
        }

        if (pkmVariant.AttachedSaveId != null)
        {
            await synchronizePkmAction.SynchronizeSaveToPkmVariant(new([(pkmVariant.Id, pkmVariant.AttachedSavePkmIdBase!)]));
        }
    }

    private async Task SaveToMainWithoutCheckTarget(
        MovePkmActionInput input,
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
        var pkmVariantEntity = await pkmVariantLoader.GetEntityBySave(savePkm.SaveId, savePkm.IdBase);
        var mainPkmAlreadyExists = pkmVariantEntity != null;

        // create pkm-version
        pkmVariantEntity ??= await pkmVariantLoader.AddEntity(new(
            BoxId: targetBoxId,
            BoxSlot: targetBoxSlot,
            IsMain: true,
            AttachedSaveId: input.attached ? sourceSaveId : null,
            AttachedSavePkmIdBase: input.attached ? savePkm.IdBase : null,
            Generation: savePkm.Generation,
            Pkm: savePkm.Pkm
        ));

        // if moved to already attached pkm, just update it
        if (mainPkmAlreadyExists && pkmVariantEntity!.AttachedSaveId != null)
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
    }

    private async Task CheckG3NationalDex(SaveWrapper save, int species)
    {
        // enable national-dex in G3 RSE if pkm outside of regional-dex
        if (save.GetSave() is SAV3 saveG3RSE && saveG3RSE is IGen3Hoenn && !saveG3RSE.NationalDex)
        {
            var staticData = await staticDataService.GetStaticData();
            var isInDex = staticData.Species[(ushort)species].IsInHoennDex;

            if (!isInDex)
            {
                saveG3RSE.NationalDex = true;
            }
        }
    }

    public static void IncrementSaveTradeRecord(SaveWrapper save)
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
