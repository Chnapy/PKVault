namespace PKVault.Core.backup.routes;

[Route("api/[controller]")]
public class BackupController(BackupService backupService, DataService dataService)
{
    [HttpGet()]
    public List<BackupDTO> GetAll()
    {
        return backupService.GetBackupList();
    }

    [HttpPut()]
    public async Task<DataDTO> Edit(DateTime createdAt, string name)
    {
        backupService.EditBackup(createdAt, name);

        return await dataService.CreateDataFromUpdateFlags(new() { Backups = true });
    }

    [HttpDelete()]
    public async Task<DataDTO> Delete(DateTime createdAt)
    {
        backupService.DeleteBackup(createdAt);

        return await dataService.CreateDataFromUpdateFlags(new() { Backups = true });
    }

    [HttpPost("restore")]
    public async Task<DataDTO> Restore(DateTime createdAt)
    {
        DataUpdateFlags flags = new();

        await backupService.RestoreBackup(createdAt, withSafeBackup: true, flags);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }
}
