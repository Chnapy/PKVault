using PKHeX.Core;

public class SaveMovePkmFromStorageAction : DataAction
{
    public uint saveId { get; }
    readonly string pkmVersionId;
    readonly int saveBoxId;
    readonly int saveSlot;

    public SaveMovePkmFromStorageAction(
        uint _saveId,
        string _pkmVersionId,
        int _saveBoxId, int _saveSlot
    )
    {
        saveId = _saveId;
        pkmVersionId = _pkmVersionId;
        saveBoxId = _saveBoxId;
        saveSlot = _saveSlot;
    }

    public override DataActionPayload GetPayload()
    {
        return new DataActionPayload
        {
            type = DataActionType.SAVE_MOVE_PKM_FROM_STORAGE,
            parameters = [saveId, pkmVersionId, saveBoxId, saveSlot]
        };
    }

    public override async Task Execute(DataEntityLoaders loaders)
    {
        var saveLoaders = loaders.saveLoadersDict[saveId];

        var pkmVersionDto = await loaders.pkmVersionLoader.GetDto(pkmVersionId);

        if (pkmVersionDto == default)
        {
            throw new Exception($"PkmVersionEntity not found for id={pkmVersionId}");
        }

        if (pkmVersionDto.Generation != saveLoaders.Save.Generation)
        {
            throw new Exception($"PkmVersionEntity Generation not compatible with save for id={pkmVersionId}, generation={pkmVersionDto.Generation}, save.generation={saveLoaders.Save.Generation}");
        }

        if (!SaveInfosDTO.IsSpeciesAllowed(pkmVersionDto.Pkm.Species, saveLoaders.Save))
        {
            throw new Exception($"PkmVersionEntity Species not compatible with save for id={pkmVersionId}, species={pkmVersionDto.Species}, save.maxSpecies={saveLoaders.Save.MaxSpeciesID}");
        }

        // get save-pkm
        var savePkm = await saveLoaders.Pkms.GetDto(pkmVersionDto.Id);
        if (savePkm != default)
        {
            throw new Exception($"SavePkm already exists, id={savePkm.Id} {savePkm.Nickname}");
        }

        var existingSlot = await saveLoaders.Pkms.GetDto(saveBoxId, saveSlot);
        if (existingSlot != default)
        {
            throw new Exception($"SavePkm already exists in given box slot, box={saveBoxId}, slot={saveSlot}");
        }

        var pkmDto = pkmVersionDto.PkmDto;
        if (pkmDto.SaveId != default)
        {
            throw new Exception($"PkmEntity already in save, id={pkmDto.Id}, saveId={pkmDto.SaveId}");
        }

        var pkm = pkmVersionDto.Pkm;

        // enable national-dex in G3 if pkm outside of regional-dex
        if (saveLoaders.Save is SAV3 saveG3 && !saveG3.NationalDex)
        {
            var hoennDex = await PokeApi.GetPokedex(PokeApiPokedexEnum.HOENN);
            // Console.WriteLine(hoennDex.name);
            var isInDex = hoennDex.PokemonEntries.Any(entry =>
            {
                var url = entry.PokemonSpecies.Url;
                var id = int.Parse(url.TrimEnd('/').Split('/')[^1]);

                return id == pkm.Species;
            });

            if (!isInDex)
            {
                saveG3.NationalDex = true;
            }
        }

        pkmDto.PkmEntity.SaveId = saveLoaders.Save.ID32;
        loaders.pkmLoader.WriteDto(pkmDto);

        var pkmSaveDTO = await PkmSaveDTO.FromPkm(saveLoaders.Save, pkm, saveBoxId, saveSlot);
        await pkmSaveDTO.RefreshPkmVersionId(loaders.pkmLoader, loaders.pkmVersionLoader);
        await saveLoaders.Pkms.WriteDto(pkmSaveDTO);

        if (pkmSaveDTO.PkmVersionId == null)
        {
            throw new Exception($"pkmSaveDTO.PkmVersionId is null, should be {pkmSaveDTO.Id}");
        }
    }
}
