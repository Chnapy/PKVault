using PKHeX.Core;

public class SavePkmLoader(
    SaveFile save,
    EntityLoader<PkmDTO, PkmEntity> pkmDtoLoader,
    EntityLoader<PkmVersionDTO, PkmVersionEntity> pkmVersionDtoLoader
)
{
    public bool HasWritten = false;

    public async Task<List<PkmSaveDTO>> GetAllDtos()
    {
        var taskList = new List<Task<PkmSaveDTO>>();

        if (save.HasParty)
        {
            var i = 0;
            save.PartyData.ToList().ForEach((pkm) =>
            {
                if (pkm.Species != 0)
                {
                    var task = PkmSaveDTO.FromPkm(save, pkm, BoxDTO.PARTY_ID, i, pkmDtoLoader, pkmVersionDtoLoader);
                    taskList.Add(task);
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
                    var task = PkmSaveDTO.FromPkm(save, pkm, BoxDTO.DAYCARE_ID, i, pkmDtoLoader, pkmVersionDtoLoader);
                    taskList.Add(task);
                }
            }
        }

        for (var i = 0; i < save.BoxCount; i++)
        {
            var pkms = save.GetBoxData(i).ToList();
            var j = 0;
            foreach (var pkm in pkms)
            {
                if (pkm.Species != 0)
                {
                    var task = PkmSaveDTO.FromPkm(save, pkm, i, j, pkmDtoLoader, pkmVersionDtoLoader);
                    taskList.Add(task);
                }
                j++;
            }
        }

        return [.. await Task.WhenAll(taskList)];
    }

    public async Task<PkmSaveDTO?> GetDto(string id)
    {
        return (await GetAllDtos()).Find(entity => entity.Id == id);
    }

    public async Task WriteDto(PkmSaveDTO dto)
    {
        if (dto.Box == BoxDTO.DAYCARE_ID)
        {
            throw new Exception("Not allowed for pkm in daycare");
        }

        var savePkmType = save.BlankPKM.GetType();

        var pkm = EntityConverter.ConvertToType(dto.Pkm, savePkmType, out var result);
        if (pkm == default)
        {
            throw new Exception($"PkmSaveDTO.Pkm convert failed, id={dto.Id} from.type={dto.Pkm.GetType()} to.type={savePkmType} result={result}");
        }

        var party = save.PartyData.ToList().FindAll(pkm => pkm.Species != 0);

        var oldEntity = await GetDto(dto.Id);

        if (oldEntity != null)
        {
            if (oldEntity.Box == BoxDTO.DAYCARE_ID)
            {
                throw new Exception("Not allowed for pkm in daycare");
            }

            switch (oldEntity.Box)
            {
                case BoxDTO.PARTY_ID:
                    party = party.FindAll(pkm => BasePkmVersionDTO.GetPKMId(pkm) != dto.Id);
                    break;
                default:
                    save.SetBoxSlotAtIndex(save.BlankPKM, oldEntity.Box, oldEntity.BoxSlot);
                    break;
            }
        }

        switch (dto.Box)
        {
            case BoxDTO.PARTY_ID:
                party.Add(pkm);
                break;
            default:
                save.SetBoxSlotAtIndex(pkm, dto.Box, dto.BoxSlot);
                break;
        }

        HasWritten = true;

        if ((oldEntity != default && oldEntity.Box == BoxDTO.PARTY_ID) || dto.Box == BoxDTO.PARTY_ID)
        {
            SetParty(party);
        }
    }

    public async Task DeleteDto(string id)
    {
        var entity = await GetDto(id);
        if (entity != default)
        {
            switch (entity.Box)
            {
                case BoxDTO.DAYCARE_ID:
                    throw new Exception("Not allowed for pkm in daycare");
                case BoxDTO.PARTY_ID:
                    var party = save.PartyData.ToList()
                        .FindAll(pkm => pkm.Species != 0)
                        .FindAll(pkm => BasePkmVersionDTO.GetPKMId(pkm) != entity.Id);

                    SetParty(party);
                    break;
                default:
                    save.SetBoxSlotAtIndex(save.BlankPKM, entity.Box, entity.BoxSlot);
                    break;
            }

            HasWritten = true;
        }
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
