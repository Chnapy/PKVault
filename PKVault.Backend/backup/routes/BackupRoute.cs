using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace PKVault.Backend.backup.routes;

[ApiController]
[Route("api/[controller]")]
public class BackupController : ControllerBase
{
    [HttpGet()]
    public ActionResult<List<BackupDTO>> GetAll()
    {
        return BackupService.GetBackupList();
    }

    [HttpDelete()]
    public async Task<ActionResult<DataDTO>> Delete([BindRequired] DateTime createdAt)
    {
        BackupService.DeleteBackup(createdAt);

        return await DataDTO.FromDataUpdateFlags(new() { Backups = true });
    }

    [HttpPost("restore")]
    public async Task<ActionResult<DataDTO>> Restore([BindRequired] DateTime createdAt)
    {
        await BackupService.RestoreBackup(createdAt);

        return await DataDTO.FromDataUpdateFlags(new()
        {
            MainBanks = true,
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
            Warnings = true,
        });
    }
}
