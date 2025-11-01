using PKHeX.Core;

public class MovePkmAction(
    string[] pkmIds, uint? sourceSaveId,
    uint? targetSaveId, int targetBoxId, int[] targetBoxSlots,
    bool attached
) : DataAction
{
    protected override async Task<DataActionPayload> Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        if (pkmIds.Length == 0 || targetBoxSlots.Length == 0)
        {
            throw new ArgumentException($"Pkm ids and box slots cannot be empty");
        }

        if (pkmIds.Length != targetBoxSlots.Length)
        {
            throw new ArgumentException($"Pkm ids and box slots should have same length");
        }

        async Task<DataActionPayload> act(string pkmId, int targetBoxSlot)
        {

            if (sourceSaveId == null && targetSaveId == null)
            {
                return MainToMain(loaders, flags, pkmId, targetBoxSlot);
            }

            if (sourceSaveId == null && targetSaveId != null)
            {
                return await MainToSave(loaders, flags, pkmId, targetBoxSlot);
            }

            if (sourceSaveId != null && targetSaveId == null)
            {
                return await SaveToMain(loaders, flags, pkmId, targetBoxSlot);
            }

            return SaveToSave(loaders, flags, pkmId, targetBoxSlot);
        }

        // pkmId, pkmSlot, targetSlot
        List<(string, int, int)> entries = [];

        // Pkms can overlap if moved as group & trigger error
        // They should be sorted following move direction to avoid that
        var mayHaveConflicts = sourceSaveId == targetSaveId;
        if (mayHaveConflicts)
        {
            for (var i = 0; i < pkmIds.Length; i++)
            {
                var pkmSlot = GetPkmSlot(loaders, sourceSaveId, pkmIds[i]);
                entries.Add((pkmIds[i], pkmSlot, targetBoxSlots[i]));
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
            for (var i = 0; i < pkmIds.Length; i++)
            {
                entries.Add((pkmIds[i], -1, targetBoxSlots[i]));
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

    private static int GetPkmSlot(DataEntityLoaders loaders, uint? saveId, string pkmId)
    {
        if (saveId == null)
        {
            var mainDto = loaders.pkmLoader.GetDto(pkmId);
            return (int)mainDto.BoxSlot;
        }

        var saveLoaders = loaders.saveLoadersDict[(uint)saveId];
        var saveDto = saveLoaders.Pkms.GetDto(pkmId);
        return saveDto.BoxSlot;
    }

    private DataActionPayload MainToMain(DataEntityLoaders loaders, DataUpdateFlags flags, string pkmId, int targetBoxSlot)
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
            pkmAlreadyPresent.PkmEntity.BoxId = dto.PkmEntity.BoxId;
            pkmAlreadyPresent.PkmEntity.BoxSlot = dto.PkmEntity.BoxSlot;
            loaders.pkmLoader.WriteDto(pkmAlreadyPresent);
        }

        dto.PkmEntity.BoxId = (uint)targetBoxId;
        dto.PkmEntity.BoxSlot = (uint)targetBoxSlot;

        loaders.pkmLoader.WriteDto(dto);

        flags.MainPkms = true;

        var pkmName = loaders.pkmVersionLoader.GetDto(pkmId)?.Nickname;
        var boxName = loaders.boxLoader.GetDto(targetBoxId.ToString())?.Name;

        return new()
        {
            type = DataActionType.MOVE_PKM,
            parameters = [pkmName, null, null, boxName, targetBoxSlot, attached]
        };
    }

    private DataActionPayload SaveToSave(DataEntityLoaders loaders, DataUpdateFlags flags, string pkmId, int targetBoxSlot)
    {
        var sourceSaveLoaders = loaders.saveLoadersDict[(uint)sourceSaveId!];
        var targetSaveLoaders = loaders.saveLoadersDict[(uint)targetSaveId!];
        var notSameSave = sourceSaveId != targetSaveId;

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

        if (!SaveInfosDTO.IsSpeciesAllowed(sourcePkmDto.Species, targetSaveLoaders.Save))
        {
            throw new ArgumentException($"Save Pkm Species not compatible with save for id={sourcePkmDto.Id}, species={sourcePkmDto.Species}, save.maxSpecies={targetSaveLoaders.Save.MaxSpeciesID}");
        }

        var targetPkmDto = targetSaveLoaders.Pkms.GetDto(targetBoxId, targetBoxSlot);
        if (targetPkmDto != null && !targetPkmDto.CanMove)
        {
            throw new ArgumentException("Save Pkm cannot move");
        }

        sourceSaveLoaders.Pkms.DeleteDto(sourcePkmDto.Id);

        if (targetPkmDto != null)
        {
            var switchedSourcePkmDto = PkmSaveDTO.FromPkm(sourceSaveLoaders.Save, targetPkmDto.Pkm, sourcePkmDto.BoxId, sourcePkmDto.BoxSlot);
            sourceSaveLoaders.Pkms.WriteDto(switchedSourcePkmDto);
        }

        sourcePkmDto.BoxId = targetBoxId;
        sourcePkmDto.BoxSlot = targetBoxSlot;

        targetSaveLoaders.Pkms.WriteDto(sourcePkmDto);

        sourceSaveLoaders.Pkms.FlushParty();
        targetSaveLoaders.Pkms.FlushParty();

        if (notSameSave)
        {
            flags.Saves.Add(new()
            {
                SaveId = sourceSaveLoaders.Save.ID32,
                SavePkms = true
            });
        }

        flags.Saves.Add(new()
        {
            SaveId = targetSaveLoaders.Save.ID32,
            SavePkms = true
        });

        var boxName = targetSaveLoaders.Boxes.GetDto(targetBoxId.ToString())?.Name;

        return new()
        {
            type = DataActionType.MOVE_PKM,
            parameters = [sourcePkmDto.Nickname, sourceSaveLoaders.Save.Version, targetSaveLoaders.Save.Version, boxName, targetBoxSlot, attached]
        };
    }

    private async Task<DataActionPayload> MainToSave(DataEntityLoaders loaders, DataUpdateFlags flags, string pkmId, int targetBoxSlot)
    {
        var saveLoaders = loaders.saveLoadersDict[(uint)targetSaveId!];

        if (attached)
        {
            var hasDuplicates = saveLoaders.Pkms.GetAllDtos().Any(dto => dto.IdBase == pkmId);
            if (hasDuplicates)
            {
                throw new ArgumentException($"Target save already have a pkm with same ID, move attached cannot be done.");
            }
        }

        var relatedPkmVersionDtos = loaders.pkmVersionLoader.GetDtosByPkmId(pkmId).Values.ToList();
        var pkmDto = loaders.pkmLoader.GetDto(pkmId);

        var existingSlot = saveLoaders.Pkms.GetDto(targetBoxId, targetBoxSlot);
        if (attached && existingSlot != null)
        {
            throw new ArgumentException("Switch not possible with attached move");
        }

        await MainToSaveWithoutCheckTarget(loaders, flags, (uint)targetSaveId, targetBoxId, targetBoxSlot, relatedPkmVersionDtos);

        if (existingSlot != null)
        {
            await SaveToMainWithoutCheckTarget(loaders, flags, (uint)targetSaveId, pkmDto!.BoxId, pkmDto.BoxSlot, existingSlot);
        }

        saveLoaders.Pkms.FlushParty();

        CheckPkmTradeRecord(saveLoaders.Save);

        var boxName = saveLoaders.Boxes.GetDto(targetBoxId.ToString())?.Name;

        return new()
        {
            type = DataActionType.MOVE_PKM,
            parameters = [relatedPkmVersionDtos[0].Nickname, null, saveLoaders.Save.Version, boxName, targetBoxSlot, attached]
        };
    }

    private async Task<DataActionPayload> SaveToMain(DataEntityLoaders loaders, DataUpdateFlags flags, string pkmId, int targetBoxSlot)
    {
        var saveLoaders = loaders.saveLoadersDict[(uint)sourceSaveId!];

        if (attached)
        {
            var hasDuplicates = WarningsService.GetWarningsDTO().PkmDuplicateWarnings.Any(warn => warn.SaveId == sourceSaveId && warn.DuplicateIdBases.Contains(pkmId));
            if (hasDuplicates)
            {
                throw new ArgumentException($"Target save already have a pkm with same ID, move attached cannot be done.");
            }
        }

        var savePkm = saveLoaders.Pkms.GetDto(pkmId)
            ?? throw new ArgumentException($"Save Pkm not found, id={pkmId}");
        var pkmDto = loaders.pkmLoader.GetDto(savePkm.IdBase);

        if (pkmDto != null && pkmDto.SaveId != sourceSaveId)
        {
            throw new ArgumentException($"Pkm with same ID already exists, id={savePkm.IdBase}");
        }

        var existingSlot = loaders.pkmLoader.GetAllDtos().Find(dto => dto.BoxId == targetBoxId && dto.BoxSlot == targetBoxSlot);
        if (attached && existingSlot != null)
        {
            throw new ArgumentException("Switch not possible with attached move");
        }
        var relatedPkmVersionDtos = existingSlot != null
            ? loaders.pkmVersionLoader.GetDtosByPkmId(existingSlot.Id).Values.ToList()
            : [];

        await SaveToMainWithoutCheckTarget(
                loaders, flags, (uint)sourceSaveId, (uint)targetBoxId, (uint)targetBoxSlot, savePkm
            );

        if (existingSlot != null)
        {
            await MainToSaveWithoutCheckTarget(
                loaders, flags, (uint)sourceSaveId, savePkm!.BoxId, savePkm.BoxSlot, relatedPkmVersionDtos
            );
        }

        saveLoaders.Pkms.FlushParty();

        CheckPkmTradeRecord(saveLoaders.Save);

        var boxName = loaders.boxLoader.GetDto(targetBoxId.ToString())?.Name;

        return new()
        {
            type = DataActionType.MOVE_PKM,
            parameters = [savePkm?.Nickname, saveLoaders.Save.Version, null, boxName, targetBoxSlot, attached]
        };
    }

    private async Task MainToSaveWithoutCheckTarget(
        DataEntityLoaders loaders, DataUpdateFlags flags,
        uint targetSaveId, int targetBoxId, int targetBoxSlot,
        List<PkmVersionDTO> relatedPkmVersionDtos
    )
    {
        var saveLoaders = loaders.saveLoadersDict[targetSaveId];

        if (!attached && relatedPkmVersionDtos.Count > 1)
        {
            throw new ArgumentException($"Not-attached move from main to save requires a single version");
        }

        var pkmVersionDto = relatedPkmVersionDtos.Find(version => version.Generation == saveLoaders.Save.Generation);

        if (pkmVersionDto == default)
        {
            throw new ArgumentException($"PkmVersionEntity not found for generation={saveLoaders.Save.Generation}");
        }

        var pkmDto = pkmVersionDto.PkmDto;

        if (pkmDto.SaveId != default)
        {
            throw new ArgumentException($"PkmEntity already in save, id={pkmDto.Id}, saveId={pkmDto.SaveId}");
        }

        if (pkmVersionDto.Generation != saveLoaders.Save.Generation)
        {
            throw new ArgumentException($"PkmVersionEntity Generation not compatible with save for id={pkmVersionDto.Id}, generation={pkmVersionDto.Generation}, save.generation={saveLoaders.Save.Generation}");
        }

        if (!SaveInfosDTO.IsSpeciesAllowed(pkmVersionDto.Species, saveLoaders.Save))
        {
            throw new ArgumentException($"PkmVersionEntity Species not compatible with save for id={pkmVersionDto.Id}, species={pkmVersionDto.Species}, save.maxSpecies={saveLoaders.Save.MaxSpeciesID}");
        }

        var pkm = pkmVersionDto.Pkm;

        await CheckG3NationalDex(saveLoaders.Save, pkm.Species);

        if (attached)
        {
            pkmDto.PkmEntity.SaveId = saveLoaders.Save.ID32;
            loaders.pkmLoader.WriteDto(pkmDto);
        }
        else
        {
            loaders.pkmVersionLoader.DeleteEntity(pkmVersionDto.Id);
            loaders.pkmLoader.DeleteEntity(pkmDto.Id);
        }

        var pkmSaveDTO = PkmSaveDTO.FromPkm(saveLoaders.Save, pkm, targetBoxId, targetBoxSlot);
        pkmSaveDTO.RefreshPkmVersionId(loaders.pkmLoader, loaders.pkmVersionLoader);
        saveLoaders.Pkms.WriteDto(pkmSaveDTO);

        if (attached && pkmSaveDTO.PkmVersionId == null)
        {
            throw new ArgumentException($"pkmSaveDTO.PkmVersionId is null, should be {pkmSaveDTO.Id}");
        }

        flags.MainPkms = true;
        flags.MainPkmVersions = true;
        flags.Saves.Add(new()
        {
            SaveId = targetSaveId,
            SavePkms = true,
        });
        flags.Dex = true;
    }

    private async Task SaveToMainWithoutCheckTarget(
        DataEntityLoaders loaders, DataUpdateFlags flags,
        uint sourceSaveId, uint targetBoxId, uint targetBoxSlot,
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
        var pkmVersionEntity = loaders.pkmVersionLoader.GetEntity(savePkm.Id);
        var mainPkmAlreadyExists = pkmVersionEntity != null;

        if (pkmVersionEntity == null)
        {
            // create pkm & pkm-version
            var pkmEntityToCreate = new PkmEntity
            {
                Id = savePkm.IdBase,
                BoxId = targetBoxId,
                BoxSlot = targetBoxSlot,
                SaveId = attached ? sourceSaveId : null
            };
            var pkmDtoToCreate = PkmDTO.FromEntity(pkmEntityToCreate);

            pkmVersionEntity = new PkmVersionEntity
            {
                Id = savePkm.IdBase,
                PkmId = pkmEntityToCreate.Id,
                Generation = savePkm.Generation,
                Filepath = PKMLoader.GetPKMFilepath(savePkm.Pkm),
            };
            var pkmVersionDto = PkmVersionDTO.FromEntity(pkmVersionEntity, savePkm.Pkm, pkmDtoToCreate);

            loaders.pkmLoader.WriteDto(pkmDtoToCreate);
            loaders.pkmVersionLoader.WriteDto(pkmVersionDto);

            flags.MainPkms = true;
            flags.MainPkmVersions = true;
        }

        var pkmDto = loaders.pkmLoader.GetDto(pkmVersionEntity.PkmId);

        if (mainPkmAlreadyExists && pkmDto!.SaveId != default)
        {
            await new SynchronizePkmAction(sourceSaveId, [pkmVersionEntity.Id]).ExecuteWithPayload(loaders, flags);

            if (!attached)
            {
                pkmDto.PkmEntity.SaveId = default;
            }

            loaders.pkmLoader.WriteDto(pkmDto);
        }

        flags.MainPkms = true;

        if (!attached)
        {
            // remove pkm from save
            saveLoaders.Pkms.DeleteDto(savePkm.Id);
        }

        flags.Saves.Add(new()
        {
            SaveId = sourceSaveId,
            SavePkms = true,
        });
        flags.Dex = true;
    }

    private static async Task CheckG3NationalDex(SaveFile save, int species)
    {
        // enable national-dex in G3 RSE if pkm outside of regional-dex
        if (save is SAV3 saveG3RSE && saveG3RSE is IGen3Hoenn && !saveG3RSE.NationalDex)
        {
            var hoennDex = await PokeApi.GetPokedex(PokeApiPokedexEnum.HOENN);
            // Console.WriteLine(hoennDex.name);
            var isInDex = hoennDex!.PokemonEntries.Any(entry =>
            {
                var url = entry.PokemonSpecies.Url;
                var id = int.Parse(url.TrimEnd('/').Split('/')[^1]);

                return id == species;
            });

            if (!isInDex)
            {
                saveG3RSE.NationalDex = true;
            }
        }
    }

    private static void CheckPkmTradeRecord(SaveFile save)
    {
        if (save is SAV3FRLG saveG3FRLG)
        {
            var records = new Record3(saveG3FRLG);

            var pkmTradeIndex = 21;

            var pkmTradeCount = records.GetRecord(pkmTradeIndex);
            records.SetRecord(pkmTradeIndex, pkmTradeCount + 1);
        }
        else if (save is SAV4HGSS saveG4HGSS)
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
