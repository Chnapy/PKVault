using PKHeX.Core;

public class SavePkmLoader : EntityLoader<PkmSaveDTO>
{
    private SaveFile save;

    public SavePkmLoader(SaveFile _save)
    {
        save = _save;
    }

    public override List<PkmSaveDTO> GetAllEntities()
    {
        var pkmList = new List<PkmSaveDTO>();

        for (var i = 0; i < save.BoxCount; i++)
        {
            var pkms = save.GetBoxData(i).ToList();
            var j = 0;
            pkms.ForEach(pkm =>
            {
                if (pkm.Species != 0)
                {
                    var dto = PkmSaveDTO.FromPkm(save, pkm, i, j);
                    pkmList.Add(dto);
                }
                j++;
            });
        }

        return pkmList;
    }

    public override PkmSaveDTO WriteEntity(PkmSaveDTO entity)
    {
        var oldEntity = GetEntity(entity.Id);
        if (oldEntity != null)
        {
            save.SetBoxSlotAtIndex(save.BlankPKM, oldEntity.Box, oldEntity.BoxSlot);
        }

        save.SetBoxSlotAtIndex(entity.Pkm, entity.Box, entity.BoxSlot);
        return entity;
    }

    public override PkmSaveDTO? DeleteEntity(long id)
    {
        var entity = GetEntity(id);
        save.SetBoxSlotAtIndex(save.BlankPKM, entity.Box, entity.BoxSlot);
        return entity;
    }

    public override void SetAllEntities(List<PkmSaveDTO> entities)
    {
        throw new Exception($"Not implemented");
    }
}
