public class DataActionException(Exception _ex, DataUpdateFlags _flags) : Exception(_ex.Message)
{
    public readonly Exception ex = _ex;
    public readonly DataUpdateFlags flags = _flags;
}
