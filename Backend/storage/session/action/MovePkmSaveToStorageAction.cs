using PKHeX.Core;

public class MovePkmSaveToStorageAction
{
    long savePkmId;
    uint storageBoxId;
    uint storageSlot;

    public MovePkmSaveToStorageAction(
        long _savePkmId, uint _storageBoxId, uint _storageSlot
    )
    {
        savePkmId = _savePkmId;
        storageBoxId = _storageBoxId;
        storageSlot = _storageSlot;
    }

    public void Execute(EntityLoader<PkmEntity> pkmLoader, EntityLoader<PkmVersionEntity> pkmVersionLoader, EntityLoader<PkmSaveDTO> savePkmLoader)
    {


        var savePkm = savePkmLoader.GetEntity(savePkmId);

        if (savePkm == default)
        {
            throw new Exception($"PkmSaveDTO not found for id={savePkmId}");
        }

        // get pkm-version
        var pkmVersionEntity = pkmVersionLoader.GetEntity(savePkm.Id);
        if (pkmVersionEntity == null)
        {
            // create pkm & pkm-version
            var pkmEntityToCreate = new PkmEntity
            {
                Id = savePkm.Id,
                BoxId = storageBoxId,
                BoxIndex = storageSlot,
            };

            pkmVersionEntity = new PkmVersionEntity
            {
                Id = savePkm.Id,
                PkmId = pkmEntityToCreate.Id,
                Generation = savePkm.Generation,
                Filepath = $"pkm/{savePkm.Pkm.Generation}/{savePkm.Pkm.FileName}",
            };

            pkmLoader.WriteEntity(pkmEntityToCreate);
            pkmVersionLoader.WriteEntity(pkmVersionEntity);
        }

        var pkmEntity = pkmLoader.GetEntity(pkmVersionEntity.PkmId)!;

        pkmEntity.BoxId = storageBoxId;
        pkmEntity.BoxIndex = storageSlot;
        pkmEntity.SaveId = default;

        pkmLoader.WriteEntity(pkmEntity);

        // remove pkm from save
        savePkmLoader.DeleteEntity(savePkm.Id);
    }
}
