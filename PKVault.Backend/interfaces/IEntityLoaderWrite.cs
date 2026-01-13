public interface IEntityLoaderWrite
{
    public string FilePath { get; }
    public bool HasWritten { get; }

    public byte[] SerializeToUtf8Bytes();

    public void SetFlags(DataUpdateFlagsState<string> _flags);

    public Task WriteToFile();
}
