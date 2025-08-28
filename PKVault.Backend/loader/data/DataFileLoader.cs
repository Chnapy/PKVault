using System.Diagnostics;
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

        var dbDir = SettingsService.AppSettings.DB_PATH;

        var boxLoader = new EntityJSONLoader<BoxDTO, BoxEntity>(
            filePath: Path.Combine(dbDir, "box.json"),
            entityToDto: async entity =>
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
            entityToDto: async entity => PkmDTO.FromEntity(entity),
            dtoToEntity: dto => dto.PkmEntity
        );

        PKM getPkmVersionEntityPkm(PkmVersionEntity entity)
        {
            var pkmBytes = pkmFileLoader.GetEntity(entity.Filepath);
            if (pkmBytes == default)
            {
                throw new Exception($"PKM-bytes is null, from entity Id={entity.Id} Filepath={entity.Filepath}");
            }
            var pkm = PKMLoader.CreatePKM(pkmBytes, entity);
            if (pkm == default)
            {
                throw new Exception($"PKM is null, from entity Id={entity.Id} Filepath={entity.Filepath} bytes.length={pkmBytes.Length}");
            }

            return pkm;
        }

        var pkmVersionLoader = new EntityJSONLoader<PkmVersionDTO, PkmVersionEntity>(
           filePath: Path.Combine(dbDir, "pkm-version.json"),
            entityToDto: async entity =>
            {
                var pkmDto = await pkmLoader.GetDto(entity.PkmId);
                var pkm = getPkmVersionEntityPkm(entity);

                return await PkmVersionDTO.FromEntity(entity, pkm, pkmDto);
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

        Console.WriteLine($"File-loader save-loaders loading");

        Stopwatch sw = new();
        sw.Start();

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

        sw.Stop();

        Console.WriteLine($"File-loader save-loaders loading finished in {sw.Elapsed}");

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
        foreach (var saveLoaders in loaders.saveLoadersDict.Values.ToList())
        {
            if (saveLoaders.Pkms.HasWritten || saveLoaders.Boxes.HasWritten)
            {
                LocalSaveService.WriteSave(saveLoaders.Save);
            }
        }
    }
}