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

    public override void Execute(DataEntityLoaders loaders)
    {
        var saveLoaders = loaders.getSaveLoaders(saveId);

        var savePkm = saveLoaders.Pkms.GetEntity(savePkmId);

        if (savePkm == default)
        {
            throw new Exception($"PkmSaveDTO not found for id={savePkmId}");
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
                Species = savePkm.Species,
                IsShiny = savePkm.IsShiny,
                OTName = savePkm.OriginTrainerName,
                Nickname = savePkm.Nickname,
            };

            pkmVersionEntity = new PkmVersionEntity
            {
                Id = savePkm.Id,
                PkmId = pkmEntityToCreate.Id,
                Generation = savePkm.Generation,
                Filepath = PKMLoader.GetPKMFilepath(savePkm.Pkm, savePkm.Generation),
            };

            loaders.pkmFileLoader.WriteEntity(PKMLoader.GetPKMBytes(savePkm.Pkm), savePkm.Pkm, savePkm.Generation, null);
            loaders.pkmLoader.WriteEntity(pkmEntityToCreate);
            loaders.pkmVersionLoader.WriteEntity(pkmVersionEntity);
        }

        var pkmEntity = loaders.pkmLoader.GetEntity(pkmVersionEntity.PkmId)!;

        pkmEntity.SaveId = default;

        loaders.pkmLoader.WriteEntity(pkmEntity);

        // remove pkm from save
        saveLoaders.Pkms.DeleteEntity(savePkm.Id);
    }
}
