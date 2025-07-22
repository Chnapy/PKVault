using PKHeX.Core;

public class StorageService
{
    private static DataMemoryLoader memoryLoader = new();

    public static List<BoxDTO> GetMainBoxes()
    {
        var boxLoader = memoryLoader.loaders.boxLoader;
        var entities = boxLoader.GetAllEntities();

        var list = new List<BoxDTO>();
        entities.ForEach((entity) => list.Add(BoxDTO.FromEntity(entity)));

        return list;
    }

    public static List<PkmDTO> GetMainPkms()
    {
        var pkmLoader = memoryLoader.loaders.pkmLoader;
        var entities = pkmLoader.GetAllEntities();

        var list = new List<PkmDTO>();
        entities.ForEach((entity) => list.Add(PkmDTO.FromEntity(entity)));

        return list;
    }

    public static List<PkmVersionDTO> GetMainPkmVersions(uint? pkmId)
    {
        var loaders = memoryLoader.loaders;
        var entities = loaders.pkmVersionLoader.GetAllEntities();

        if (pkmId != null)
        {
            entities = entities.FindAll(pkmVersion => pkmVersion.PkmId == pkmId);
        }

        var list = new List<PkmVersionDTO>();
        entities.ForEach((entity) =>
        {
            var pkm = loaders.pkmFileLoader.GetEntity(entity);
            if (pkm == default)
            {
                throw new Exception($"PKM is null, from entity Id={entity.Id} Filepath={entity.Filepath}");
            }
            var dto = PkmVersionDTO.FromEntity(entity, pkm);
            list.Add(dto);
        });

        return list;
    }

    public static List<BoxDTO> GetSaveBoxes(uint saveId)
    {
        return memoryLoader.loaders.getSaveLoaders(saveId).Boxes.GetAllEntities();
    }

    public static List<PkmSaveDTO> GetSavePkms(uint saveId)
    {
        return memoryLoader.loaders.getSaveLoaders(saveId).Pkms.GetAllEntities();
    }

    public static void MainMovePkm(long pkmId, uint boxId, uint boxSlot)
    {
        memoryLoader.AddAction(
            new MainMovePkmAction(pkmId, boxId, boxSlot)
        );
    }

    public static void MainCreatePkmVersion(long pkmId, uint generation)
    {
        memoryLoader.AddAction(
            new MainCreatePkmVersionAction(pkmId, generation)
        );
    }

    public static void SaveMovePkm(uint saveId, long pkmId, int boxId, int boxSlot)
    {
        memoryLoader.AddAction(
            new SaveMovePkmAction(saveId, pkmId, boxId, boxSlot)
        );
    }

    public static void SaveMovePkmToStorage(uint saveId, long savePkmId, uint storageBoxId, uint storageSlot)
    {
        memoryLoader.AddAction(
            new SaveMovePkmToStorageAction(
                saveId,
                savePkmId,
                storageBoxId,
                storageSlot
            )
        );
    }

    public static void SaveMovePkmFromStorage(uint saveId, long pkmVersionId, int saveBoxId, int saveSlot)
    {
        memoryLoader.AddAction(
            new SaveMovePkmFromStorageAction(
                saveId,
                pkmVersionId,
                saveBoxId,
                saveSlot
            )
        );
    }

    public static void Save()
    {
        var actions = memoryLoader.actions;
        if (actions.Count == 0)
        {
            return;
        }

        Console.WriteLine("SAVING IN PROGRESS");

        var fileLoader = new DataFileLoader();

        actions.ForEach(fileLoader.ApplyAction);

        fileLoader.WriteSaves();

        memoryLoader = new DataMemoryLoader();
    }
}
