using PKHeX.Core;

public class SaveMovePkmFromStorageAction : IWithSaveId
{
    public uint saveId { get; }
    readonly long pkmVersionId;
    readonly int saveBoxId;
    readonly int saveSlot;

    public SaveMovePkmFromStorageAction(
        uint _saveId,
        long _pkmVersionId, int _saveBoxId, int _saveSlot
    )
    {
        saveId = _saveId;
        pkmVersionId = _pkmVersionId;
        saveBoxId = _saveBoxId;
        saveSlot = _saveSlot;
    }

    public void Execute(
        SaveFile save,
        EntityLoader<PkmEntity> pkmLoader,
        EntityLoader<PkmVersionEntity> pkmVersionLoader,
        PKMMemoryLoader pkmFileLoader,
        EntityLoader<PkmSaveDTO> savePkmLoader
        )
    {
        var pkmVersionEntity = pkmVersionLoader.GetEntity(pkmVersionId);

        if (pkmVersionEntity == default)
        {
            throw new Exception($"PkmVersionEntity not found for id={pkmVersionId}");
        }

        // get save-pkm
        var savePkm = savePkmLoader.GetEntity(pkmVersionEntity.Id);
        if (savePkm != default)
        {
            throw new Exception($"SavePkm already exists, id={savePkm.Id}");
        }

        var existingSlot = savePkmLoader.GetAllEntities().Find(entity => entity.Box == saveBoxId && entity.BoxSlot == saveSlot);
        if (existingSlot != default)
        {
            throw new Exception($"SavePkm already exists in given box slot, box={saveBoxId}, slot={saveSlot}");
        }

        var pkmEntity = pkmLoader.GetEntity(pkmVersionEntity.PkmId)!;
        if (pkmEntity.SaveId != default)
        {
            throw new Exception($"PkmEntity already in save, id={pkmEntity.Id}, saveId={pkmEntity.SaveId}");
        }

        var pkm = pkmFileLoader.GetEntity(pkmVersionEntity)!;

        var pkmSaveDTO = PkmSaveDTO.FromPkm(save, pkm, saveBoxId, saveSlot);

        savePkmLoader.WriteEntity(pkmSaveDTO);

        pkmEntity.SaveId = save.ID32;
        pkmLoader.WriteEntity(pkmEntity);
    }
}
