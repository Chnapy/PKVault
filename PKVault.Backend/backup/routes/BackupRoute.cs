using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace PKVault.Backend.backup.routes;

[ApiController]
[Route("api/[controller]")]
public class BackupController(BackupService backupService, DataService dataService) : ControllerBase
{
    [HttpGet()]
    public ActionResult<List<BackupDTO>> GetAll()
    {
        return backupService.GetBackupList();
    }

    [HttpDelete()]
    public async Task<ActionResult<DataDTO>> Delete([BindRequired] DateTime createdAt)
    {
        backupService.DeleteBackup(createdAt);

        return await dataService.CreateDataFromUpdateFlags(new() { Backups = true });
    }

    [HttpPost("restore")]
    public async Task<ActionResult<DataDTO>> Restore([BindRequired] DateTime createdAt)
    {
        await backupService.RestoreBackup(createdAt);

        return await dataService.CreateDataFromUpdateFlags(new()
        {
            MainBanks = new() { All = true },
            MainBoxes = new() { All = true },
            MainPkmVersions = new() { All = true },
            Saves = new() { All = true },
            // Actions = true,
            // Warnings = true,
            SaveInfos = true,
            Backups = true,
            Warnings = true,
        });
    }
}
