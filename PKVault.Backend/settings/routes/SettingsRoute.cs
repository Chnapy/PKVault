using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace PKVault.Backend.settings.routes;

[ApiController]
[Route("api/[controller]")]
public class SettingsController(DataService dataService, ISettingsService settingsService, ISessionService sessionService, IBankLoader bankLoader) : ControllerBase
{
    private static Task? initialSessionTask = null;

    [HttpGet]
    public async Task<ActionResult<SettingsDTO>> Get()
    {
        // workaround to avoid rare first-run app crash after language selection
        // trigger DB use, with DB creation, migration etc
        initialSessionTask ??= bankLoader.Any();
        // then wait for DB setup end before continue onboard process
        await initialSessionTask;

        return settingsService.GetSettings();
    }

    [HttpGet("test-save-globs")]
    public ActionResult<List<string>> GetSaveGlobsResults([FromQuery] string[] globs, int limit)
    {
        var results = MatcherUtil.SearchPaths(globs);

        if (results.Count > limit)
        {
            throw new ArgumentException($"Too much results ({results.Count}) for given globs");
        }

        return results;
    }

    [HttpPost]
    public async Task<ActionResult<DataDTO>> Edit([BindRequired] SettingsMutableDTO settingsMutable)
    {
        var currentSettings = settingsService.GetSettings();
        if (!sessionService.HasEmptyActionList() && currentSettings.SettingsMutable.LANGUAGE != null)
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

        var flags = await settingsService.UpdateSettings(settingsMutable);
        flags ??= new();

        flags.StaticData = languageChanged;
        flags.MainBanks.All = true;
        flags.MainBoxes.All = true;
        flags.MainPkmVariants.All = true;
        flags.Dex.All = true;
        flags.Saves.All = true;
        flags.SaveInfos = true;
        flags.Backups = true;
        flags.Settings = true;
        flags.Warnings = true;

        return await dataService.CreateDataFromUpdateFlags(flags);
    }
}
