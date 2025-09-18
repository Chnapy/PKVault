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
            throw new Exception("Pkm not found");
        }

        var pkmAlreadyPresent = (await loaders.pkmLoader.GetAllDtos()).Find(pkm =>
            pkm.Id != pkmId
            && pkm.BoxId == targetBoxId
            && pkm.BoxSlot == targetBoxSlot
        );
        if (pkmAlreadyPresent != null)
        {
            throw new Exception($"Pkm already present in slot, boxId={targetBoxId}, boxSlot={targetBoxSlot}");
        }

        dto.PkmEntity.BoxId = (uint)targetBoxId;
        dto.PkmEntity.BoxSlot = (uint)targetBoxSlot;

        loaders.pkmLoader.WriteDto(dto);

        flags.MainPkms = true;
    }

    private async Task MainToSave(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        var saveId = (uint)targetSaveId;

        var saveLoaders = loaders.saveLoadersDict[saveId];

        var relatedPkmVersionDtos = (await loaders.pkmVersionLoader.GetAllDtos())
            .FindAll(version => version.PkmId == pkmId);
        if (!attached && relatedPkmVersionDtos.Count > 1)
        {
            throw new Exception($"Not-attached move from main to save requires a single version");
        }

        var pkmVersionDto = relatedPkmVersionDtos.Find(version => version.Generation == saveLoaders.Save.Generation);

        if (pkmVersionDto == default)
        {
            throw new Exception($"PkmVersionEntity not found for Pkm.id={pkmId}");
        }

        var pkmDto = pkmVersionDto.PkmDto;

        if (pkmDto.SaveId != default)
        {
            throw new Exception($"PkmEntity already in save, id={pkmDto.Id}, saveId={pkmDto.SaveId}");
        }

        if (pkmVersionDto.Generation != saveLoaders.Save.Generation)
        {
            throw new Exception($"PkmVersionEntity Generation not compatible with save for id={pkmVersionDto.Id}, generation={pkmVersionDto.Generation}, save.generation={saveLoaders.Save.Generation}");
        }

        if (!SaveInfosDTO.IsSpeciesAllowed(pkmVersionDto.Pkm.Species, saveLoaders.Save))
        {
            throw new Exception($"PkmVersionEntity Species not compatible with save for id={pkmVersionDto.Id}, species={pkmVersionDto.Species}, save.maxSpecies={saveLoaders.Save.MaxSpeciesID}");
        }

        // get save-pkm
        var savePkm = await saveLoaders.Pkms.GetDto(pkmVersionDto.Id);
        if (savePkm != default)
        {
            throw new Exception($"SavePkm already exists, id={savePkm.Id} {savePkm.Nickname}");
        }

        var existingSlot = await saveLoaders.Pkms.GetDto(targetBoxId, targetBoxSlot);
        if (existingSlot != default)
        {
            throw new Exception($"SavePkm already exists in given box slot, box={targetBoxId}, slot={targetBoxSlot}");
        }

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
            throw new Exception($"pkmSaveDTO.PkmVersionId is null, should be {pkmSaveDTO.Id}");
        }

        flags.MainPkms = true;
        flags.Saves.Add(new()
        {
            SaveId = saveId,
            SavePkms = true
        });
    }

    private async Task SaveToMain(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        var saveId = (uint)sourceSaveId;

        var saveLoaders = loaders.saveLoadersDict[saveId];

        var savePkm = await saveLoaders.Pkms.GetDto(pkmId);

        if (savePkm == default)
        {
            throw new Exception($"PkmSaveDTO not found for id={pkmId}, count={(await saveLoaders.Pkms.GetAllDtos()).Count}");
        }

        if (savePkm.Pkm is IShadowCapture savePkmShadow && savePkmShadow.IsShadow)
        {
            throw new Exception($"Action forbidden for PkmSave shadow for id={pkmId}");
        }

        if (savePkm.Pkm.IsEgg)
        {
            throw new Exception($"Action forbidden for PkmSave egg for id={pkmId}");
        }

        // get pkm-version
        var pkmVersionEntity = loaders.pkmVersionLoader.GetEntity(savePkm.Id);
        if (pkmVersionEntity == null)
        {
            // create pkm & pkm-version
            var pkmEntityToCreate = new PkmEntity
            {
                Id = savePkm.Id,
                BoxId = (uint)targetBoxId,
                BoxSlot = (uint)targetBoxSlot,
                SaveId = attached ? saveId : null // saveLoaders.Save.ID32,
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
            await new SynchronizePkmAction(saveId, pkmVersionEntity.Id).Execute(loaders, flags);

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
            SaveId = saveId,
            SavePkms = true,
        });
    }

    private async Task SaveToSave(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        var sourceSaveLoaders = loaders.saveLoadersDict[(uint)sourceSaveId];
        var targetSaveLoaders = loaders.saveLoadersDict[(uint)targetSaveId];
        var notSameSave = sourceSaveId != targetSaveId;

        var sourcePkmDto = await sourceSaveLoaders.Pkms.GetDto(pkmId);
        if (sourcePkmDto == default)
        {
            throw new Exception("Save Pkm not found");
        }

        var entityAlreadyPresent = await targetSaveLoaders.Pkms.GetDto(targetBoxId, targetBoxSlot);
        if (entityAlreadyPresent != null)
        {
            throw new Exception($"Save Pkm already present in slot, boxId={targetBoxId}, boxSlot={targetBoxSlot}");
        }

        // await saveLoaders.Pkms.DeleteDto(dto.Id);

        sourcePkmDto.Box = targetBoxId;
        sourcePkmDto.BoxSlot = targetBoxSlot;

        if (notSameSave)
        {
            await sourceSaveLoaders.Pkms.DeleteDto(sourcePkmDto.Id);

            flags.Saves.Add(new()
            {
                SaveId = sourceSaveLoaders.Save.ID32,
                SavePkms = true
            });
        }

        await targetSaveLoaders.Pkms.WriteDto(sourcePkmDto);

        flags.Saves.Add(new()
        {
            SaveId = targetSaveLoaders.Save.ID32,
            SavePkms = true
        });
    }
}
