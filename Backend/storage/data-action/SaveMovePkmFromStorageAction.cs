using PKHeX.Core;

public class SaveMovePkmFromStorageAction : DataAction
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

    public override void Execute(DataEntityLoaders loaders)
    {
        var saveLoaders = loaders.getSaveLoaders(saveId);

        var pkmVersionEntity = loaders.pkmVersionLoader.GetEntity(pkmVersionId);

        if (pkmVersionEntity == default)
        {
            throw new Exception($"PkmVersionEntity not found for id={pkmVersionId}");
        }

        if (pkmVersionEntity.Generation != saveLoaders.Save.Generation)
        {
            throw new Exception($"PkmVersionEntity Generation not compatible with save for id={pkmVersionId}, generation={pkmVersionEntity.Generation}, save.generation={saveLoaders.Save.Generation}");
        }

        // get save-pkm
        var savePkm = saveLoaders.Pkms.GetEntity(pkmVersionEntity.Id);
        if (savePkm != default)
        {
            throw new Exception($"SavePkm already exists, id={savePkm.Id}");
        }

        var existingSlot = saveLoaders.Pkms.GetAllEntities().Find(entity => entity.Box == saveBoxId && entity.BoxSlot == saveSlot);
        if (existingSlot != default)
        {
            throw new Exception($"SavePkm already exists in given box slot, box={saveBoxId}, slot={saveSlot}");
        }

        var pkmEntity = loaders.pkmLoader.GetEntity(pkmVersionEntity.PkmId)!;
        if (pkmEntity.SaveId != default)
        {
            throw new Exception($"PkmEntity already in save, id={pkmEntity.Id}, saveId={pkmEntity.SaveId}");
        }

        var pkm = loaders.pkmFileLoader.GetEntity(pkmVersionEntity);
        if (pkm == default)
        {
            throw new Exception($"PKM not defined, pkm-version={pkmVersionEntity.Id}");
        }

        var pkmSaveDTO = PkmSaveDTO.FromPkm(saveLoaders.Save, pkm, saveBoxId, saveSlot);

        saveLoaders.Pkms.WriteEntity(pkmSaveDTO);

        pkmEntity.SaveId = saveLoaders.Save.ID32;
        loaders.pkmLoader.WriteEntity(pkmEntity);
    }
}
