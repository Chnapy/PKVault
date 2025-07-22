using PKHeX.Core;

public class SaveMovePkmToStorageAction : DataAction
{
    public uint saveId { get; }
    readonly long savePkmId;
    readonly uint storageBoxId;
    readonly uint storageSlot;

    public SaveMovePkmToStorageAction(
        uint _saveId,
        long _savePkmId, uint _storageBoxId, uint _storageSlot
    )
    {
        saveId = _saveId;
        savePkmId = _savePkmId;
        storageBoxId = _storageBoxId;
        storageSlot = _storageSlot;
    }

    public override void Execute(DataEntityLoaders loaders)
    {
        var saveLoaders = loaders.getSaveLoaders(saveId);

        var savePkm = saveLoaders.Pkms.GetEntity(savePkmId);

        if (savePkm == default)
        {
            throw new Exception($"PkmSaveDTO not found for id={savePkmId}");
        }

        // get pkm-version
        var pkmVersionEntity = loaders.pkmVersionLoader.GetEntity(savePkm.Id);
        if (pkmVersionEntity == null)
        {
            // create pkm & pkm-version
            var pkmEntityToCreate = new PkmEntity
            {
                Id = savePkm.Id,
                Species = savePkm.Species,
                IsShiny = savePkm.IsShiny,
                BoxId = storageBoxId,
                BoxSlot = storageSlot,
            };

            pkmVersionEntity = new PkmVersionEntity
            {
                Id = savePkm.Id,
                PkmId = pkmEntityToCreate.Id,
                Generation = savePkm.Generation,
                Filepath = loaders.pkmFileLoader.GetPKMFilepath(savePkm.Pkm),
            };

            loaders.pkmLoader.WriteEntity(pkmEntityToCreate);
            loaders.pkmVersionLoader.WriteEntity(pkmVersionEntity);
            loaders.pkmFileLoader.WriteEntity(savePkm.Pkm, null);
        }

        var pkmEntity = loaders.pkmLoader.GetEntity(pkmVersionEntity.PkmId)!;

        // pkmEntity.BoxId = storageBoxId;
        // pkmEntity.BoxSlot = storageSlot;
        pkmEntity.SaveId = default;

        loaders.pkmLoader.WriteEntity(pkmEntity);

        // remove pkm from save
        saveLoaders.Pkms.DeleteEntity(savePkm.Id);
    }
}
