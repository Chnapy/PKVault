using PKHeX.Core;

public record MovePkmActionInput(string[] pkmIds, uint? sourceSaveId,
    uint? targetSaveId, string targetBoxId, int[] targetBoxSlots,
    bool attached);

public class MovePkmAction(
    IServiceProvider sp,
    ILoadersService loadersService, StaticDataService staticDataService,
    SynchronizePkmAction synchronizePkmAction,
    IPkmVersionLoader pkmVersionLoader, IBoxLoader boxLoader
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

        var loaders = await loadersService.GetLoaders();

        async Task<DataActionPayload> act(string pkmId, int targetBoxSlot)
        {

            if (input.sourceSaveId == null && input.targetSaveId == null)
            {
                return await MainToMain(input, pkmId, targetBoxSlot);
            }

            if (input.sourceSaveId == null && input.targetSaveId != null)
            {
                return await MainToSave(input, loaders, flags, pkmId, targetBoxSlot);
            }

            if (input.sourceSaveId != null && input.targetSaveId == null)
            {
                return await SaveToMain(input, loaders, flags, pkmId, targetBoxSlot);
            }

            return SaveToSave(input, loaders, pkmId, targetBoxSlot);
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
        var loaders = await loadersService.GetLoaders();

        if (saveId == null)
        {
            var mainDto = await pkmVersionLoader.GetDto(pkmId);
            return mainDto.BoxSlot;
        }

        var saveLoaders = loaders.saveLoadersDict[(uint)saveId];
        var saveDto = saveLoaders.Pkms.GetDto(pkmId);
        return saveDto.BoxSlot;
    }

    private async Task<DataActionPayload> MainToMain(MovePkmActionInput input, string pkmVersionId, int targetBoxSlot)
    {
        var baseEntity = pkmVersionLoader.GetEntity(pkmVersionId) ?? throw new KeyNotFoundException("Pkm not found");
        var entities = pkmVersionLoader.GetEntitiesByBox(baseEntity.BoxId, baseEntity.BoxSlot);
        var pkm = pkmVersionLoader.GetPkmVersionEntityPkm(baseEntity);

        var pkmsAlreadyPresent = pkmVersionLoader.GetEntitiesByBox(input.targetBoxId, targetBoxSlot).Values.ToList();

        pkmsAlreadyPresent.ToList().ForEach(pkmAlreadyPresent =>
        {
            pkmVersionLoader.WriteEntity(pkmAlreadyPresent with
            {
                BoxId = baseEntity.BoxId,
                BoxSlot = baseEntity.BoxSlot
            });
        });

        entities.Values.ToList().ForEach(entity =>
        {
            pkmVersionLoader.WriteEntity(entity with
            {
                BoxId = input.targetBoxId,
                BoxSlot = targetBoxSlot
            });
        });

        var boxName = (await boxLoader.GetDto(input.targetBoxId.ToString()))?.Name;

        return new(
            type: DataActionType.MOVE_PKM,
            parameters: [pkm.Nickname, null, null, boxName, targetBoxSlot, input.attached]
        );
    }

    private DataActionPayload SaveToSave(MovePkmActionInput input, DataEntityLoaders loaders, string pkmId, int targetBoxSlot)
    {
        var sourceSaveLoaders = loaders.saveLoadersDict[(uint)input.sourceSaveId!];
        var targetSaveLoaders = loaders.saveLoadersDict[(uint)input.targetSaveId!];

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

        sourceSaveLoaders.Pkms.DeleteDto(sourcePkmDto.Id);

        if (targetPkmDto != null)
        {
            var switchedSourcePkmDto = sourceSaveLoaders.Pkms.CreateDTO(
                sourceSaveLoaders.Save, targetPkmDto.Pkm, sourcePkmDto.BoxId, sourcePkmDto.BoxSlot
            );
            sourceSaveLoaders.Pkms.WriteDto(switchedSourcePkmDto);
        }

        sourcePkmDto = sourceSaveLoaders.Pkms.CreateDTO(
            sourcePkmDto.Save, sourcePkmDto.Pkm, input.targetBoxId, targetBoxSlot
        );

        targetSaveLoaders.Pkms.WriteDto(sourcePkmDto);

        sourceSaveLoaders.Pkms.FlushParty();
        targetSaveLoaders.Pkms.FlushParty();

        var boxName = targetSaveLoaders.Boxes.GetDto(input.targetBoxId.ToString())?.Name;

        return new(
            type: DataActionType.MOVE_PKM,
            parameters: [sourcePkmDto.Nickname, sourceSaveLoaders.Save.Version, targetSaveLoaders.Save.Version, boxName, targetBoxSlot, input.attached]
        );
    }

    private async Task<DataActionPayload> MainToSave(MovePkmActionInput input, DataEntityLoaders loaders, DataUpdateFlags flags, string pkmVersionId, int targetBoxSlot)
    {
        var saveLoaders = loaders.saveLoadersDict[(uint)input.targetSaveId!];

        var pkmVersion = pkmVersionLoader.GetEntity(pkmVersionId);
        var pkm = pkmVersionLoader.GetPkmVersionEntityPkm(pkmVersion);

        var pkmVersions = pkmVersionLoader.GetEntitiesByBox(pkmVersion.BoxId!, pkmVersion.BoxSlot!).Values.ToList();

        if (input.attached)
        {
            var hasDuplicates = pkmVersions.Any(pkm => saveLoaders.Pkms.GetDtosByIdBase(pkm.Id).Count > 0);
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

        await MainToSaveWithoutCheckTarget(input, loaders, flags, (uint)input.targetSaveId, input.targetBoxId, targetBoxSlot, pkmVersions);

        if (existingSlot != null)
        {
            await SaveToMainWithoutCheckTarget(input, loaders, flags, (uint)input.targetSaveId, pkmVersion.BoxId, pkmVersion.BoxSlot, existingSlot);
        }

        saveLoaders.Pkms.FlushParty();

        IncrementSaveTradeRecord(saveLoaders.Save);

        var boxName = saveLoaders.Boxes.GetDto(input.targetBoxId.ToString())?.Name;

        return new(
            type: DataActionType.MOVE_PKM,
            parameters: [pkm.Nickname, null, saveLoaders.Save.Version, boxName, targetBoxSlot, input.attached]
        );
    }

    private async Task<DataActionPayload> SaveToMain(MovePkmActionInput input, DataEntityLoaders loaders, DataUpdateFlags flags, string pkmId, int targetBoxSlot)
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

        var existingSlots = pkmVersionLoader.GetEntitiesByBox(input.targetBoxId, targetBoxSlot).Values.ToList();
        if (input.attached && existingSlots.Count > 0)
        {
            throw new ArgumentException("Switch not possible with attached move");
        }

        await SaveToMainWithoutCheckTarget(
            input, loaders, flags, (uint)input.sourceSaveId, input.targetBoxId, targetBoxSlot, savePkm
        );

        if (existingSlots.Count > 0)
        {
            await MainToSaveWithoutCheckTarget(
                input, loaders, flags, (uint)input.sourceSaveId, savePkm!.BoxId.ToString(), savePkm.BoxSlot, existingSlots
            );
        }

        saveLoaders.Pkms.FlushParty();

        IncrementSaveTradeRecord(saveLoaders.Save);

        var boxName = (await boxLoader.GetDto(input.targetBoxId.ToString()))?.Name;

        return new(
            type: DataActionType.MOVE_PKM,
            parameters: [savePkm?.Nickname, saveLoaders.Save.Version, null, boxName, targetBoxSlot, input.attached]
        );
    }

    private async Task MainToSaveWithoutCheckTarget(
        MovePkmActionInput input,
        DataEntityLoaders loaders, DataUpdateFlags flags,
        uint targetSaveId, string targetBoxId, int targetBoxSlot,
        List<PkmVersionEntity> relatedPkmVersions
    )
    {
        var saveLoaders = loaders.saveLoadersDict[targetSaveId];

        if (!input.attached && relatedPkmVersions.Count > 1)
        {
            throw new ArgumentException($"Not-attached move from main to save requires a single version");
        }

        var pkmVersion = relatedPkmVersions.Find(version => version.Generation == saveLoaders.Save.Generation);

        if (pkmVersion == default)
        {
            throw new ArgumentException($"PkmVersionEntity not found for generation={saveLoaders.Save.Generation}");
        }

        if (pkmVersion.AttachedSaveId != default)
        {
            throw new ArgumentException($"PkmVersionEntity already in save, id={pkmVersion.Id}, saveId={pkmVersion.AttachedSaveId}");
        }

        if (pkmVersion.Generation != saveLoaders.Save.Generation)
        {
            throw new ArgumentException($"PkmVersionEntity Generation not compatible with save for id={pkmVersion.Id}, generation={pkmVersion.Generation}, save.generation={saveLoaders.Save.Generation}");
        }

        var pkm = pkmVersionLoader.GetPkmVersionEntityPkm(pkmVersion);

        if (!saveLoaders.Save.IsSpeciesAllowed(pkm.Species))
        {
            throw new ArgumentException($"PkmVersionEntity Species not compatible with save for id={pkmVersion.Id}, species={pkm.Species}, save.maxSpecies={saveLoaders.Save.MaxSpeciesID}");
        }

        await CheckG3NationalDex(saveLoaders.Save, pkm.Species);

        var pkmSaveDTO = saveLoaders.Pkms.CreateDTO(
            saveLoaders.Save, pkm, targetBoxId, targetBoxSlot
        );
        saveLoaders.Pkms.WriteDto(pkmSaveDTO);

        if (input.attached)
        {
            pkmVersion = pkmVersionLoader.WriteEntity(pkmVersion with
            {
                AttachedSaveId = saveLoaders.Save.Id,
                AttachedSavePkmIdBase = pkmSaveDTO.IdBase
            });
        }
        else
        {
            pkmVersionLoader.DeleteEntity(pkmVersion.Id);
        }

        if (input.attached && pkmVersionLoader.GetEntityBySave(pkmSaveDTO.SaveId, pkmSaveDTO.IdBase) == null)
        {
            throw new ArgumentException($"pkmSaveDTO.PkmVersionId is null, should be {pkmSaveDTO.Id}");
        }

        if (pkmVersion.AttachedSaveId != null)
        {
            await synchronizePkmAction.SynchronizeSaveToPkmVersion(new([(pkmVersion.Id, pkmVersion.AttachedSavePkmIdBase!)], loaders));
        }

        flags.Dex = true;
    }

    private async Task SaveToMainWithoutCheckTarget(
        MovePkmActionInput input,
        DataEntityLoaders loaders, DataUpdateFlags flags,
        uint sourceSaveId, string targetBoxId, int targetBoxSlot,
        PkmSaveDTO savePkm
    )
    {
        var saveLoaders = loaders.saveLoadersDict[sourceSaveId];

        // var savePkm = await saveLoaders.Pkms.GetDto(pkmId);

        // if (savePkm == default)
        // {
        //     throw new Exception($"PkmSaveDTO not found for id={pkmId}, count={(await saveLoaders.Pkms.GetAllDtos()).Count}");
        // }

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
        if (mainPkmAlreadyExists && pkmVersionEntity!.AttachedSaveId != null)
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
