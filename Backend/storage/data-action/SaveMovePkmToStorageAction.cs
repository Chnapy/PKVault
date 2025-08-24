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

    public override async Task Execute(DataEntityLoaders loaders)
    {
        var saveLoaders = loaders.saveLoadersDict[saveId];

        var savePkm = saveLoaders.Pkms.GetDto(savePkmId);

        if (savePkm == default)
        {
            throw new Exception($"PkmSaveDTO not found for id={savePkmId}, count={saveLoaders.Pkms.GetAllDtos().Count}");
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
        var pkmVersionDto = loaders.pkmVersionLoader.GetDto(savePkm.Id);
        if (pkmVersionDto == null)
        {
            // create pkm & pkm-version
            var pkmDtoToCreate = PkmDTO.FromEntity(new PkmEntity
            {
                Id = savePkm.Id,
                BoxId = storageBoxId,
                BoxSlot = storageSlot,
                SaveId = saveLoaders.Save.ID32,
            });

            pkmVersionDto = await PkmVersionDTO.FromEntity(
                new PkmVersionEntity
                {
                    Id = savePkm.Id,
                    PkmId = pkmDtoToCreate.Id,
                    Generation = savePkm.Generation,
                    Filepath = PKMLoader.GetPKMFilepath(savePkm.Pkm),
                },
                savePkm.Pkm,
                pkmDtoToCreate
            );

            await loaders.pkmLoader.WriteDto(pkmDtoToCreate);
            await loaders.pkmVersionLoader.WriteDto(pkmVersionDto);
        }

        var pkmEntity = loaders.pkmLoader.GetDto(pkmVersionDto.PkmDto.Id)!;

        if (pkmEntity.SaveId != default)
        {
            await new SynchronizePkmAction(saveId, pkmVersionDto.Id).Execute(loaders);

            pkmEntity.PkmEntity.SaveId = default;
        }

        await loaders.pkmLoader.WriteDto(pkmEntity);

        // remove pkm from save
        await saveLoaders.Pkms.DeleteDto(savePkm.Id);
    }
}
