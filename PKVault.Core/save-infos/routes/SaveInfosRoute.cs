using System.Net.Mime;
using HttpMultipartParser;

namespace PKVault.Core.saveinfos.routes;

[Route("api/[controller]")]
public class SaveInfosController(
    ISettingsService settingsService,
    DataService dataService, ISavesLoadersService savesLoadersService, ISessionService sessionService
)
{
    [HttpGet()]
    public IDictionary<uint, SaveInfosDTO> GetAll()
    {
        var saveInfos = savesLoadersService.GetAllSaveInfos();
        return saveInfos.ToDictionary();
    }

    [HttpPut()]
    public async Task<DataDTO> Scan()
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
    public async Task<CoreFileResponse> Download(uint saveId)
    {
        if (!sessionService.HasEmptyActionList())
        {
            throw new InvalidOperationException($"Empty action list is required");
        }

        var saveById = savesLoadersService.GetSaveById();

        var save = saveById[saveId].Clone();

        var filename = save.Metadata.FileName;

        byte[] fileBytes = save.GetSaveFileData();

        return new(
            File: new(
                Stream: new MemoryStream(fileBytes),
                ContentType: MediaTypeNames.Application.Octet,
                FileName: filename ?? ""
            )
        );
    }

    [HttpPost()]
    // [Consumes("multipart/form-data")]
    // [RequestSizeLimit(1024 * 1024 * 60)]
    public async Task<DataDTO> Upload(CoreFile[] saveFiles, string[] saveFilesNames, bool overwrite = false)
    {
        if (!sessionService.HasEmptyActionList())
        {
            throw new InvalidOperationException($"Empty action list is required");
        }

        if (saveFiles.Length == 0 || saveFiles.Length > 5)
            throw new ArgumentException($"Save files upload allowed 1-5 files, received {saveFiles.Length}");

        if (saveFiles.Length != saveFilesNames.Length)
            throw new ArgumentException($"Save files length != names list length - {saveFiles.Length}/{saveFilesNames.Length}");

        DataUpdateFlags flags = new();

        List<string> savePaths = [];

        for (var i = 0; i < saveFiles.Length; i++)
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
                await saveFile.Stream.CopyToAsync(ms);
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

        for (var i = 0; i < saveFiles.Length; i++)
        {
            var saveFile = saveFiles[i];
            var savePath = savePaths[i];

            byte[] fileBytes;
            using (var ms = new MemoryStream())
            {
                await saveFile.Stream.CopyToAsync(ms);
                fileBytes = ms.ToArray();
            }

            await savesLoadersService.UploadSaveWithoutCheck(savePath, fileBytes);
        }

        await savesLoadersService.Setup(flags);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    [HttpDelete()]
    public async Task<DataDTO> Delete(string path)
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
