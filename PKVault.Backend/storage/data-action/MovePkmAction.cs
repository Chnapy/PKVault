using PKHeX.Core;

public class MovePkmAction(
    string pkmId, uint? sourceSaveId,
    uint? targetSaveId, int targetBoxId, int targetBoxSlot,
    bool attached
) : DataAction
{
    public override DataActionPayload GetPayload()
    {
        return new DataActionPayload
        {
            type = DataActionType.MOVE_PKM,
            parameters = [pkmId, sourceSaveId, targetSaveId, targetBoxId, targetBoxSlot, attached]
        };
    }

    public override async Task Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        if (sourceSaveId == null && targetSaveId == null)
        {
            await MainToMain(loaders, flags);
        }
        else if (sourceSaveId == null && targetSaveId != null)
        {
            await MainToSave(loaders, flags);
        }
        else if (sourceSaveId != null && targetSaveId == null)
        {
            await SaveToMain(loaders, flags);
        }
        else
        {
            await SaveToSave(loaders, flags);
        }
    }

    private async Task MainToMain(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        var dto = await loaders.pkmLoader.GetDto(pkmId);
        if (dto == default)
        {
            throw new KeyNotFoundException("Pkm not found");
        }

        var pkmAlreadyPresent = (await loaders.pkmLoader.GetAllDtos()).Find(pkm =>
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
    }

    private async Task SaveToSave(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        var sourceSaveLoaders = loaders.saveLoadersDict[(uint)sourceSaveId];
        var targetSaveLoaders = loaders.saveLoadersDict[(uint)targetSaveId];
        var notSameSave = sourceSaveId != targetSaveId;

        var sourcePkmDto = await sourceSaveLoaders.Pkms.GetDto(pkmId);
        if (sourcePkmDto == default)
        {
            throw new KeyNotFoundException("Save Pkm not found");
        }

        if (!sourcePkmDto.CanMove)
        {
            throw new ArgumentException("Save Pkm cannot move");
        }

        if (sourcePkmDto.Generation != targetSaveLoaders.Save.Generation)
        {
            throw new ArgumentException($"Save Pkm not compatible with save for id={sourcePkmDto.Id}, generation={sourcePkmDto.Generation}, save.generation={targetSaveLoaders.Save.Generation}");
        }

        if (!SaveInfosDTO.IsSpeciesAllowed(sourcePkmDto.Pkm.Species, targetSaveLoaders.Save))
        {
            throw new ArgumentException($"Save Pkm Species not compatible with save for id={sourcePkmDto.Id}, species={sourcePkmDto.Species}, save.maxSpecies={targetSaveLoaders.Save.MaxSpeciesID}");
        }

        var targetPkmDto = await targetSaveLoaders.Pkms.GetDto(targetBoxId, targetBoxSlot);
        if (targetPkmDto != null && !targetPkmDto.CanMove)
        {
            throw new ArgumentException("Save Pkm cannot move");
        }

        // target should be moved before source delete
        // because of Party specific behavior
        if (targetPkmDto != null)
        {
            var switchedSourcePkmDto = await PkmSaveDTO.FromPkm(sourceSaveLoaders.Save, targetPkmDto.Pkm, sourcePkmDto.Box, sourcePkmDto.BoxSlot);
            await sourceSaveLoaders.Pkms.WriteDto(switchedSourcePkmDto);
        }

        await sourceSaveLoaders.Pkms.DeleteDto(sourcePkmDto.Id);

        flags.Saves.Add(new()
        {
            SaveId = sourceSaveLoaders.Save.ID32,
            SavePkms = true
        });

        sourcePkmDto.Box = targetBoxId;
        sourcePkmDto.BoxSlot = targetBoxSlot;

        await targetSaveLoaders.Pkms.WriteDto(sourcePkmDto);

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
    }

    private async Task MainToSave(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        var saveLoaders = loaders.saveLoadersDict[(uint)targetSaveId];

        var relatedPkmVersionDtos = (await loaders.pkmVersionLoader.GetAllDtos())
            .FindAll(version => version.PkmId == pkmId);
        var pkmDto = await loaders.pkmLoader.GetDto(pkmId);

        var existingSlot = await saveLoaders.Pkms.GetDto(targetBoxId, targetBoxSlot);
        if (attached && existingSlot != null)
        {
            throw new ArgumentException("Switch not possible with attached move");
        }

        await MainToSaveWithoutCheckTarget(loaders, flags, (uint)targetSaveId, targetBoxId, targetBoxSlot, relatedPkmVersionDtos);

        if (existingSlot != null)
        {
            await SaveToMainWithoutCheckTarget(loaders, flags, (uint)targetSaveId, pkmDto.BoxId, pkmDto.BoxSlot, existingSlot);
        }
    }

    private async Task SaveToMain(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        var saveLoaders = loaders.saveLoadersDict[(uint)sourceSaveId];
        var savePkm = await saveLoaders.Pkms.GetDto(pkmId);

        var pkmDto = await loaders.pkmLoader.GetDto(pkmId);

        var existingSlot = (await loaders.pkmLoader.GetAllDtos()).Find(dto => dto.BoxId == targetBoxId && dto.BoxSlot == targetBoxSlot);
        if (attached && existingSlot != null)
        {
            throw new ArgumentException("Switch not possible with attached move");
        }
        var relatedPkmVersionDtos = existingSlot != null
            ? (await loaders.pkmVersionLoader.GetAllDtos()).FindAll(version => version.PkmId == existingSlot.Id)
            : [];

        await SaveToMainWithoutCheckTarget(
                loaders, flags, (uint)sourceSaveId, (uint)targetBoxId, (uint)targetBoxSlot, savePkm
            );

        if (existingSlot != null)
        {
            await MainToSaveWithoutCheckTarget(
                loaders, flags, (uint)sourceSaveId, savePkm.Box, savePkm.BoxSlot, relatedPkmVersionDtos
            );
        }
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

        if (!SaveInfosDTO.IsSpeciesAllowed(pkmVersionDto.Pkm.Species, saveLoaders.Save))
        {
            throw new ArgumentException($"PkmVersionEntity Species not compatible with save for id={pkmVersionDto.Id}, species={pkmVersionDto.Species}, save.maxSpecies={saveLoaders.Save.MaxSpeciesID}");
        }

        // get save-pkm
        var savePkm = await saveLoaders.Pkms.GetDto(pkmVersionDto.Id);
        if (savePkm != default)
        {
            // throw new Exception($"SavePkm already exists, id={savePkm.Id} {savePkm.Nickname}");
        }

        // var existingSlot = await saveLoaders.Pkms.GetDto(targetBoxId, targetBoxSlot);
        // if (existingSlot != default)
        // {
        //     // throw new Exception($"SavePkm already exists in given box slot, box={targetBoxId}, slot={targetBoxSlot}");
        // }

        var pkm = pkmVersionDto.Pkm;

        // enable national-dex in G3 if pkm outside of regional-dex
        if (saveLoaders.Save is SAV3 saveG3 && !saveG3.NationalDex)
        {
            var hoennDex = await PokeApi.GetPokedex(PokeApiPokedexEnum.HOENN);
            // Console.WriteLine(hoennDex.name);
            var isInDex = hoennDex.PokemonEntries.Any(entry =>
            {
                var url = entry.PokemonSpecies.Url;
                var id = int.Parse(url.TrimEnd('/').Split('/')[^1]);

                return id == pkm.Species;
            });

            if (!isInDex)
            {
                saveG3.NationalDex = true;
            }
        }

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

        var pkmSaveDTO = await PkmSaveDTO.FromPkm(saveLoaders.Save, pkm, targetBoxId, targetBoxSlot);
        await pkmSaveDTO.RefreshPkmVersionId(loaders.pkmLoader, loaders.pkmVersionLoader);
        await saveLoaders.Pkms.WriteDto(pkmSaveDTO);

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

        if (pkmVersionEntity == null)
        {
            // create pkm & pkm-version
            var pkmEntityToCreate = new PkmEntity
            {
                Id = savePkm.Id,
                BoxId = targetBoxId,
                BoxSlot = targetBoxSlot,
                SaveId = attached ? sourceSaveId : null
            };
            var pkmDtoToCreate = PkmDTO.FromEntity(pkmEntityToCreate);

            pkmVersionEntity = new PkmVersionEntity
            {
                Id = savePkm.Id,
                PkmId = pkmEntityToCreate.Id,
                Generation = savePkm.Generation,
                Filepath = PKMLoader.GetPKMFilepath(savePkm.Pkm),
            };
            var pkmVersionDto = await PkmVersionDTO.FromEntity(pkmVersionEntity, savePkm.Pkm, pkmDtoToCreate);

            loaders.pkmLoader.WriteDto(pkmDtoToCreate);
            loaders.pkmVersionLoader.WriteDto(pkmVersionDto);

            flags.MainPkms = true;
            flags.MainPkmVersions = true;
        }

        var pkmDto = await loaders.pkmLoader.GetDto(pkmVersionEntity.PkmId);

        if (pkmDto.SaveId != default)
        {
            await new SynchronizePkmAction(sourceSaveId, pkmVersionEntity.Id).Execute(loaders, flags);

            if (!attached)
            {
                pkmDto.PkmEntity.SaveId = default;
            }
        }

        loaders.pkmLoader.WriteDto(pkmDto);

        flags.MainPkms = true;

        if (!attached)
        {
            // remove pkm from save
            await saveLoaders.Pkms.DeleteDto(savePkm.Id);
        }

        flags.Saves.Add(new()
        {
            SaveId = sourceSaveId,
            SavePkms = true,
        });
        flags.Dex = true;
    }
}
