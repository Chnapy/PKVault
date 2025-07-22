using PKHeX.Core;

public class SaveMovePkmToStorageAction : IWithSaveId
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

    public void Execute(EntityLoader<PkmEntity> pkmLoader, EntityLoader<PkmVersionEntity> pkmVersionLoader, PKMLoader pkmFileLoader, EntityLoader<PkmSaveDTO> savePkmLoader)
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
                Filepath = pkmFileLoader.GetPKMFilepath(savePkm.Pkm),
            };

            pkmLoader.WriteEntity(pkmEntityToCreate);
            pkmVersionLoader.WriteEntity(pkmVersionEntity);
            pkmFileLoader.WriteEntity(savePkm.Pkm, null);
        }

        var pkmEntity = pkmLoader.GetEntity(pkmVersionEntity.PkmId)!;

        // pkmEntity.BoxId = storageBoxId;
        // pkmEntity.BoxSlot = storageSlot;
        pkmEntity.SaveId = default;

        pkmLoader.WriteEntity(pkmEntity);

        // remove pkm from save
        savePkmLoader.DeleteEntity(savePkm.Id);
    }
}
