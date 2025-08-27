using System.Diagnostics;
using PKHeX.Core;

public class DataFileLoader : DataLoader
{
    // TOTO most of these loads are way too slow
    // Data (pkm & box) should be stored in json-files then loaded sync
    public static async Task<DataFileLoader> Create()
    {
        var pkmFileLoader = new PKMFileLoader();

        var saveDict = new Dictionary<uint, SaveFile>();
        LocalSaveService.SaveById.Values.ToList().ForEach((save) =>
        {
            saveDict.Add(save.ID32, save.Clone());
        });

        var dbDir = SettingsService.AppSettings.DB_PATH;

        var boxLoader = await EntityJSONLoader<BoxDTO, BoxEntity>.Create(
            filePath: Path.Combine(dbDir, "box.json"),
            entityToDto: async (BoxEntity entity) =>
            {
                return new BoxDTO
                {
                    Type = BoxType.Default,
                    BoxEntity = entity,
                };
            },
            dtoToEntity: dto => dto.BoxEntity
        );
        var boxes = boxLoader.GetAllDtos();
        if (boxes.Count == 0)
        {
            await boxLoader.WriteDto(new BoxDTO
            {
                Type = BoxType.Default,
                BoxEntity = new()
                {
                    Id = "0",
                    Name = "Box 1"
                }
            });
        }

        var pkmLoader = await EntityJSONLoader<PkmDTO, PkmEntity>.Create(
           filePath: Path.Combine(dbDir, "pkm.json"),
            entityToDto: async (PkmEntity entity) => PkmDTO.FromEntity(entity),
            dtoToEntity: dto => dto.PkmEntity
        );

        var pkmVersionLoader = await EntityJSONLoader<PkmVersionDTO, PkmVersionEntity>.Create(
           filePath: Path.Combine(dbDir, "pkm-version.json"),
            entityToDto: async (PkmVersionEntity entity) =>
            {
                var pkmDto = pkmLoader.GetDto(entity.PkmId);

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

                return await PkmVersionDTO.FromEntity(entity, pkm, pkmDto);
            },
            dtoToEntity: dto => dto.PkmVersionEntity
        );
        pkmVersionLoader.OnWrite = (dto) =>
        {
            var pkm = dto.Pkm;
            pkmFileLoader.WriteEntity(
                PKMLoader.GetPKMBytes(pkm), pkm, dto.PkmVersionEntity.Filepath
            );
        };
        pkmVersionLoader.OnDelete = (dto) =>
        {
            pkmFileLoader.DeleteEntity(dto.PkmVersionEntity.Filepath);
        };

        Console.WriteLine($"File-loader save-loaders loading");

        Stopwatch sw = new();
        sw.Start();

        var saveLoadersDict = new Dictionary<uint, SaveLoaders>();
        await Task.WhenAll(
                saveDict.Values.ToList().Select(async (save) =>
                {
                    saveLoadersDict.Add(save.ID32, new()
                    {
                        Save = save,
                        Boxes = new SaveBoxLoader(save),
                        Pkms = await SavePkmLoader.Create(save, pkmLoader, pkmVersionLoader)
                    });
                })
        );

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

    public async Task WriteSaves()
    {
        foreach (var saveLoaders in loaders.saveLoadersDict.Values.ToList())
        {
            if (saveLoaders.Pkms.HasWritten || saveLoaders.Boxes.HasWritten)
            {
                await LocalSaveService.WriteSave(saveLoaders.Save);
            }
        }
    }
}