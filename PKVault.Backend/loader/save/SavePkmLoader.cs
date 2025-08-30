using PKHeX.Core;

public class SavePkmLoader(
    SaveFile save,
    EntityLoader<PkmDTO, PkmEntity> pkmDtoLoader,
    EntityLoader<PkmVersionDTO, PkmVersionEntity> pkmVersionDtoLoader
)
{
    public bool HasWritten = false;

    private Dictionary<string, PkmSaveDTO> dtoById = [];
    private Dictionary<string, PkmSaveDTO> dtoByBox = [];

    private bool needUpdate = true;

    private async Task UpdateDtos()
    {
        var taskList = new List<Task<PkmSaveDTO>>();

        if (save.HasParty)
        {
            var i = 0;
            var partyList = save.PartyData.ToList();
            partyList.ForEach((pkm) =>
            {
                if (pkm.Species != 0)
                {
                    var boxSlot = i;
                    taskList.Add(Task.Run(() => PkmSaveDTO.FromPkm(save, pkm, BoxDTO.PARTY_ID, boxSlot, pkmDtoLoader, pkmVersionDtoLoader)));
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
                    var boxSlot = i;
                    taskList.Add(Task.Run(() => PkmSaveDTO.FromPkm(save, pkm, BoxDTO.DAYCARE_ID, boxSlot, pkmDtoLoader, pkmVersionDtoLoader)));
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
                    var box = i;
                    var boxSlot = j;
                    taskList.Add(Task.Run(() => PkmSaveDTO.FromPkm(save, pkm, box, boxSlot, pkmDtoLoader, pkmVersionDtoLoader)));
                }
                j++;
            }
        }

        var dictById = new Dictionary<string, PkmSaveDTO>();
        var dictByBox = new Dictionary<string, PkmSaveDTO>();

        foreach (var dto in await Task.WhenAll(taskList))
        {
            // Console.WriteLine($"{dto.Id} - {dto.Box}/{dto.BoxSlot}");
            dictById.Add(dto.Id, dto);
            dictByBox.Add(dto.Box + "." + dto.BoxSlot, dto);
        }

        dtoById = dictById;
        dtoByBox = dictByBox;
        needUpdate = false;
    }

    public async Task<List<PkmSaveDTO>> GetAllDtos()
    {
        if (needUpdate)
        {
            await UpdateDtos();
        }

        return [.. dtoById.Values];
    }

    public async Task<PkmSaveDTO?> GetDto(string id)
    {
        if (needUpdate)
        {
            await UpdateDtos();
        }

        if (dtoById.TryGetValue(id, out var dto))
        {
            return dto;
        }

        return null;
    }

    public async Task<PkmSaveDTO?> GetDto(int box, int boxSlot)
    {
        if (needUpdate)
        {
            await UpdateDtos();
        }

        if (dtoByBox.TryGetValue(box + "." + boxSlot, out var dto))
        {
            return dto;
        }

        return null;
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

        await DeleteDto(dto.Id);

        List<PKM>? party = null;

        // var oldEntity = await GetDto(dto.Id);

        // if (oldEntity != null)
        // {
        //     if (oldEntity.Box == BoxDTO.DAYCARE_ID)
        //     {
        //         throw new Exception("Not allowed for pkm in daycare");
        //     }

        //     switch (oldEntity.Box)
        //     {
        //         case BoxDTO.PARTY_ID:
        //             party = save.PartyData.ToList().FindAll(pkm => pkm.Species != 0)
        //                 .FindAll(pkm => BasePkmVersionDTO.GetPKMId(pkm) != dto.Id);
        //             break;
        //         default:
        //             save.SetBoxSlotAtIndex(save.BlankPKM, oldEntity.Box, oldEntity.BoxSlot);
        //             break;
        //     }

        //     dtoById.Remove(oldEntity.Id, out _);
        //     dtoByBox.Remove(oldEntity.Box + "." + oldEntity.BoxSlot, out _);
        // }

        switch (dto.Box)
        {
            case BoxDTO.PARTY_ID:
                party ??= save.PartyData.ToList().FindAll(pkm => pkm.Species != 0);
                party.Add(pkm);
                break;
            default:
                save.SetBoxSlotAtIndex(pkm, dto.Box, dto.BoxSlot);
                break;
        }

        if (party != null)
        {
            SetParty(party);
        }

        dtoById.TryAdd(dto.Id, dto);
        dtoByBox.TryAdd(dto.Box + "." + dto.BoxSlot, dto);

        HasWritten = true;
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
                    var party = save.PartyData.ToList().FindAll(pkm => pkm.Species != 0)
                        .FindAll(pkm => BasePkmVersionDTO.GetPKMId(pkm) != entity.Id);

                    SetParty(party);
                    break;
                default:
                    save.SetBoxSlotAtIndex(save.BlankPKM, entity.Box, entity.BoxSlot);
                    break;
            }

            dtoById.Remove(id, out _);
            dtoByBox.Remove(entity.Box + "." + entity.BoxSlot, out _);

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
