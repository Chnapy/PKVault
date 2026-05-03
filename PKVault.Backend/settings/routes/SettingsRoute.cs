using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace PKVault.Backend.settings.routes;

[ApiController]
[Route("api/[controller]")]
public class SettingsController(DataService dataService, ISettingsService settingsService, IFileIOService fileIOService, ISessionService sessionService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<SettingsDTO>> Get()
    {
        return await settingsService.GetSettingsWithUserId();
    }

    [HttpGet("test-save-globs")]
    public ActionResult<List<string>> GetSaveGlobsResults([FromQuery] string[] globs, int limit)
    {
        var results = fileIOService.Matcher.SearchPaths(globs);

        if (results.Count > limit)
        {
            throw new ArgumentException($"Too much results ({results.Count}) for given globs");
        }

        return results;
    }

    [HttpPost]
    public async Task<ActionResult<DataDTO>> Edit([BindRequired] SettingsMutableDTO settingsMutable)
    {
        settingsMutable = settingsMutable with
        {
            SAVE_GLOBS = [.. settingsMutable.SAVE_GLOBS.Select(glob => glob.Trim())],
            PKM_EXTERNAL_GLOBS = [.. (settingsMutable.PKM_EXTERNAL_GLOBS ?? []).Select(glob => glob.Trim())],
        };

        DataUpdateFlags flags = new();

        var (RestartSession, PersistSession) = settingsService.GetUpdateDiff(settingsMutable, flags);

        if (RestartSession && !sessionService.HasEmptyActionList())
        {
            throw new InvalidOperationException($"Empty action list is required");
        }

        if (settingsMutable.LANGUAGE == null || !SettingsService.AllowedLanguages.Contains(settingsMutable.LANGUAGE))
        {
            throw new ArgumentException($"Language value not allowed: {settingsMutable.LANGUAGE}");
        }

        await settingsService.UpdateSettings(settingsMutable, RestartSession, PersistSession, flags);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }
}
