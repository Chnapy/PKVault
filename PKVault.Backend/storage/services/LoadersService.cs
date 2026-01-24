using Microsoft.EntityFrameworkCore;

public interface ILoadersService
{
    public Task<DataEntityLoaders> GetLoaders();
    public Task<DataEntityLoaders> CreateLoaders();
    // public List<DataActionPayload> GetActionPayloadList();
    // public bool HasEmptyActionList();
    // public Task<DataUpdateFlags> AddAction(DataAction action, DataUpdateFlags? flags);
    public void InvalidateLoaders((bool maintainData, bool checkSaves) flags);
    public Task EnsureInitialized();
}

/**
 * Handles data loaders for current session.
 */
public class LoadersService : ILoadersService
{
    private IServiceProvider sp;
    private readonly ISaveService saveService;
    private readonly PkmConvertService pkmConvertService;
    private readonly ISettingsService settingsService;
    private readonly StaticDataService staticDataService;
    private readonly SessionService sessionService;

    private readonly Locker<(bool maintainData, bool checkSaves), DataEntityLoaders> loadersLocker;

    public LoadersService(
        IServiceProvider _sp,
        ISaveService _saveService, PkmConvertService _pkmConvertService,
        ISettingsService _settingsService, StaticDataService _staticDataService, SessionService _sessionService
    )
    {
        sp = _sp;
        saveService = _saveService;
        pkmConvertService = _pkmConvertService;
        settingsService = _settingsService;
        staticDataService = _staticDataService;
        sessionService = _sessionService;

        loadersLocker = new("Loaders", (maintainData: true, checkSaves: true), ResetLoaders);
    }

    public async Task<DataEntityLoaders> GetLoaders()
    {
        return await loadersLocker.GetValue();
    }

    private async Task<DataEntityLoaders> ResetLoaders((bool maintainData, bool checkSaves) flags)
    {
        var loaders = await CreateLoaders();

        await sessionService.StartNewSession();

        if (flags.maintainData)
        {
            var actionService = sp.GetRequiredService<ActionService>();
            await actionService.DataNormalize(loaders);
        }

        if (flags.checkSaves)
            await CheckSaveToSynchronize(loaders);

        return loaders;
    }

    public async Task<DataEntityLoaders> CreateLoaders()
    {
        var staticData = await staticDataService.GetStaticData();
        var settings = settingsService.GetSettings();

        return await DataEntityLoaders.Create(
            sp, saveService, settings, pkmConvertService, staticData.Evolves
        );
    }

    private async Task CheckSaveToSynchronize(DataEntityLoaders loaders)
    {
        using var scope = sp.CreateScope();

        var actionService = scope.ServiceProvider.GetRequiredService<ActionService>();
        var synchronizePkmAction = scope.ServiceProvider.GetRequiredService<SynchronizePkmAction>();

        var synchronizationData = await synchronizePkmAction.GetSavesPkmsToSynchronize(loaders);

        foreach (var data in synchronizationData)
        {
            if (data.pkmVersionAndPkmSaveIds.Length > 0)
            {
                await actionService.SynchronizePkm(data);
            }
        }
    }

    public void InvalidateLoaders((bool maintainData, bool checkSaves) flags)
    {
        // sp.GetRequiredService<SessionService>()
        //     .StartNewSession();

        loadersLocker.Invalidate(flags);
    }

    public async Task EnsureInitialized()
    {
        await loadersLocker.GetValue();
    }
}
