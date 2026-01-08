public interface IEntityLoaderWrite
{
    public string FilePath { get; }
    public bool HasWritten { get; }

    public byte[] SerializeToUtf8Bytes();

    public void SetFlags(DataUpdateFlagsState<string> _flags);

    public Task WriteToFile();

    public void SetupInitialData(DataEntityLoaders loaders);

    public void MigrateGlobalEntities(DataEntityLoaders loaders);

    public void CleanData(DataEntityLoaders loaders);
}
