using PKHeX.Core;

public interface ISavePkmLoader
{
    public bool HasWritten { get; set; }

    public PkmSaveDTO CreateDTO(SaveWrapper save, ImmutablePKM pkm, int boxId, int boxSlot);
    public List<PkmSaveDTO> GetAllDtos();
    public PkmSaveDTO? GetDto(string id);
    public PkmSaveDTO? GetDto(int box, int boxSlot);
    public void WriteDto(PkmSaveDTO dto);
    public void DeleteDto(string id);
    public void FlushParty();
    public void SetFlags(DataUpdateSaveListFlags _savesFlags);

}

public class SavePkmLoader(
    ISettingsService settingsService, PkmConvertService pkmConvertService, Dictionary<ushort, StaticEvolve> evolves,
    SaveWrapper save
) : ISavePkmLoader
{
    public static string GetPKMId(string idBase, int box, int slot)
    {
        return $"{idBase}B{box}S{slot}"; ;
    }

    public bool HasWritten { get; set; } = false;

    private Dictionary<string, PkmSaveDTO> dtoById = [];
    private Dictionary<string, PkmSaveDTO> dtoByBox = [];
    private bool NeedUpdate = true;

    private DataUpdateSaveListFlags savesFlags = new();

    public PkmSaveDTO CreateDTO(SaveWrapper save, ImmutablePKM pkm, int boxId, int boxSlot)
    {
        var dto = new PkmSaveDTO(
            SettingsLanguage: settingsService.GetSettings().GetSafeLanguage(),
            Pkm: pkm,

            SaveId: save.Id,
            BoxId: boxId,
            BoxSlot: boxSlot,
            IsDuplicate: false,

            Save: save,
            Evolves: evolves
        );

        return dto;
    }

    private void UpdateDtos()
    {
        var dtoList = new List<PkmSaveDTO>();

        if (save.HasParty)
        {
            var i = 0;
            var partyList = save.GetPartyData();
            partyList.ForEach((pkm) =>
            {
                if (pkm.IsSpeciesValid)
                {
                    var boxSlot = i;
                    dtoList.Add(CreateDTO(
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
                if (pkm.IsSpeciesValid)
                {
                    var box = i;
                    var boxSlot = j;
                    dtoList.Add(CreateDTO(
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
                if (pkm != default && pkm.IsSpeciesValid)
                {
                    var boxSlot = i;
                    dtoList.Add(CreateDTO(
                        save, pkm, (int)BoxType.Daycare, boxSlot
                    ));
                }
            }
        }

        var extraSlots = save.GetExtraSlots(true);
        var extraPkms = extraSlots.Select(slot => (
            Pkm: new ImmutablePKM(slot.Read(save.GetSave())),
            Slot: slot
        )).ToList().FindAll(extra => extra.Pkm.IsSpeciesValid);

        extraPkms.ForEach((extra) =>
        {
            var boxType = BoxLoader.GetTypeFromStorageSlotType(extra.Slot.Type);
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
            dtoList.Add(CreateDTO(
                save, extra.Pkm, box, boxSlot
            ));
        });

        var dictById = new Dictionary<string, PkmSaveDTO>();
        var dictByBox = new Dictionary<string, PkmSaveDTO>();

        var duplicatesDictByIdBase = new Dictionary<string, List<PkmSaveDTO>>();

        foreach (var dto in dtoList)
        {
            dictById.Add(dto.Id, dto);
            dictByBox.Add(GetDTOByBoxKey(dto.BoxId, dto.BoxSlot), dto);

            if (!duplicatesDictByIdBase.TryGetValue(dto.IdBase, out var duplicateList))
            {
                duplicateList = [];
                duplicatesDictByIdBase.Add(dto.IdBase, duplicateList);
            }
            duplicateList.Add(dto);
        }

        duplicatesDictByIdBase.Values.Where(list => list.Count > 1).SelectMany(list => list).ToList().ForEach(dto =>
        {
            dto = dto with { IsDuplicate = true };
            dictById[dto.Id] = dto;
            dictByBox[GetDTOByBoxKey(dto.BoxId, dto.BoxSlot)] = dto;
        });

        dtoById = dictById;
        dtoByBox = dictByBox;
        NeedUpdate = false;
    }

    public List<PkmSaveDTO> GetAllDtos()
    {
        if (NeedUpdate)
        {
            UpdateDtos();
        }

        return [.. dtoById.Values];
    }

    public PkmSaveDTO? GetDto(string id)
    {
        if (NeedUpdate)
        {
            UpdateDtos();
        }

        if (dtoById.TryGetValue(id, out var dto))
        {
            return dto;
        }

        return null;
    }

    public PkmSaveDTO? GetDto(int box, int boxSlot)
    {
        if (NeedUpdate)
        {
            UpdateDtos();
        }

        if (dtoByBox.TryGetValue(GetDTOByBoxKey(box, boxSlot), out var dto))
        {
            return dto;
        }

        return null;
    }

    public void WriteDto(PkmSaveDTO dto)
    {
        if (!dto.IsEnabled)
        {
            throw new InvalidOperationException($"Write disabled PkmSaveDTO not allowed");
        }

        if (!BoxLoader.CanIdReceivePkm(dto.BoxId))
        {
            throw new Exception("Not allowed for pkm in daycare");
        }

        var savePkmType = save.PKMType;

        var pkm = pkmConvertService.GetConvertedPkm(dto.Pkm, save.GetBlankPKM().GetMutablePkm(), null);
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

        SetDTO(dto);
    }

    public void DeleteDto(string id)
    {
        var dto = GetDto(id);
        if (dto != default)
        {
            if (!BoxLoader.CanIdReceivePkm(dto.BoxId))
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

            RemoveDTO(dto);
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
        .FindAll(pkm => pkm.IsSpeciesValid);

        SetParty(party);
    }

    private void SetParty(List<ImmutablePKM> party)
    {
        for (var i = 0; i < 6; i++)
        {
            if (i < party.Count)
            {
                var pkm = party[i];
                save.SetPartySlotAtIndex(pkm, i);
                if (pkm.IsSpeciesValid)
                {
                    var boxSlot = i;
                    SetDTO(
                        CreateDTO(
                            save, pkm, (int)BoxType.Party, boxSlot
                        )
                    );
                }
            }
            else
            {
                RemoveDTO((int)BoxType.Party, i);
            }
        }
    }

    public void SetFlags(DataUpdateSaveListFlags _savesFlags)
    {
        savesFlags = _savesFlags;
    }

    private void SetDTO(PkmSaveDTO dto)
    {
        RemoveDTO(dto.BoxId, dto.BoxSlot);

        dtoById[dto.Id] = dto;
        dtoByBox[GetDTOByBoxKey(dto.BoxId, dto.BoxSlot)] = dto;

        savesFlags.UseSave(save.Id).SavePkms.Ids.Add(dto.Id);
        HasWritten = true;
    }

    private void RemoveDTO(int boxId, int boxSlot)
    {
        var boxKey = GetDTOByBoxKey(boxId, boxSlot);
        if (dtoByBox.TryGetValue(boxKey, out var value))
        {
            RemoveDTO(value);
        }
    }

    private void RemoveDTO(PkmSaveDTO dto)
    {
        dtoById.Remove(dto.Id);
        dtoByBox.Remove(GetDTOByBoxKey(dto.BoxId, dto.BoxSlot));

        savesFlags.UseSave(save.Id).SavePkms.Ids.Add(dto.Id);
        HasWritten = true;
    }

    private string GetDTOByBoxKey(int box, int boxSlot) => box + "." + boxSlot;
}
