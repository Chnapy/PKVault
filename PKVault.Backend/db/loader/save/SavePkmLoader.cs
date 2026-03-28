using System.Collections.Immutable;
using Microsoft.Extensions.Caching.Memory;
using PKHeX.Core;

public interface ISavePkmLoader
{
    public bool HasWritten { get; set; }

    public PkmSaveDTO CreateDTO(SaveWrapper save, ImmutablePKM pkm, int boxId, int boxSlot);
    public PkmSaveDTO CreateDTO(SaveWrapper save, ImmutablePKM pkm, string boxId, int boxSlot);
    public List<PkmSaveDTO> GetAllDtos();
    public PkmSaveDTO? GetDto(string id);
    public PkmSaveDTO? GetDto(string boxId, int boxSlot);
    public ImmutableDictionary<string, PkmSaveDTO> GetDtosByIdBase(string idBase);
    public void WriteDto(PkmSaveDTO dto, BoxDTO? box = null);
    public void DeleteDto(string id);
    public void FlushParty();
    public void SetFlags(DataUpdateSaveListFlags _savesFlags, DataUpdateFlagsState _dexFlags);
}

public class SavePkmLoader(
    IPkmConvertService pkmConvertService, string language, Dictionary<ushort, StaticEvolve> evolves,
    SaveWrapper save
) : ISavePkmLoader
{
    public static string GetPKMId(string idBase, int box, int slot)
    {
        return $"{idBase}B{box}S{slot}"; ;
    }

    private readonly IMemoryCache Cache = new MemoryCache(new MemoryCacheOptions() { });

    public bool HasWritten { get; set; } = false;
    private bool NeedPartyFlush = false;

    private DataUpdateSaveListFlags savesFlags = new();
    private DataUpdateFlagsState dexFlags = new();

    public PkmSaveDTO CreateDTO(SaveWrapper save, ImmutablePKM pkm, string boxId, int boxSlot)
    {
        return CreateDTO(save, pkm, int.Parse(boxId), boxSlot);
    }

    public PkmSaveDTO CreateDTO(SaveWrapper save, ImmutablePKM pkm, int boxId, int boxSlot)
    {
        var dto = new PkmSaveDTO(
            SettingsLanguage: language,
            Pkm: pkm,

            BoxId: boxId,
            BoxSlot: boxSlot,
            IsDuplicate: false,

            Save: save,
            Evolves: evolves
        );

        return dto;
    }

    private record DtosIndexes(
        Dictionary<string, PkmSaveDTO> DtoById,
        Dictionary<string, PkmSaveDTO> DtoByBox,
        Dictionary<string, Dictionary<string, PkmSaveDTO>> DtosByIdBase
    );

    public List<PkmSaveDTO> GetAllDtos()
    {
        var (dtoById, _, _) = GetDtosIndexes();

        return [.. dtoById.Values.Select(DTOWithDuplicateCheck)];
    }

    public PkmSaveDTO? GetDto(string id)
    {
        var (dtoById, _, _) = GetDtosIndexes();

        if (dtoById.TryGetValue(id, out var dto))
        {
            return DTOWithDuplicateCheck(dto);
        }

        return null;
    }

    public PkmSaveDTO? GetDto(string boxId, int boxSlot)
    {
        var (_, dtoByBox, _) = GetDtosIndexes();

        if (dtoByBox.TryGetValue(GetDTOByBoxKey(boxId, boxSlot), out var dto))
        {
            return DTOWithDuplicateCheck(dto);
        }

        return null;
    }

    public ImmutableDictionary<string, PkmSaveDTO> GetDtosByIdBase(string idBase)
    {
        var (_, _, dtosByIdBase) = GetDtosIndexes();

        if (dtosByIdBase.TryGetValue(idBase, out var dtoDict))
        {
            return dtoDict.ToImmutableDictionary();
        }

        return [];
    }

    private PkmSaveDTO DTOWithDuplicateCheck(PkmSaveDTO dto)
    {
        var (_, _, dtosByIdBase) = GetDtosIndexes();

        if (dtosByIdBase.TryGetValue(dto.IdBase, out var dtoDict) && dtoDict.Count > 1)
        {
            return dto with { IsDuplicate = true };
        }
        return dto;
    }

    public void WriteDto(PkmSaveDTO dto, BoxDTO? box = null)
    {
        if (!dto.IsEnabled)
        {
            throw new InvalidOperationException($"Write disabled PkmSaveDTO not allowed");
        }

        if (!BoxLoader.CanIdReceivePkm(dto.BoxId))
        {
            throw new Exception("Not allowed for pkm in daycare");
        }

        if (box != null)
        {
            if (dto.BoxId != box.IdInt)
            {
                throw new ArgumentException($"Inconsistent SavePkm {dto.Id} BoxId={dto.BoxId}, expected={box.IdInt}");
            }

            if (dto.BoxSlot >= box.SlotCount)
            {
                throw new ArgumentException($"Wrong SavePkm {dto.Id} BoxSlot={dto.BoxSlot}, should be less than box.SlotCount={box.SlotCount}");
            }
        }

        // no real convert here,
        // just update pkm for in-save legality concerns
        var pkm = pkmConvertService.ConvertTo(
            dto.Pkm,
            save.GetBlankPKM().GetMutablePkm().GetType(),
            dto.Pkm.GetMutablePkm() is GBPKM
                ? null
                : new(
                    PID: dto.Pkm.PID,
                    EncryptionConstant: dto.Pkm.EncryptionConstant
                ),
            targetSave: save.GetSave()
        );

        // stored dto should use updated pkm
        dto = dto with
        {
            Pkm = pkm
        };

        DeleteDto(dto.Id);

        // note: can mutate given pkm
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

        dexFlags.Ids.Add(dto.Species.ToString());
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

            dexFlags.Ids.Add(dto.Species.ToString());
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
        NeedPartyFlush = true;
    }

    public void FlushParty()
    {
        if (!save.HasParty || !NeedPartyFlush)
        {
            return;
        }

        var party = save.GetPartyData()
        .FindAll(pkm => pkm.IsSpeciesValid);

        SetParty(party);
        NeedPartyFlush = false;

        // var expectedPartyChecksum = string.Join(',', party.Select(pkm => pkm.Species));
        // var currentPartyChecksum = string.Join(',', save.GetPartyData().FindAll(pkm => pkm.IsSpeciesValid).Select(pkm => pkm.Species));

        // if (expectedPartyChecksum != currentPartyChecksum)
        // {
        //     throw new Exception($"Wrong party checksum:\nExpected = {expectedPartyChecksum}\nCurrent = {currentPartyChecksum}");
        // }
    }

    private void SetParty(List<ImmutablePKM> party)
    {
        // Console.WriteLine($"SET-PARTY {string.Join('.', party.Select(pk => pk.Species))}");
        for (var slot = 0; slot < 6; slot++)
        {
            if (slot < party.Count)
            {
                var pkm = party[slot];
                save.SetPartySlotAtIndex(pkm, slot);
                if (pkm.IsSpeciesValid)
                {
                    SetDTO(
                        CreateDTO(
                            save, pkm, (int)BoxType.Party, slot
                        )
                    );
                }
                else
                {
                    save.SetPartySlotAtIndex(save.GetBlankPKM(), slot);
                    RemoveDTO((int)BoxType.Party, slot);
                }
            }
            else
            {
                save.SetPartySlotAtIndex(save.GetBlankPKM(), slot);
                RemoveDTO((int)BoxType.Party, slot);
            }
        }
    }

    public void SetFlags(DataUpdateSaveListFlags _savesFlags, DataUpdateFlagsState _dexFlags)
    {
        savesFlags = _savesFlags;
        dexFlags = _dexFlags;
    }

    private void SetDTO(PkmSaveDTO dto)
    {
        RemoveDTO(dto.BoxId, dto.BoxSlot);

        var (dtoById, dtoByBox, dtosByIdBase) = GetDtosIndexes();

        if (!dtosByIdBase.TryGetValue(dto.IdBase, out var dtoDict))
        {
            dtoDict = [];
            dtosByIdBase.Add(dto.IdBase, dtoDict);
        }
        dtoDict.Add(dto.Id, dto);

        dtoById[dto.Id] = dto;
        dtoByBox[GetDTOByBoxKey(dto.BoxId.ToString(), dto.BoxSlot)] = dto;

        savesFlags.UseSave(save.Id).SavePkms.Ids.Add(dto.Id);
        HasWritten = true;
    }

    private void RemoveDTO(int boxId, int boxSlot)
    {
        var (_, dtoByBox, _) = GetDtosIndexes();

        var boxKey = GetDTOByBoxKey(boxId.ToString(), boxSlot);
        if (dtoByBox.TryGetValue(boxKey, out var value))
        {
            RemoveDTO(value);
        }
    }

    private void RemoveDTO(PkmSaveDTO dto)
    {
        var (dtoById, dtoByBox, dtosByIdBase) = GetDtosIndexes();

        dtoById.Remove(dto.Id);
        dtoByBox.Remove(GetDTOByBoxKey(dto.BoxId.ToString(), dto.BoxSlot));

        if (dtosByIdBase.TryGetValue(dto.IdBase, out var dtoDict))
        {
            dtoDict.Remove(dto.Id);
        }

        savesFlags.UseSave(save.Id).SavePkms.Ids.Add(dto.Id);
        HasWritten = true;
    }

    private string GetDTOByBoxKey(string boxId, int boxSlot) => boxId + "." + boxSlot;

    private DtosIndexes GetDtosIndexes()
    {
        var cacheKey = $"save-pkms-{save.Id}";
        if (!Cache.TryGetValue(cacheKey, out DtosIndexes? value))
        {
            Console.WriteLine($"Update static cache: {cacheKey}");

            value = PrepareDtos();

            Cache.Set(cacheKey, value, new MemoryCacheEntryOptions
            {
                SlidingExpiration = TimeSpan.FromSeconds(20),
            });
        }

        return value!;
    }

    private DtosIndexes PrepareDtos()
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

        if (save.GetSave() is IDaycareStorage saveDaycare)
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
            if (boxType == BoxType.Daycare && save.GetSave() is IDaycareStorage saveDaycare)
            {
                boxSlot += saveDaycare.DaycareSlotCount;
            }
            dtoList.Add(CreateDTO(
                save, extra.Pkm, box, boxSlot
            ));
        });

        var dictById = new Dictionary<string, PkmSaveDTO>();
        var dictByBox = new Dictionary<string, PkmSaveDTO>();

        var duplicatesDictByIdBase = new Dictionary<string, Dictionary<string, PkmSaveDTO>>();

        foreach (var dto in dtoList)
        {
            dictById.Add(dto.Id, dto);
            dictByBox.Add(GetDTOByBoxKey(dto.BoxId.ToString(), dto.BoxSlot), dto);

            if (!duplicatesDictByIdBase.TryGetValue(dto.IdBase, out var duplicateDict))
            {
                duplicateDict = [];
                duplicatesDictByIdBase.Add(dto.IdBase, duplicateDict);
            }
            duplicateDict.Add(dto.Id, dto);
        }

        return new(dictById, dictByBox, duplicatesDictByIdBase);
    }
}
