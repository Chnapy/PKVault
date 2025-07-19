using PKHeX.Core;

public class DataMemoryLoader : DataLoader
{
    protected List<BoxEntity> boxEntities;
    protected List<PkmEntity> pkmEntities;
    protected List<PkmVersionEntity> pkmVersionEntities;
    protected List<PkmSaveDTO> savePkmList;

    public DataMemoryLoader(SaveFile? save) : base(save)
    {
        var jsonLoader = new DataFileLoader(save).GetUpdatedData();

        boxEntities = jsonLoader.boxLoader.GetAllEntities();
        pkmEntities = jsonLoader.pkmLoader.GetAllEntities();
        pkmVersionEntities = jsonLoader.pkmVersionLoader.GetAllEntities();

        savePkmList = new List<PkmSaveDTO>();

        if (save != default)
        {
            for (var i = 0; i < save.BoxCount; i++)
            {
                var pkms = save.GetBoxData(i).ToList();
                var j = 0;
                pkms.ForEach(pkm =>
                {
                    if (pkm.Species != 0)
                    {
                        var dto = PkmSaveDTO.FromPkm(save, pkm, i, j);
                        savePkmList.Add(dto);
                    }
                    j++;
                });
            }
        }

    }

    public override UpdatedData GetUpdatedData()
    {
        var boxLoader = new EntityMemoryLoader<BoxEntity>(
            boxEntities
        );

        var pkmLoader = new EntityMemoryLoader<PkmEntity>(
            pkmEntities
        );

        var pkmVersionLoader = new EntityMemoryLoader<PkmVersionEntity>(
            pkmVersionEntities
        );

        var savePkmLoader = new EntityMemoryLoader<PkmSaveDTO>(
            savePkmList
        );

        var storagePkmByPathsDict = new Dictionary<string, PKM>();

        savePkmList
        .ForEach(dto =>
        {
            var pkm = dto.Pkm;

            storagePkmByPathsDict.Add(
                $"pkm/{pkm.Generation}/{pkm.FileName}",
                pkm
            );
        });

        var storagePkmByPaths = (string path) =>
            {
                return storagePkmByPathsDict.GetValueOrDefault(path)!;
            };

        actions.ForEach(action =>
        {
            if (action is ListAction<PkmEntity> pkmAction)
            {
                pkmAction.Execute(pkmLoader);
            }
            else if (action is MovePkmSaveToStorageAction movePkmSaveStorAction)
            {
                if (save == default)
                {
                    throw new Exception("Save undefined");
                }

                movePkmSaveStorAction.Execute(
                    pkmLoader,
                    pkmVersionLoader,
                    savePkmLoader
                );
            }
            else if (action is MovePkmStorageToSaveAction movePkmStorSaveAction)
            {
                if (save == default)
                {
                    throw new Exception("Save undefined");
                }

                movePkmStorSaveAction.Execute(
                    save,
                    pkmLoader,
                    pkmVersionLoader,
                    savePkmLoader,
                    storagePkmByPaths
                );
            }
        });

        return new UpdatedData
        {
            boxLoader = boxLoader,
            pkmLoader = pkmLoader,
            pkmVersionLoader = pkmVersionLoader,
            storagePkmByPaths = storagePkmByPaths,
            pkmSaveLoader = savePkmLoader
        };
    }
}
