using PKHeX.Core;

public class SaveMovePkmToStorageAction : DataAction
{
    public uint saveId { get; }
    readonly string savePkmId;
    readonly uint storageBoxId;
    readonly uint storageSlot;

    public SaveMovePkmToStorageAction(
        uint _saveId,
        string _savePkmId, uint _storageBoxId, uint _storageSlot
    )
    {
        saveId = _saveId;
        savePkmId = _savePkmId;
        storageBoxId = _storageBoxId;
        storageSlot = _storageSlot;
    }

    public override DataActionPayload GetPayload()
    {
        return new DataActionPayload
        {
            type = DataActionType.SAVE_MOVE_PKM_TO_STORAGE,
            parameters = [saveId, savePkmId, storageBoxId, storageSlot]
        };
    }

    public override async Task Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        var saveLoaders = loaders.saveLoadersDict[saveId];

        var savePkm = await saveLoaders.Pkms.GetDto(savePkmId);

        if (savePkm == default)
        {
            throw new Exception($"PkmSaveDTO not found for id={savePkmId}, count={(await saveLoaders.Pkms.GetAllDtos()).Count}");
        }

        if (savePkm.Pkm is IShadowCapture savePkmShadow && savePkmShadow.IsShadow)
        {
            throw new Exception($"Action forbidden for PkmSave shadow for id={savePkmId}");
        }

        if (savePkm.Pkm.IsEgg)
        {
            throw new Exception($"Action forbidden for PkmSave egg for id={savePkmId}");
        }

        // get pkm-version
        var pkmVersionEntity = loaders.pkmVersionLoader.GetEntity(savePkm.Id);
        if (pkmVersionEntity == null)
        {
            // create pkm & pkm-version
            var pkmEntityToCreate = new PkmEntity
            {
                Id = savePkm.Id,
                BoxId = storageBoxId,
                BoxSlot = storageSlot,
                SaveId = null // saveLoaders.Save.ID32,
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

            pkmDto.PkmEntity.SaveId = default;
        }

        loaders.pkmLoader.WriteDto(pkmDto);

        flags.MainPkms = true;

        // remove pkm from save
        await saveLoaders.Pkms.DeleteDto(savePkm.Id);

        flags.Saves.Add(new()
        {
            SaveId = saveId,
            SavePkms = true,
        });
    }
}
