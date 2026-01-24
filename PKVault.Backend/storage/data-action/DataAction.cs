public abstract class DataAction<I>
{
    protected abstract Task<DataActionPayload> Execute(I input, DataUpdateFlags flags);

    public async Task<DataActionPayload> ExecuteWithPayload(I input, DataUpdateFlags flags)
    {
        return await Execute(input, flags);
    }
}

public record DataActionPayload(
    DataActionType type,
    object?[] parameters
);

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
