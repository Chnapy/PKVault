using PKHeX.Core;

public class DataFileLoader : DataLoader
{
    // TOTO most of these loads are way too slow
    // Data (pkm & box) should be stored in json-files then loaded sync
    public static DataFileLoader Create()
    {
        var pkmFileLoader = new PKMFileLoader();

        var saveDict = new Dictionary<uint, SaveFile>();
        LocalSaveService.SaveById.Values.ToList().ForEach((save) =>
        {
            saveDict.Add(save.ID32, save.Clone());
        });

        var dbDir = SettingsService.AppSettings.SettingsMutable.DB_PATH;

        var boxLoader = new EntityJSONLoader<BoxDTO, BoxEntity>(
            filePath: Path.Combine(dbDir, "box.json"),
            entityToDto: entity =>
            {
                return new BoxDTO
                {
                    Type = BoxType.Default,
                    BoxEntity = entity,
                };
            },
            dtoToEntity: dto => dto.BoxEntity
        );
        if (boxLoader.GetAllEntities().Count == 0)
        {
            boxLoader.WriteDto(new()
            {
                Type = BoxType.Default,
                BoxEntity = new()
                {
                    Id = "0",
                    Name = "Box 1"
                }
            });
        }

        var pkmLoader = new EntityJSONLoader<PkmDTO, PkmEntity>(
           filePath: Path.Combine(dbDir, "pkm.json"),
            entityToDto: PkmDTO.FromEntity,
            dtoToEntity: dto => dto.PkmEntity
        );

        PKM getPkmVersionEntityPkm(PkmVersionEntity entity)
        {
            var pkmBytes = pkmFileLoader.GetEntity(entity.Filepath);
            var pkm = PKMLoader.CreatePKM(pkmBytes, entity);
            if (pkm == default)
            {
                throw new Exception($"PKM is null, from entity Id={entity.Id} Filepath={entity.Filepath} bytes.length={pkmBytes.Length}");
            }

            return pkm;
        }

        var pkmVersionLoader = new EntityJSONLoader<PkmVersionDTO, PkmVersionEntity>(
           filePath: Path.Combine(dbDir, "pkm-version.json"),
            entityToDto: entity =>
            {
                var pkmDto = pkmLoader.GetDto(entity.PkmId);
                var pkm = getPkmVersionEntityPkm(entity);

                return PkmVersionDTO.FromEntity(entity, pkm, pkmDto!);
            },
            dtoToEntity: dto => dto.PkmVersionEntity
        )
        {
            OnWrite = (dto) =>
            {
                var pkm = dto.Pkm;
                pkmFileLoader.WriteEntity(
                    PKMLoader.GetPKMBytes(pkm), pkm, dto.PkmVersionEntity.Filepath
                );
            },
            OnDelete = (entity) =>
            {
                pkmFileLoader.DeleteEntity(entity.Filepath);
            }
        };

        var saveLoadersDict = new Dictionary<uint, SaveLoaders>();
        saveDict.Values.ToList().ForEach((save) =>
        {
            saveLoadersDict.Add(save.ID32, new()
            {
                Save = save,
                Boxes = new SaveBoxLoader(save),
                Pkms = new SavePkmLoader(save, pkmLoader, pkmVersionLoader)
            });
        });

        var loaders = new DataEntityLoaders
        {
            boxLoader = boxLoader,
            pkmLoader = pkmLoader,
            pkmVersionLoader = pkmVersionLoader,
            saveLoadersDict = saveLoadersDict,
        };

        return new DataFileLoader(loaders);
    }

    private DataFileLoader(DataEntityLoaders _loaders) : base(_loaders)
    {
    }

    public void WriteSaves()
    {
        loaders.boxLoader.WriteToFile();
        loaders.pkmLoader.WriteToFile();
        loaders.pkmVersionLoader.WriteToFile();

        foreach (var saveLoaders in loaders.saveLoadersDict.Values.ToList())
        {
            if (saveLoaders.Pkms.HasWritten || saveLoaders.Boxes.HasWritten)
            {
                LocalSaveService.WriteSave(saveLoaders.Save);
            }
        }
    }
}