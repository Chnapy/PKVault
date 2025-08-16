using PKHeX.Core;

public class SavePkmLoader : EntityLoader<PkmSaveDTO>
{
    private SaveFile save;
    private EntityLoader<PkmEntity> pkmEntityloader;
    private EntityLoader<PkmVersionEntity> pkmVersionEntityloader;

    public SavePkmLoader(SaveFile _save, EntityLoader<PkmEntity> _pkmEntityloader, EntityLoader<PkmVersionEntity> _pkmVersionEntityloader)
    {
        save = _save;
        pkmEntityloader = _pkmEntityloader;
        pkmVersionEntityloader = _pkmVersionEntityloader;
    }

    public override List<PkmSaveDTO> GetAllEntities()
    {
        var pkmList = new List<PkmSaveDTO>();

        if (save.HasParty)
        {
            var i = 0;
            save.PartyData.ToList().ForEach(pkm =>
            {
                if (pkm.Species != 0)
                {
                    var dto = PkmSaveDTO.FromPkm(save, pkm, BoxDTO.PARTY_ID, i, pkmEntityloader, pkmVersionEntityloader);
                    pkmList.Add(dto);
                }
                i++;
            });
        }

        if (save is IDaycareStorage saveDaycare)
        {
            for (var i = 0; i < saveDaycare.DaycareSlotCount; i++)
            {
                if (!saveDaycare.IsDaycareOccupied(i))
                {
                    continue;
                }

                var slot = new SlotInfoMisc(saveDaycare.GetDaycareSlot(i), i) { Type = StorageSlotType.Daycare };
                var pkm = slot.Read(save);
                if (pkm != default && pkm.Species != 0)
                {
                    var dto = PkmSaveDTO.FromPkm(save, pkm, BoxDTO.DAYCARE_ID, i, pkmEntityloader, pkmVersionEntityloader);
                    pkmList.Add(dto);
                }
            }
        }

        for (var i = 0; i < save.BoxCount; i++)
        {
            var pkms = save.GetBoxData(i).ToList();
            var j = 0;
            pkms.ForEach(pkm =>
            {
                if (pkm.Species != 0)
                {
                    var dto = PkmSaveDTO.FromPkm(save, pkm, i, j, pkmEntityloader, pkmVersionEntityloader);
                    pkmList.Add(dto);
                }
                j++;
            });
        }

        return pkmList;
    }

    public override PkmSaveDTO WriteEntity(PkmSaveDTO entity)
    {
        if (entity.Box == BoxDTO.DAYCARE_ID)
        {
            throw new Exception("Not allowed for pkm in daycare");
        }

        var savePkmType = save.BlankPKM.GetType();

        var pkm = EntityConverter.ConvertToType(entity.Pkm, savePkmType, out var result);
        if (pkm == default)
        {
            throw new Exception($"PkmSaveDTO.Pkm convert failed, id={entity.Id} from.type={entity.Pkm.GetType()} to.type={savePkmType} result={result}");
        }

        var party = save.PartyData.ToList().FindAll(pkm => pkm.Species != 0);

        var oldEntity = GetEntity(entity.Id);

        if (oldEntity != null)
        {
            if (oldEntity.Box == BoxDTO.DAYCARE_ID)
            {
                throw new Exception("Not allowed for pkm in daycare");
            }

            switch (oldEntity.Box)
            {
                case BoxDTO.PARTY_ID:
                    party = party.FindAll(pkm => PkmSaveDTO.GetPKMId(pkm, save.Generation) != entity.Id);
                    break;
                default:
                    save.SetBoxSlotAtIndex(save.BlankPKM, oldEntity.Box, oldEntity.BoxSlot);
                    break;
            }
        }

        switch (entity.Box)
        {
            case BoxDTO.PARTY_ID:
                party.Add(pkm);
                break;
            default:
                save.SetBoxSlotAtIndex(pkm, entity.Box, entity.BoxSlot);
                break;
        }

        if ((oldEntity != default && oldEntity.Box == BoxDTO.PARTY_ID) || entity.Box == BoxDTO.PARTY_ID)
        {
            SetParty(party);
        }

        return entity;
    }

    public override PkmSaveDTO? DeleteEntity(string id)
    {
        var entity = GetEntity(id);
        if (entity != default)
        {
            switch (entity.Box)
            {
                case BoxDTO.DAYCARE_ID:
                    throw new Exception("Not allowed for pkm in daycare");
                case BoxDTO.PARTY_ID:
                    var party = save.PartyData.ToList()
                        .FindAll(pkm => pkm.Species != 0)
                        .FindAll(pkm => PkmSaveDTO.GetPKMId(pkm, save.Generation) != entity.Id);

                    SetParty(party);
                    break;
                default:
                    save.SetBoxSlotAtIndex(save.BlankPKM, entity.Box, entity.BoxSlot);
                    break;
            }
        }
        return entity;
    }

    public override void SetAllEntities(List<PkmSaveDTO> entities)
    {
        throw new Exception($"Not implemented");
    }

    private void SetParty(List<PKM> party)
    {
        for (var i = 0; i < 6; i++)
        {
            if (i < party.Count)
            {
                save.SetPartySlotAtIndex(party[i], i);
            }
            else
            {
                save.DeletePartySlot(i);
            }
        }
    }
}
