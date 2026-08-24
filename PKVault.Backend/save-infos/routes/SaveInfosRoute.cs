using System.Net.Mime;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace PKVault.Backend.saveinfos.routes;

[ApiController]
[Route("api/[controller]")]
public class SaveInfosController(
    ISettingsService settingsService,
    DataService dataService, ISavesLoadersService savesLoadersService, ISessionService sessionService
) : ControllerBase
{
    [HttpGet()]
    public ActionResult<IDictionary<uint, SaveInfosDTO>> GetAll()
    {
        var saveInfos = savesLoadersService.GetAllSaveInfos();
        return saveInfos.ToDictionary();
    }

    [HttpPut()]
    public async Task<ActionResult<DataDTO>> Scan()
    {
        if (!sessionService.HasEmptyActionList())
        {
            throw new InvalidOperationException($"Empty action list is required");
        }

        DataUpdateFlags flags = new();

        settingsService.RefreshSettings(flags);

        savesLoadersService.Clear();
        await sessionService.StartNewSession(checkInitialActions: true, flags);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpGet("{saveId}/download")]
    public async Task<ActionResult> Download(uint saveId)
    {
        if (!sessionService.HasEmptyActionList())
        {
            throw new InvalidOperationException($"Empty action list is required");
        }

        var saveById = savesLoadersService.GetSaveById();

        var save = saveById[saveId].Clone();

        var filename = save.Metadata.FileName;

        byte[] fileBytes = save.GetSaveFileData();
        return File(fileBytes, MediaTypeNames.Application.Octet, filename);
    }

    [HttpPost()]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(1024 * 1024 * 60)]
    public async Task<ActionResult<DataDTO>> Upload([BindRequired] List<IFormFile> saveFiles, [FromQuery] string[] saveFilesNames, [FromQuery] bool overwrite = false)
    {
        if (!sessionService.HasEmptyActionList())
        {
            throw new InvalidOperationException($"Empty action list is required");
        }

        if (saveFiles.Count == 0 || saveFiles.Count > 5)
            throw new ArgumentException($"Save files upload allowed 1-5 files, received {saveFiles.Count}");

        if (saveFiles.Count != saveFilesNames.Length)
            throw new ArgumentException($"Save files length != names list length - {saveFiles.Count}/{saveFilesNames.Length}");

        DataUpdateFlags flags = new();

        List<string> savePaths = [];

        for (var i = 0; i < saveFiles.Count; i++)
        {
            var saveFile = saveFiles[i];
            var filename = saveFilesNames[i];

            if (string.IsNullOrEmpty(filename)
                || filename.IndexOfAny(Path.GetInvalidFileNameChars()) != -1)
            {
                throw new ArgumentException($"Filename invalid: {filename}");
            }

            byte[] fileBytes;
            using (var ms = new MemoryStream())
            {
                await saveFile.CopyToAsync(ms);
                fileBytes = ms.ToArray();
            }

            var save = await savesLoadersService.CheckSaveData(fileBytes, filename, overwrite);
            ArgumentException.ThrowIfNullOrWhiteSpace(save.Metadata.FilePath);
            savePaths.Add(save.Metadata.FilePath);

            flags.SaveInfos = true;
            flags.Saves.UseSave(save.Id).SavePkms.All = true;
            flags.Saves.UseSave(save.Id).SaveBoxes = true;
            flags.Dex.All = true;
        }

        for (var i = 0; i < saveFiles.Count; i++)
        {
            var saveFile = saveFiles[i];
            var savePath = savePaths[i];

            byte[] fileBytes;
            using (var ms = new MemoryStream())
            {
                await saveFile.CopyToAsync(ms);
                fileBytes = ms.ToArray();
            }

            await savesLoadersService.UploadSaveWithoutCheck(savePath, fileBytes);
        }

        await savesLoadersService.Setup(flags);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpDelete()]
    public async Task<ActionResult<DataDTO>> Delete([BindRequired] string path)
    {
        if (!sessionService.HasEmptyActionList())
        {
            throw new InvalidOperationException($"Empty action list is required");
        }

        ArgumentException.ThrowIfNullOrWhiteSpace(path);

        DataUpdateFlags flags = new();

        var deleted = savesLoadersService.DeleteSave(path, flags);

        if (deleted)
            await savesLoadersService.Setup(flags);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }
}
