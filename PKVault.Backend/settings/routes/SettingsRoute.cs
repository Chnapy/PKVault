using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace PKVault.Backend.settings.routes;

[ApiController]
[Route("api/[controller]")]
public class SettingsController(DataService dataService, ISettingsService settingsService, ActionService actionService) : ControllerBase
{
    [HttpGet]
    public ActionResult<SettingsDTO> Get()
    {
        return settingsService.GetSettings();
    }

    [HttpGet("test-save-globs")]
    public ActionResult<List<string>> GetSaveGlobsResults([FromQuery] string[] globs)
    {
        var results = MatcherUtil.SearchPaths(globs);

        if (results.Count > 200)
        {
            throw new ArgumentException($"Too much results ({results.Count}) for given globs");
        }

        return results;
    }

    [HttpPost]
    public async Task<ActionResult<DataDTO>> Edit([BindRequired] SettingsMutableDTO settingsMutable)
    {
        var currentSettings = settingsService.GetSettings();
        if (!actionService.HasEmptyActionList() && currentSettings.SettingsMutable.LANGUAGE != null)
        {
            throw new InvalidOperationException($"Empty action list is required");
        }

        if (settingsMutable.LANGUAGE == null || !SettingsService.AllowedLanguages.Contains(settingsMutable.LANGUAGE))
        {
            throw new ArgumentException($"Language value not allowed: {settingsMutable.LANGUAGE}");
        }

        var languageChanged = currentSettings.SettingsMutable.LANGUAGE != settingsMutable.LANGUAGE;

        settingsMutable = settingsMutable with
        {
            SAVE_GLOBS = [.. settingsMutable.SAVE_GLOBS.Select(glob => glob.Trim())]
        };
        await settingsService.UpdateSettings(settingsMutable);

        return await dataService.CreateDataFromUpdateFlags(new()
        {
            StaticData = languageChanged,
            MainBanks = new() { All = true },
            MainBoxes = new() { All = true },
            MainPkmVersions = new() { All = true },
            Saves = new() { All = true },
            Dex = true,
            SaveInfos = true,
            Backups = true,
            Settings = true,
            Warnings = true,
        });
    }
}
