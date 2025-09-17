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
    public async Task<ActionResult<DataDTO>> Edit([BindRequired] SettingsDTO settings)
    {
        await SettingsService.UpdateSettings(settings);

        await StorageService.ResetDataLoader();

        await WarningsService.CheckWarnings();

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
