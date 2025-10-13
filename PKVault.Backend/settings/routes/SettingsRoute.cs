using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace PKVault.Backend.settings.routes;

[ApiController]
[Route("api/[controller]")]
public class SettingsController : ControllerBase
{
    [HttpGet]
    public ActionResult<SettingsDTO> Get()
    {
        return SettingsService.AppSettings;
    }

    [HttpGet("test-save-globs")]
    public ActionResult<List<string>> GetSaveGlobsResults([FromQuery] string[] globs)
    {
        return MatcherUtil.SearchPaths(globs);
    }

    [HttpPost]
    public async Task<ActionResult<DataDTO>> Edit([BindRequired] SettingsMutableDTO settingsMutable)
    {
        if (!StorageService.HasEmptyActionList())
        {
            throw new InvalidOperationException($"Empty action list is required");
        }

        if (settingsMutable.LANGUAGE == null || !SettingsDTO.AllowedLanguages.Contains(settingsMutable.LANGUAGE))
        {
            throw new ArgumentException($"Language value not allowed: {settingsMutable.LANGUAGE}");
        }

        var languageChanged = SettingsService.AppSettings.SettingsMutable.LANGUAGE != settingsMutable.LANGUAGE;

        settingsMutable.SAVE_GLOBS = [.. settingsMutable.SAVE_GLOBS.Select(glob => glob.Trim())];
        await SettingsService.UpdateSettings(settingsMutable);

        return await DataDTO.FromDataUpdateFlags(new()
        {
            StaticData = languageChanged,
            MainBoxes = true,
            MainPkms = true,
            MainPkmVersions = true,
            Saves = [
                new (){
                    SaveId = 0
                }
            ],
            Dex = true,
            // Actions = true,
            // Warnings = true,
            SaveInfos = true,
            Backups = true,
            Settings = true,
            Warnings = true,
        });
    }
}
