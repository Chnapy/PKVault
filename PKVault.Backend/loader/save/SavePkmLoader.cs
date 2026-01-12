using PKHeX.Core;

public class SavePkmLoader(
    PkmConvertService pkmConvertService, SaveWrapper save
)
{
    public bool HasWritten = false;

    private Dictionary<string, PkmSaveDTO> dtoById = [];
    private Dictionary<string, PkmSaveDTO> dtoByBox = [];

    private bool needUpdate = true;

    private DataUpdateSaveListFlags savesFlags = new();

    private void UpdateDtos()
    {
        var dtoList = new List<PkmSaveDTO>();

        if (save.HasParty)
        {
            var i = 0;
            var partyList = save.GetPartyData();
            partyList.ForEach((pkm) =>
            {
                if (pkm.IsSpeciesValid())
                {
                    var boxSlot = i;
                    dtoList.Add(PkmSaveDTO.FromPkm(
                        save, pkm, (int)BoxType.Party, boxSlot
                    ));
                }
                i++;
            });
        }

        for (var i = 0; i < save.BoxCount; i++)
        {
            var pkms = save.GetBoxData(i);
            var j = 0;
            foreach (var pkm in pkms)
            {
                if (pkm.IsSpeciesValid())
                {
                    var box = i;
                    var boxSlot = j;
                    dtoList.Add(PkmSaveDTO.FromPkm(
                        save, pkm, box, boxSlot
                    ));
                }
                j++;
            }
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
                var pkm = new ImmutablePKM(slot.Read(save.GetSave()));
                if (pkm != default && pkm.IsSpeciesValid())
                {
                    var boxSlot = i;
                    dtoList.Add(PkmSaveDTO.FromPkm(
                        save, pkm, (int)BoxType.Daycare, boxSlot
                    ));
                }
            }
        }

        var extraSlots = save.GetExtraSlots(true);
        var extraPkms = extraSlots.Select(slot => (
            Pkm: new ImmutablePKM(slot.Read(save.GetSave())),
            Slot: slot
        )).ToList().FindAll(extra => extra.Pkm.IsSpeciesValid());

        extraPkms.ForEach((extra) =>
        {
            var boxType = BoxDTO.GetTypeFromStorageSlotType(extra.Slot.Type);
            int box = boxType switch
            {
                BoxType.Box => throw new NotImplementedException(),
                _ => (int)boxType,
            };
            var boxSlot = extra.Slot.Slot;
            if (boxType == BoxType.Daycare && save is IDaycareStorage saveDaycare)
            {
                boxSlot += saveDaycare.DaycareSlotCount;
            }
            dtoList.Add(PkmSaveDTO.FromPkm(
                save, extra.Pkm, box, boxSlot
            ));
        });

        var dictById = new Dictionary<string, PkmSaveDTO>();
        var dictByBox = new Dictionary<string, PkmSaveDTO>();

        var duplicatesDictByIdBase = new Dictionary<string, List<PkmSaveDTO>>();

        foreach (var dto in dtoList)
        {
            // Console.WriteLine($"{dto.Id} - {dto.Box}/{dto.BoxSlot}");
            dictById.Add(dto.Id, dto);
            dictByBox.Add(dto.BoxId + "." + dto.BoxSlot, dto);

            if (!duplicatesDictByIdBase.TryGetValue(dto.IdBase, out var duplicateList))
            {
                duplicateList = [];
                duplicatesDictByIdBase.Add(dto.IdBase, duplicateList);
            }
            duplicateList.Add(dto);
        }

        duplicatesDictByIdBase.Values.Where(list => list.Count > 1).SelectMany(list => list).ToList().ForEach(dto =>
        {
            dto.SetDuplicate(true);
        });

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

        return [.. dtoById.Values];
    }

    public PkmSaveDTO? GetDto(string id)
    {
        if (needUpdate)
        {
            UpdateDtos();
        }

        if (dtoById.TryGetValue(id, out var dto))
        {
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
            return dto;
        }

        return null;
    }

    public void WriteDto(PkmSaveDTO dto)
    {
        if (!BoxDTO.CanIdReceivePkm(dto.BoxId))
        {
            throw new Exception("Not allowed for pkm in daycare");
        }

        var savePkmType = save.PKMType;

        var pkm = pkmConvertService.GetConvertedPkm(dto.Pkm, save.GetBlankPKM().GetPkm(), null);
        if (pkm == default)
        {
            throw new Exception($"PkmSaveDTO.Pkm convert failed, id={dto.Id} from.type={dto.Pkm.GetType()} to.type={savePkmType}");
        }

        DeleteDto(dto.Id);

        switch (dto.BoxId)
        {
            case (int)BoxType.Party:
                WriteParty(pkm, dto.BoxSlot);
                break;
            default:
                save.SetBoxSlotAtIndex(pkm, dto.BoxId, dto.BoxSlot);
                break;
        }

        savesFlags.UseSave(save.Id).SavePkms.Ids.Add(dto.Id);

        needUpdate = true;
        // Console.WriteLine($"ADD {dto.Id} / {dto.BoxId} / {dto.BoxSlot} / CurrentHandler={pkm.CurrentHandler}");

        HasWritten = true;
    }

    public void DeleteDto(string id)
    {
        var dto = GetDto(id);
        if (dto != default)
        {
            if (!BoxDTO.CanIdReceivePkm(dto.BoxId))
            {
                throw new Exception("Not allowed for pkm in daycare");
            }

            switch (dto.BoxId)
            {
                case (int)BoxType.Party:
                    WriteParty(null, dto.BoxSlot);
                    break;
                default:
                    save.SetBoxSlotAtIndex(save.GetBlankPKM(), dto.BoxId, dto.BoxSlot);
                    break;
            }

            // Console.WriteLine($"REMOVE {id} / {dto.Box} / {dto.BoxSlot}");

            savesFlags.UseSave(save.Id).SavePkms.Ids.Add(dto.Id);
            needUpdate = true;
            HasWritten = true;
        }
    }

    private void WriteParty(ImmutablePKM? pkm, int slot)
    {
        var party = save.GetPartyData();
        while (party.Count < 6)
        {
            party.Add(save.GetBlankPKM());
        }
        party[slot] = pkm ?? save.GetBlankPKM();
        SetParty(party);
    }

    public void FlushParty()
    {
        if (!save.HasParty)
        {
            return;
        }

        var party = save.GetPartyData()
        .FindAll(pkm => pkm.IsSpeciesValid());

        SetParty(party);

        needUpdate = true;
        HasWritten = true;
    }

    private void SetParty(List<ImmutablePKM> party)
    {
        for (var i = 0; i < 6; i++)
        {
            if (i < party.Count)
            {
                var pkm = party[i];
                save.SetPartySlotAtIndex(pkm, i);

                if (pkm.Species > 0)
                {
                    var dtoId = PkmSaveDTO.GetPKMId(
                        pkm.GetPKMIdBase(), (int)BoxType.Party, i
                    );
                    savesFlags.UseSave(save.Id).SavePkms.Ids.Add(dtoId);
                }
            }
            else
            {
                save.SetPartySlotAtIndex(save.GetBlankPKM(), i);
            }
        }
        // Console.WriteLine($"PARTY = {string.Join(',', party.Select(pk => pk.Nickname))}\n{string.Join(',', save.PartyData.ToList().Select(pk => pk.Nickname))}");
    }

    public void SetFlags(DataUpdateSaveListFlags _savesFlags)
    {
        savesFlags = _savesFlags;
    }
}
