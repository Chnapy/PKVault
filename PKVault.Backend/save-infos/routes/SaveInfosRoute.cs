using System.Net.Mime;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PKHeX.Core;

namespace PKVault.Backend.saveinfos.routes;

[ApiController]
[Route("api/[controller]")]
public class SaveInfosController(
    ISettingsService settingsService,
    DataService dataService, ISavesLoadersService savesLoadersService, ISessionService sessionService,
    IFileIOService fileIOService
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

    /// <summary>
    /// Upload a save file. The game version is detected with PKHeX and the file
    /// is stored under the configured save folder, grouped by generation and
    /// game (ex: "Gen3/Emerald"). Saves are then rescanned so the new file shows up.
    /// Especially useful in the Docker/web context where dropping files into the
    /// mounted folder by hand is inconvenient.
    /// </summary>
    [HttpPost("upload")]
    public async Task<ActionResult<DataDTO>> Upload(IFormFile file)
    {
        if (!sessionService.HasEmptyActionList())
        {
            throw new InvalidOperationException($"Empty action list is required");
        }

        if (file == null || file.Length == 0)
        {
            return BadRequest("No file provided");
        }

        var (TooSmall, TooBig) = fileIOService.CheckGameFile(file.Length);
        if (TooSmall || TooBig)
        {
            return BadRequest("File size does not match a valid save file");
        }

        byte[] data;
        using (var ms = new MemoryStream())
        {
            await file.CopyToAsync(ms);
            data = ms.ToArray();
        }

        if (!SaveUtil.TryGetSaveFile(data, out var save, file.FileName) || save == null)
        {
            return BadRequest("File is not a recognized save file");
        }

        var baseDir = ResolveUploadBaseDir();
        if (baseDir == null)
        {
            return BadRequest("No save folder configured. Add a saves folder in Settings first.");
        }

        var gameFolder = GameVersionNameUtil.GetGameFolder(save.Version, save.Generation);

        var safeName = Path.GetFileName(file.FileName);
        if (string.IsNullOrWhiteSpace(safeName))
        {
            safeName = string.IsNullOrWhiteSpace(save.Metadata.FileName) ? "save.sav" : save.Metadata.FileName;
        }

        var destPath = MatcherUtil.NormalizePath(Path.Combine(baseDir, gameFolder, safeName));
        destPath = GetNonConflictingPath(destPath);

        await fileIOService.WriteBytes(destPath, data);

        // rescan saves so the uploaded file is picked up (same flow as Scan)
        DataUpdateFlags flags = new();
        settingsService.RefreshSettings(flags);
        savesLoadersService.Clear();
        await sessionService.StartNewSession(checkInitialActions: true, flags);

        return await dataService.CreateDataFromUpdateFlags(flags);
    }

    /// <summary>
    /// Resolve a writable base directory to store uploaded saves, derived from
    /// the configured SAVE_GLOBS. Only globs pointing to a folder (containing a
    /// wildcard, or an existing directory) are considered so uploaded files land
    /// where saves are actually scanned. Returns null if none is usable.
    /// </summary>
    private string? ResolveUploadBaseDir()
    {
        var globs = settingsService.GetSettings().SettingsMutable.SAVE_GLOBS ?? [];

        foreach (var rawGlob in globs)
        {
            var glob = rawGlob?.Trim();
            if (string.IsNullOrEmpty(glob) || glob[0] == '!')
            {
                continue;
            }

            var normalized = MatcherUtil.NormalizePath(glob);
            var segments = normalized.Split('/');

            var literalParts = new List<string>();
            var hasWildcard = false;
            foreach (var seg in segments)
            {
                if (seg.Contains('*') || seg.Contains('?') || seg.Contains('['))
                {
                    hasWildcard = true;
                    break;
                }
                literalParts.Add(seg);
            }

            var literalPath = string.Join('/', literalParts);
            if (string.IsNullOrWhiteSpace(literalPath))
            {
                continue;
            }

            if (!Path.IsPathRooted(literalPath))
            {
                literalPath = MatcherUtil.NormalizePath(Path.Combine(SettingsService.GetAppDirectory(), literalPath));
            }

            string? candidate = null;
            if (hasWildcard)
            {
                candidate = literalPath;
            }
            else if (Directory.Exists(literalPath))
            {
                candidate = literalPath;
            }

            if (candidate == null)
            {
                continue;
            }

            try
            {
                fileIOService.CreateDirectory(candidate);
                return MatcherUtil.NormalizePath(candidate);
            }
            catch
            {
                // not writable, try next glob
            }
        }

        return null;
    }

    /// <summary>
    /// Ensure the destination path does not overwrite an existing file by
    /// appending an incrementing suffix (ex: "file (1).sav").
    /// </summary>
    private string GetNonConflictingPath(string path)
    {
        if (!fileIOService.Exists(path))
        {
            return path;
        }

        var dir = Path.GetDirectoryName(path) ?? "";
        var name = Path.GetFileNameWithoutExtension(path);
        var ext = Path.GetExtension(path);

        for (var i = 1; i < 1000; i++)
        {
            var candidate = MatcherUtil.NormalizePath(Path.Combine(dir, $"{name} ({i}){ext}"));
            if (!fileIOService.Exists(candidate))
            {
                return candidate;
            }
        }

        return path;
    }
}
