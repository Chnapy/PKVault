using PKHeX.Core;

public class SavePkmLoader : EntityLoader<PkmSaveDTO, object>
{
    public static async Task<SavePkmLoader> Create(SaveFile save, EntityLoader<PkmDTO, PkmEntity> pkmDtoLoader, EntityLoader<PkmVersionDTO, PkmVersionEntity> pkmVersionDtoLoader)
    {
        var dtoList = await PrepareDtoList(save, pkmDtoLoader, pkmVersionDtoLoader);

        return new(
            save,
            pkmDtoLoader,
            pkmVersionDtoLoader,
            dtoList
        );
    }

    private static async Task<List<PkmSaveDTO>> PrepareDtoList(SaveFile save, EntityLoader<PkmDTO, PkmEntity> pkmDtoLoader, EntityLoader<PkmVersionDTO, PkmVersionEntity> pkmVersionDtoLoader)
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

    private SaveFile save;
    private EntityLoader<PkmDTO, PkmEntity> pkmDtoLoader;
    private EntityLoader<PkmVersionDTO, PkmVersionEntity> pkmVersionDtoLoader;

    private List<PkmSaveDTO> dtoList;

    private SavePkmLoader(SaveFile _save, EntityLoader<PkmDTO, PkmEntity> _pkmDtoLoader, EntityLoader<PkmVersionDTO, PkmVersionEntity> _pkmVersionDtoLoader, List<PkmSaveDTO> _dtoList)
    {
        save = _save;
        pkmDtoLoader = _pkmDtoLoader;
        pkmVersionDtoLoader = _pkmVersionDtoLoader;

        dtoList = _dtoList;
    }

    public override List<PkmSaveDTO> GetAllDtos()
    {
        return [.. dtoList];
    }

    public override async Task WriteDto(PkmSaveDTO dto)
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

        var oldEntity = GetDto(dto.Id);

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

        dtoList = await PrepareDtoList(save, pkmDtoLoader, pkmVersionDtoLoader);
    }

    public override async Task DeleteDto(string id)
    {
        var entity = GetDto(id);
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

            dtoList = dtoList.FindAll(dto => dto.Id != id);
        }
    }

    public override Task SetAllDtos(List<PkmSaveDTO> entities)
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
