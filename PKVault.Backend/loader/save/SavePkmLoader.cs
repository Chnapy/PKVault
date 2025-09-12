using PKHeX.Core;

public class SavePkmLoader(
    SaveFile save,
    EntityLoader<PkmDTO, PkmEntity> pkmLoader,
    EntityLoader<PkmVersionDTO, PkmVersionEntity> pkmVersionLoader
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
                    taskList.Add(Task.Run(() => PkmSaveDTO.FromPkm(save, pkm, BoxDTO.PARTY_ID, boxSlot)));
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
                    taskList.Add(Task.Run(() => PkmSaveDTO.FromPkm(save, pkm, BoxDTO.DAYCARE_ID, boxSlot)));
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
                    taskList.Add(Task.Run(() => PkmSaveDTO.FromPkm(save, pkm, box, boxSlot)));
                }
                j++;
            }
        }

        var dictById = new Dictionary<string, PkmSaveDTO>();
        var dictByBox = new Dictionary<string, PkmSaveDTO>();

        foreach (var dto in await Task.WhenAll(taskList))
        {
            // Console.WriteLine($"{dto.Id} - {dto.Box}/{dto.BoxSlot}");
            try
            {
                dictById.Add(dto.Id, dto);
                dictByBox.Add(dto.Box + "." + dto.BoxSlot, dto);
            }
            catch
            {
                // possible with gen without PID
                Console.Error.WriteLine($"Cannot add dto.id={dto.Id} box={dto.Box} boxSlot={dto.BoxSlot}");
            }
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

        return [.. await Task.WhenAll(dtoById.Values.Select(async dto => {
            dto = dto.Clone();

            await dto.RefreshPkmVersionId(pkmLoader, pkmVersionLoader);

            return dto;
        }))];
    }

    public async Task<PkmSaveDTO?> GetDto(string id)
    {
        if (needUpdate)
        {
            await UpdateDtos();
        }

        if (dtoById.TryGetValue(id, out var dto))
        {
            dto = dto.Clone();

            await dto.RefreshPkmVersionId(pkmLoader, pkmVersionLoader);

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
            dto = dto.Clone();

            await dto.RefreshPkmVersionId(pkmLoader, pkmVersionLoader);

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

        var pkm = PkmConvertService.GetConvertedPkm(dto.Pkm, save.BlankPKM, null);
        if (pkm == default)
        {
            throw new Exception($"PkmSaveDTO.Pkm convert failed, id={dto.Id} from.type={dto.Pkm.GetType()} to.type={savePkmType}");
        }

        await DeleteDto(dto.Id);

        switch (dto.Box)
        {
            // TODO edited pkm is always set last
            case BoxDTO.PARTY_ID:
                var party = save.PartyData.ToList().FindAll(pkm => pkm.Species != 0);
                party.Add(pkm);
                SetParty(party);
                break;
            default:
                save.SetBoxSlotAtIndex(pkm, dto.Box, dto.BoxSlot);
                break;
        }

        needUpdate = true;
        // Console.WriteLine($"ADD {dto.Id} / {dto.Box} / {dto.BoxSlot}");

        HasWritten = true;
    }

    public async Task DeleteDto(string id)
    {
        var dto = await GetDto(id);
        if (dto != default)
        {
            switch (dto.Box)
            {
                case BoxDTO.DAYCARE_ID:
                    throw new Exception("Not allowed for pkm in daycare");
                case BoxDTO.PARTY_ID:
                    var party = save.PartyData.ToList().FindAll(pkm => pkm.Species != 0)
                        .FindAll(pkm => BasePkmVersionDTO.GetPKMId(pkm) != dto.Id);

                    SetParty(party);
                    break;
                default:
                    save.SetBoxSlotAtIndex(save.BlankPKM, dto.Box, dto.BoxSlot);
                    break;
            }

            // Console.WriteLine($"REMOVE {id} / {dto.Box} / {dto.BoxSlot}");

            needUpdate = true;
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
