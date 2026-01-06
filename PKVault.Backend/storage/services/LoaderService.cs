public class LoaderService(
    // Direct use of service-provider because of circular dependencies
    IServiceProvider sp,
    StaticDataService staticDataService, SaveService saveService, PkmConvertService pkmConvertService
)
{
    private readonly SemaphoreSlim _setupLock = new(1, 1);
    private Task? SetupTask;
    private DataMemoryLoader? _memoryLoader;

    public async Task<DataMemoryLoader> GetLoader()
    {
        if (_memoryLoader != null)
            return _memoryLoader;

        await WaitForSetup();

        return _memoryLoader ?? throw new InvalidOperationException("Loader not initialized");
    }

    public async Task WaitForSetup()
    {
        await _setupLock.WaitAsync();
        try
        {
            SetupTask ??= Setup();
        }
        finally
        {
            _setupLock.Release();
        }

        await SetupTask;
    }

    private async Task Setup()
    {
        using var scope = sp.CreateScope();

        await staticDataService.GetStaticData();
        await scope.ServiceProvider.GetRequiredService<MaintenanceService>().DataSetupMigrateClean();
        try
        {
            saveService.ReadLocalSaves();
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine(ex);
        }
        _memoryLoader = await ResetDataLoader(true);
        await scope.ServiceProvider.GetRequiredService<WarningsService>().CheckWarnings();
    }

    public async Task<DataMemoryLoader> ResetDataLoader(bool checkSaveSynchro)
    {
        var logtime = LogUtil.Time($"Data-loader reset");

        using var scope = sp.CreateScope();
        _memoryLoader = DataMemoryLoader.Create(
            saveService,
            warningsService: scope.ServiceProvider.GetRequiredService<WarningsService>(),
            pkmConvertService
        );

        if (checkSaveSynchro)
        {
            await _memoryLoader.CheckSaveToSynchronize();
        }

        logtime();

        return _memoryLoader;
    }

    public List<DataActionPayload> GetActionPayloadList()
    {
        var actionPayloadList = new List<DataActionPayload>();
        _memoryLoader?.actions.ForEach(action => actionPayloadList.Add(action.payload));
        return actionPayloadList;
    }

    public bool HasEmptyActionList()
    {
        return _memoryLoader == null || _memoryLoader.actions.Count == 0;
    }
}
