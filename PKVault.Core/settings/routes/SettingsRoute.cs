
namespace PKVault.Core.settings.routes;

[Route("api/[controller]")]
public class SettingsController(DataService dataService, ISettingsService settingsService, IFileIOService fileIOService, ISessionService sessionService)
{
    [HttpGet]
    public async Task<SettingsDTO> Get()
    {
        return await settingsService.GetSettingsWithUserId();
    }

    [HttpGet("test-save-globs")]
    public List<string> GetSaveGlobsResults(string[] globs, int limit)
    {
        var results = fileIOService.Matcher.SearchPaths(globs);

        if (results.Count > limit)
        {
            throw new ArgumentException($"Too much results ({results.Count}) for given globs");
        }

        return results;
    }

    [HttpGet("directory-ls")]
    public DirectoryContent GetDirectoryLs(string directoryPath)
    {
        return DirectoryUtil.Ls(directoryPath);
    }

    [HttpPost]
    public async Task<DataDTO> Edit(SettingsMutableDTO settingsMutable)
    {
        settingsMutable = settingsMutable with
        {
            SAVE_GLOBS = [.. settingsMutable.SAVE_GLOBS.Select(glob => glob.Trim())],
            PKM_EXTERNAL_GLOBS = [.. (settingsMutable.PKM_EXTERNAL_GLOBS ?? []).Select(glob => glob.Trim())],
        };

        DataUpdateFlags flags = new();

        var (RestartSession, ScanSaves) = settingsService.GetUpdateDiff(settingsMutable, flags);

        if ((RestartSession || ScanSaves) && !sessionService.HasEmptyActionList())
        {
            throw new InvalidOperationException($"Empty action list is required");
        }

        if (!SettingsService.AllowedLanguages.Contains(settingsMutable.LANGUAGE))
        {
            throw new ArgumentException($"Language value not allowed: {settingsMutable.LANGUAGE}");
        }

        await settingsService.UpdateSettings(settingsMutable, RestartSession, ScanSaves, flags);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }
}
