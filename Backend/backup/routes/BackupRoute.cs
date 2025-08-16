using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

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
    public void Delete([BindRequired] DateTime createdAt)
    {
        BackupService.DeleteBackup(createdAt);
    }

    [HttpPost("restore")]
    public void Restore([BindRequired] DateTime createdAt)
    {
        BackupService.RestoreBackup(createdAt);
    }
}
