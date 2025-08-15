using PKHeX.Core;

public class SaveMovePkmFromStorageAction : DataAction
{
    public uint saveId { get; }
    readonly string pkmVersionId;
    // readonly BoxType saveBoxType;
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
        // saveBoxType = _saveBoxType;
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
        var saveLoaders = loaders.getSaveLoaders(saveId);

        var pkmVersionEntity = loaders.pkmVersionLoader.GetEntity(pkmVersionId);

        if (pkmVersionEntity == default)
        {
            throw new Exception($"PkmVersionEntity not found for id={pkmVersionId}");
        }

        if (pkmVersionEntity.Generation != saveLoaders.Save.Generation)
        {
            throw new Exception($"PkmVersionEntity Generation not compatible with save for id={pkmVersionId}, generation={pkmVersionEntity.Generation}, save.generation={saveLoaders.Save.Generation}");
        }

        // get save-pkm
        var savePkm = saveLoaders.Pkms.GetEntity(pkmVersionEntity.Id);
        if (savePkm != default)
        {
            throw new Exception($"SavePkm already exists, id={savePkm.Id} {savePkm.Nickname}");
        }

        var existingSlot = saveLoaders.Pkms.GetAllEntities().Find(entity => entity.Box == saveBoxId && entity.BoxSlot == saveSlot);
        if (existingSlot != default)
        {
            throw new Exception($"SavePkm already exists in given box slot, box={saveBoxId}, slot={saveSlot}");
        }

        var pkmEntity = loaders.pkmLoader.GetEntity(pkmVersionEntity.PkmId)!;
        if (pkmEntity.SaveId != default)
        {
            throw new Exception($"PkmEntity already in save, id={pkmEntity.Id}, saveId={pkmEntity.SaveId}");
        }

        var pkmBytes = loaders.pkmFileLoader.GetEntity(pkmVersionEntity);
        var pkm = PKMLoader.CreatePKM(pkmBytes, pkmVersionEntity, pkmEntity);
        if (pkm == default)
        {
            throw new Exception($"PKM not defined, pkm-version={pkmVersionEntity.Id}");
        }

        var pkmSaveDTO = PkmSaveDTO.FromPkm(saveLoaders.Save, pkm, saveBoxId, saveSlot, loaders.pkmLoader, loaders.pkmVersionLoader);

        // enable national-dex in G3 if pkm outside of regional-dex
        if (saveLoaders.Save is SAV3 saveG3 && !saveG3.NationalDex)
        {
            var hoennDex = await PokeApi.GetPokedex(PokeApiPokedexEnum.HOENN);
            // Console.WriteLine(hoennDex.name);
            var isInDex = hoennDex.pokemon_entries.Any(entry =>
            {
                var url = entry.pokemon_species.url;
                var id = int.Parse(url.TrimEnd('/').Split('/')[^1]);

                return id == pkm.Species;
            });

            if (!isInDex)
            {
                saveG3.NationalDex = true;
            }
        }

        saveLoaders.Pkms.WriteEntity(pkmSaveDTO);

        pkmEntity.SaveId = saveLoaders.Save.ID32;
        loaders.pkmLoader.WriteEntity(pkmEntity);
    }
}
