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

    public static List<PkmVersionDTO> GetMainPkmVersions(string? pkmId)
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
            var pkmEntity = loaders.pkmLoader.GetEntity(entity.PkmId);

            var pkmBytes = loaders.pkmFileLoader.GetEntity(entity);
            if (pkmBytes == default)
            {
                throw new Exception($"PKM-bytes is null, from entity Id={entity.Id} Filepath={entity.Filepath}");
            }
            var pkm = PKMLoader.CreatePKM(pkmBytes, entity, pkmEntity);
            if (pkm == default)
            {
                throw new Exception($"PKM is null, from entity Id={entity.Id} Filepath={entity.Filepath} bytes.length={pkmBytes.Length}");
            }
            var dto = PkmVersionDTO.FromEntity(entity, pkm, pkmEntity);
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

    public static async Task MainMovePkm(string pkmId, uint boxId, uint boxSlot)
    {
        await memoryLoader.AddAction(
            new MainMovePkmAction(pkmId, boxId, boxSlot)
        );
    }

    public static async Task MainCreatePkmVersion(string pkmId, uint generation)
    {
        await memoryLoader.AddAction(
            new MainCreatePkmVersionAction(pkmId, generation)
        );
    }

    public static async Task SaveMovePkm(uint saveId, string pkmId, int boxId, int boxSlot)
    {
        await memoryLoader.AddAction(
            new SaveMovePkmAction(saveId, pkmId, boxId, boxSlot)
        );
    }

    public static async Task SaveMovePkmToStorage(uint saveId, string savePkmId, uint storageBoxId, uint storageSlot)
    {
        await memoryLoader.AddAction(
            new SaveMovePkmToStorageAction(
                saveId,
                savePkmId,
                storageBoxId,
                storageSlot
            )
        );
    }

    public static async Task SaveMovePkmFromStorage(uint saveId, string pkmVersionId, int saveBoxId, int saveSlot)
    {
        await memoryLoader.AddAction(
            new SaveMovePkmFromStorageAction(
                saveId,
                pkmVersionId,
                saveBoxId,
                saveSlot
            )
        );
    }

    public static async Task MainPkmDetachSave(string pkmId)
    {
        await memoryLoader.AddAction(
            new DetachPkmSaveAction(pkmId)
        );
    }

    public static async Task Save()
    {
        var actions = memoryLoader.actions;
        if (actions.Count == 0)
        {
            return;
        }

        Console.WriteLine("SAVING IN PROGRESS");

        var fileLoader = new DataFileLoader();

        for (var i = 0; i < actions.Count; i++)
        {
            await fileLoader.ApplyAction(actions[i]);
        }

        fileLoader.WriteSaves();

        ResetDataLoader();

        WarningsService.CheckWarnings();
    }

    public static List<DataActionPayload> GetActionPayloadList()
    {
        var actionPayloadList = new List<DataActionPayload>();
        memoryLoader.actions.ForEach(action => actionPayloadList.Add(action.GetPayload()));
        return actionPayloadList;
    }

    public static bool HasEmptyActionList()
    {
        return memoryLoader.actions.Count == 0;
    }

    public static void ResetDataLoader()
    {
        memoryLoader = new();
    }

    public static async Task RemoveDataActions(int actionIndexToRemoveFrom)
    {
        var previousActions = memoryLoader.actions;

        ResetDataLoader();

        for (var i = 0; i < previousActions.Count; i++)
        {
            if (actionIndexToRemoveFrom > i)
            {
                await memoryLoader.AddAction(previousActions[i]);
            }
        }
    }
}
