public abstract class DataAction
{
    public DataActionPayload payload;
    // public abstract DataActionPayload GetPayload();

    protected abstract Task<DataActionPayload> Execute(DataEntityLoaders loaders, DataUpdateFlags flags);

    public async Task ExecuteWithPayload(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        payload = await Execute(loaders, flags);
    }
}

public struct DataActionPayload
{
    public DataActionType type { get; set; }
    public object?[] parameters { get; set; }
}

public enum DataActionType
{
    MAIN_CREATE_BANK,
    MAIN_UPDATE_BANK,
    MAIN_DELETE_BANK,
    MAIN_CREATE_BOX,
    MAIN_UPDATE_BOX,
    MAIN_DELETE_BOX,
    MAIN_CREATE_PKM_VERSION,
    MOVE_PKM,
    DETACH_PKM_SAVE,
    DELETE_PKM_VERSION,
    EDIT_PKM_VERSION,
    EDIT_PKM_SAVE,
    SAVE_DELETE_PKM,
    PKM_SYNCHRONIZE,
    EVOLVE_PKM,
    SORT_PKM,
    DEX_SYNC,
}
