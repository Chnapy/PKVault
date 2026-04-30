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

    [HttpPut()]
    public async Task<ActionResult<DataDTO>> Edit([BindRequired] DateTime createdAt, [BindRequired] string name)
    {
        backupService.EditBackup(createdAt, name);

        return await dataService.CreateDataFromUpdateFlags(new() { Backups = true });
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
        DataUpdateFlags flags = new();

        await backupService.RestoreBackup(createdAt, withSafeBackup: true, flags);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }
}
