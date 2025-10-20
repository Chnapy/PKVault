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

    private void UpdateDtos()
    {
        var dtoList = new List<PkmSaveDTO>();

        if (save.HasParty)
        {
            var i = 0;
            var partyList = save.PartyData.ToList();
            partyList.ForEach((pkm) =>
            {
                if (pkm.Species != 0)
                {
                    var boxSlot = i;
                    dtoList.Add(PkmSaveDTO.FromPkm(save, pkm, BoxDTO.PARTY_ID, boxSlot));
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
                    dtoList.Add(PkmSaveDTO.FromPkm(save, pkm, BoxDTO.DAYCARE_ID, boxSlot));
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
                    dtoList.Add(PkmSaveDTO.FromPkm(save, pkm, box, boxSlot));
                }
                j++;
            }
        }

        var dictById = new Dictionary<string, PkmSaveDTO>();
        var dictByBox = new Dictionary<string, PkmSaveDTO>();

        foreach (var dto in dtoList)
        {
            // Console.WriteLine($"{dto.Id} - {dto.Box}/{dto.BoxSlot}");
            dictById.Add(dto.Id, dto);
            dictByBox.Add(dto.BoxId + "." + dto.BoxSlot, dto);
        }

        dtoById = dictById;
        dtoByBox = dictByBox;
        needUpdate = false;
    }

    public List<PkmSaveDTO> GetAllDtos()
    {
        if (needUpdate)
        {
            UpdateDtos();
        }

        return [.. dtoById.Values.Select(dto => {
            dto = dto.Clone();

            dto.RefreshPkmVersionId(pkmLoader, pkmVersionLoader);

            return dto;
        })];
    }

    public PkmSaveDTO? GetDto(string id)
    {
        if (needUpdate)
        {
            UpdateDtos();
        }

        if (dtoById.TryGetValue(id, out var dto))
        {
            dto = dto.Clone();

            dto.RefreshPkmVersionId(pkmLoader, pkmVersionLoader);

            return dto;
        }

        // if (!id.Substring(id.Length - 3, 3).Contains('S'))
        // {
        //     throw new Exception($"Not using save ID with box slot: {id}");
        // }

        return null;
    }

    public PkmSaveDTO? GetDto(int box, int boxSlot)
    {
        if (needUpdate)
        {
            UpdateDtos();
        }

        if (dtoByBox.TryGetValue(box + "." + boxSlot, out var dto))
        {
            dto = dto.Clone();

            dto.RefreshPkmVersionId(pkmLoader, pkmVersionLoader);

            return dto;
        }

        return null;
    }

    public void WriteDto(PkmSaveDTO dto)
    {
        if (dto.BoxId == BoxDTO.DAYCARE_ID)
        {
            throw new Exception("Not allowed for pkm in daycare");
        }

        var savePkmType = save.BlankPKM.GetType();

        var pkm = PkmConvertService.GetConvertedPkm(dto.Pkm, save.BlankPKM, null);
        if (pkm == default)
        {
            throw new Exception($"PkmSaveDTO.Pkm convert failed, id={dto.Id} from.type={dto.Pkm.GetType()} to.type={savePkmType}");
        }

        DeleteDto(dto.Id);

        switch (dto.BoxId)
        {
            case BoxDTO.PARTY_ID:
                WriteParty(dto.Pkm, dto.BoxSlot);
                break;
            default:
                save.SetBoxSlotAtIndex(pkm, dto.BoxId, dto.BoxSlot);
                break;
        }

        needUpdate = true;
        // Console.WriteLine($"ADD {dto.Id} / {dto.Box} / {dto.BoxSlot}");

        HasWritten = true;
    }

    public void DeleteDto(string id)
    {
        var dto = GetDto(id);
        if (dto != default)
        {
            switch (dto.BoxId)
            {
                case BoxDTO.DAYCARE_ID:
                    throw new Exception("Not allowed for pkm in daycare");
                case BoxDTO.PARTY_ID:
                    WriteParty(null, dto.BoxSlot);
                    break;
                default:
                    save.SetBoxSlotAtIndex(save.BlankPKM, dto.BoxId, dto.BoxSlot);
                    break;
            }

            // Console.WriteLine($"REMOVE {id} / {dto.Box} / {dto.BoxSlot}");

            needUpdate = true;
            HasWritten = true;
        }
    }

    private void WriteParty(PKM? pkm, int slot)
    {
        var party = save.PartyData.ToList();
        while (party.Count < 6)
        {
            party.Add(save.BlankPKM);
        }
        party[slot] = pkm ?? save.BlankPKM;
        SetParty(party);
    }

    public void FlushParty()
    {
        var party = save.PartyData.ToList()
        .FindAll(pkm => pkm.Species != 0);

        SetParty(party);

        needUpdate = true;
        HasWritten = true;
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
                save.SetPartySlotAtIndex(save.BlankPKM, i);
            }
        }
        // Console.WriteLine($"PARTY = {string.Join(',', party.Select(pk => pk.Nickname))}\n{string.Join(',', save.PartyData.ToList().Select(pk => pk.Nickname))}");
    }
}
