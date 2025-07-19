using PKHeX.Core;

public class DataFileLoader : DataLoader
{
    public DataFileLoader(SaveFile? save) : base(save)
    {
        // boxLoader = new EntityJSONLoader<BoxEntity>("db/box.json");
        // pkmLoader = new EntityJSONLoader<PkmEntity>("db/pkm.json");
        // pkmVersionLoader = new EntityJSONLoader<PkmVersionEntity>("db/pkm-version.json");

        // var savePkmList = new List<PkmSaveDTO>();

        // if (save != default)
        // {
        //     for (var i = 0; i < save.BoxCount; i++)
        //     {
        //         var pkms = save.GetBoxData(i).ToList();
        //         var j = 0;
        //         pkms.ForEach(pkm =>
        //         {
        //             if (pkm.Species != 0)
        //             {
        //                 var dto = PkmSaveDTO.FromPkm(save, pkm, i, j);
        //                 savePkmList.Add(dto);
        //             }
        //             j++;
        //         });
        //     }
        // }

        // savePkmLoader = new EntityMemoryLoader<PkmSaveDTO>(
        //     savePkmList
        // );
    }

    public override UpdatedData GetUpdatedData()
    {
        var boxLoader = new EntityJSONLoader<BoxEntity>("db/box.json");
        var pkmLoader = new EntityJSONLoader<PkmEntity>("db/pkm.json");
        var pkmVersionLoader = new EntityJSONLoader<PkmVersionEntity>("db/pkm-version.json");

        var savePkmList = new List<PkmSaveDTO>();

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

        var pkmSaveLoader = new EntityMemoryLoader<PkmSaveDTO>(
            savePkmList
        );

        return new UpdatedData
        {
            boxLoader = boxLoader,
            pkmLoader = pkmLoader,
            pkmVersionLoader = pkmVersionLoader,
            storagePkmByPaths = (string path) =>
            {
                byte[] data = File.ReadAllBytes(path);
                return EntityFormat.GetFromBytes(data)!;
            },
            pkmSaveLoader = pkmSaveLoader,
        };
    }
}