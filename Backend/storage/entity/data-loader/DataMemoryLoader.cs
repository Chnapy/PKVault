using PKHeX.Core;

public class DataMemoryLoader : DataLoader
{
    protected List<BoxEntity> boxEntities;
    protected List<PkmEntity> pkmEntities;
    protected List<PkmVersionEntity> pkmVersionEntities;
    protected Dictionary<uint, List<PkmSaveDTO>> savePkmListDict;

    public DataMemoryLoader()
    {
        var jsonLoader = new DataFileLoader().GetUpdatedData();

        boxEntities = jsonLoader.boxLoader.GetAllEntities();
        pkmEntities = jsonLoader.pkmLoader.GetAllEntities();
        pkmVersionEntities = jsonLoader.pkmVersionLoader.GetAllEntities();

        savePkmListDict = new();
    }

    // public new SaveFile LoadSave(uint saveId)
    // {
    //     var save = base.LoadSave(saveId);

    //     if (savePkmListDict.TryGetValue(saveId, out _))
    //     {
    //         return save;
    //     }

    //     var list = new List<PkmSaveDTO>();

    //     for (var i = 0; i < save.BoxCount; i++)
    //     {
    //         var pkms = save.GetBoxData(i).ToList();
    //         var j = 0;
    //         pkms.ForEach(pkm =>
    //         {
    //             if (pkm.Species != 0)
    //             {
    //                 var dto = PkmSaveDTO.FromPkm(save, pkm, i, j);
    //                 list.Add(dto);
    //             }
    //             j++;
    //         });
    //     }

    //     savePkmListDict.Add(saveId, list);

    //     return save;
    // }

    public override UpdatedData GetUpdatedData()
    {

        // load all required saves
        actions.ForEach(action =>
        {
            if (action is IWithSaveId actionWithSaveId)
            {
                LoadSave(actionWithSaveId.saveId);
            }
        });

        var boxLoader = new EntityMemoryLoader<BoxEntity>(
            boxEntities
        );

        var pkmLoader = new EntityMemoryLoader<PkmEntity>(
            pkmEntities
        );

        var pkmVersionLoader = new EntityMemoryLoader<PkmVersionEntity>(
            pkmVersionEntities
        );

        var saveLoaderDict = new Dictionary<uint, SaveLoaders>();

        saveDict.Keys.ToList().ForEach(saveId =>
        {
            var save = saveDict.GetValueOrDefault(saveId)!;

            var boxesNames = BoxUtil.GetBoxNames(save).ToList();

            var boxes = new List<BoxDTO>();
            for (int i = 0; i < boxesNames.Count; i++)
            {
                boxes.Add(new BoxDTO
                {
                    Id = i,
                    Name = boxesNames[i]
                });
            }

            var pkmList = new List<PkmSaveDTO>();

            for (var i = 0; i < save.BoxCount; i++)
            {
                var pkms = save.GetBoxData(i).ToList();
                var j = 0;
                pkms.ForEach(pkm =>
                {
                    if (pkm.Species != 0)
                    {
                        var dto = PkmSaveDTO.FromPkm(save, pkm, i, j);
                        pkmList.Add(dto);
                    }
                    j++;
                });
            }

            saveLoaderDict.Add(saveId, new SaveLoaders
            {
                Boxes = new EntityMemoryLoader<BoxDTO>(boxes),
                Pkms = new EntityMemoryLoader<PkmSaveDTO>(pkmList)
            });
        });

        var getSaveLoaders = (uint saveId) =>
        {
            if (saveLoaderDict.TryGetValue(saveId, out var saveLoaders))
            {
                return saveLoaders;
            }

            throw new Exception("Save not found, id=" + saveId);
        };

        var pkmFileLoader = new PKMMemoryLoader();

        // var storagePkmByPathsDict = new Dictionary<string, PKM>();

        pkmVersionEntities
        .ForEach(entity =>
        {
            var bytes = File.ReadAllBytes(entity.Filepath);

            // TODO fill switch cases
            PKM? pkm = entity.Generation switch
            {
                1 => new PK1(bytes),
                2 => new PK2(bytes),
                4 => new PK4(bytes),
                _ => null
            };

            if (pkm == default)
            {
                throw new Exception($"PKM is null, Gen={entity.Generation} Filepath={entity.Filepath}");
            }

            pkmFileLoader.WriteEntity(pkm, entity.Filepath);

            // storagePkmByPathsDict.Add(
            //     entity.Filepath,
            //     pkm
            // );
        });

        // savePkmList
        // .ForEach(dto =>
        // {
        //     var pkm = dto.Pkm;

        //     storagePkmByPathsDict.Add(
        //                 $"pkm/{pkm.Generation}/{pkm.FileName}",
        //                 pkm
        //             );
        // });

        // var storagePkmByPaths = (string path) =>
        //     {
        //         return storagePkmByPathsDict.GetValueOrDefault(path)!;
        //     };

        // var getSavePkmLoader = (uint saveId) =>
        // {
        //     return new EntityMemoryLoader<PkmSaveDTO>(
        //             savePkmListDict.GetValueOrDefault(saveId)!
        //         );
        // };

        actions.ForEach(action =>
        {
            if (action is MainMovePkmAction mainMovePkmAction)
            {
                mainMovePkmAction.Execute(pkmLoader);
            }
            else if (action is SaveMovePkmAction saveMovePkmAction)
            {
                var saveLoader = getSaveLoaders(saveMovePkmAction.saveId);

                saveMovePkmAction.Execute(saveLoader);
            }
            else if (action is SaveMovePkmToStorageAction movePkmSaveStorAction)
            {
                var savePkmLoader = getSaveLoaders(movePkmSaveStorAction.saveId).Pkms;

                movePkmSaveStorAction.Execute(
                    pkmLoader,
                    pkmVersionLoader,
                    pkmFileLoader,
                    savePkmLoader
                );
            }
            else if (action is SaveMovePkmFromStorageAction movePkmStorSaveAction)
            {
                var save = LoadSave(movePkmStorSaveAction.saveId);

                var savePkmLoader = getSaveLoaders(movePkmStorSaveAction.saveId).Pkms;

                movePkmStorSaveAction.Execute(
                    save,
                    pkmLoader,
                    pkmVersionLoader,
                    pkmFileLoader,
                    savePkmLoader
                );
            }
        });

        return new UpdatedData
        {
            boxLoader = boxLoader,
            pkmLoader = pkmLoader,
            pkmVersionLoader = pkmVersionLoader,
            pkmFileLoader = pkmFileLoader,
            getSaveLoaders = getSaveLoaders
        };
    }
}

