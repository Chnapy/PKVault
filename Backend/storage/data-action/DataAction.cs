using PKHeX.Core;

public abstract class DataAction
{
    public abstract DataActionPayload GetPayload();

    public abstract Task Execute(DataEntityLoaders loaders);
}

public struct DataActionPayload
{
    public DataActionType type { get; set; }
    public object[] parameters { get; set; }
}

public enum DataActionType
{
    MAIN_CREATE_PKM_VERSION,
    MAIN_MOVE_PKM,
    SAVE_MOVE_PKM,
    SAVE_MOVE_PKM_FROM_STORAGE,
    SAVE_MOVE_PKM_TO_STORAGE,
    DETACH_PKM_SAVE,
    DELETE_PKM_VERSION,
    EDIT_PKM_VERSION,
    EDIT_PKM_SAVE,
    SAVE_DELETE_PKM,
    PKM_SYNCHRONIZE,
}
