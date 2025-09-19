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

    [HttpPost]
    public async Task<ActionResult<DataDTO>> Edit([BindRequired] SettingsMutableDTO settingsMutable)
    {
        if (!StorageService.HasEmptyActionList())
        {
            throw new Exception($"Empty action list is required");
        }

        if (settingsMutable.LANGUAGE == null || !SettingsDTO.AllowedLanguages.Contains(settingsMutable.LANGUAGE))
        {
            throw new Exception($"Language value not allowed: {settingsMutable.LANGUAGE}");
        }

        await SettingsService.UpdateSettings(settingsMutable);

        return await DataDTO.FromDataUpdateFlags(new()
        {
            MainBoxes = true,
            MainPkms = true,
            MainPkmVersions = true,
            Saves = [
                new (){
                    SaveId = 0
                }
            ],
            // Actions = true,
            // Warnings = true,
            SaveInfos = true,
            Backups = true,
            Settings = true,
        });
    }
}
