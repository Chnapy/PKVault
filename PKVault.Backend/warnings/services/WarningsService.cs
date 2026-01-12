using PKHeX.Core;

/**
 * Warnings checks in current session data.
 */
public class WarningsService(LoadersService loadersService, SaveService saveService)
{
    private WarningsDTO? WarningsDTO = null;

    public async Task<WarningsDTO> GetWarningsDTO()
    {
        if (WarningsDTO == null)
        {
            return await CheckWarnings();
        }

        return WarningsDTO;
    }

    public async Task<WarningsDTO> CheckWarnings()
    {
        var logtime = LogUtil.Time($"Warnings check");

        var saveChangedWarnings = CheckSaveChangedWarnings();
        var pkmVersionWarnings = CheckPkmVersionWarnings();
        var saveDuplicateWarnings = CheckSaveDuplicates();

        WarningsDTO = new(
            SaveChangedWarnings: await saveChangedWarnings,
            PlayTimeWarnings: CheckPlayTimeWarning(),
            PkmVersionWarnings: await pkmVersionWarnings,
            SaveDuplicateWarnings: await saveDuplicateWarnings
        );

        logtime();

        return WarningsDTO;
    }

    private async Task<List<SaveChangedWarning>> CheckSaveChangedWarnings()
    {
        var warns = new List<SaveChangedWarning>();

        var loaders = await loadersService.GetLoaders();

        var startTime = loaders.startTime;

        if (loaders.saveLoadersDict.Count == 0)
        {
            return [];
        }

        var saveByPath = await saveService.GetSaveByPath();

        return [.. loaders.saveLoadersDict.Values
            .Where(saveLoaders => saveLoaders.Boxes.HasWritten || saveLoaders.Pkms.HasWritten)
            .Where(saveLoaders =>
            {
                var path = saveByPath.Keys.ToList().Find(path => saveByPath[path].Id == saveLoaders.Save.Id);
                if (path == default)
                {
                    throw new KeyNotFoundException($"Path not found for given save {saveLoaders.Save.Id}");
                }

                var lastWriteTime = File.GetLastWriteTimeUtc(path);
                // Console.WriteLine($"Check save {saveLoaders.Save.ID32} to {path}.\nWrite-time from {lastWriteTime} to {startTime}.");
                return lastWriteTime > startTime;
            })
            .Select(saveLoaders => new SaveChangedWarning( SaveId: saveLoaders.Save.Id ))];
    }

    private List<PlayTimeWarning> CheckPlayTimeWarning()
    {
        var warns = new List<PlayTimeWarning>();

        // LocalSaveService.SaveByPath.Keys.ToList().ForEach(path =>
        // {
        //     var save = LocalSaveService.SaveByPath[path];

        //     var fileName = Path.GetFileNameWithoutExtension(path);
        //     var ext = Path.GetExtension(path);

        //     var dirPath = Path.GetDirectoryName(path)!;

        //     var bkpDirPath = Path.Combine(dirPath, Settings.backupDir);
        //     var bkpFileName = $"{fileName}_*{ext}";
        //     var bkpFilePath = Path.Combine(bkpDirPath, bkpFileName);

        //     var matcher = new Matcher();
        //     matcher.AddInclude(bkpFilePath);
        //     var matches = matcher.Execute(new DirectoryInfoWrapper(new DirectoryInfo(Settings.rootDir)));

        //     var bkpPaths = matches.Files.Select(file => Path.Combine(Settings.rootDir, file.Path)).ToList();
        //     bkpPaths.Sort();
        //     bkpPaths.Reverse();

        //     if (bkpPaths.Count > 0)
        //     {
        //         var previousSave = SaveUtil.GetVariantSAV(bkpPaths[0]);

        //         if (GetSavePlayTimeS(save) < GetSavePlayTimeS(previousSave!))
        //         {
        //             Console.WriteLine($"Play-time warning");

        //             warns.Add(new PlayTimeWarning()
        //             {
        //                 SaveId = save.ID32,
        //             });
        //         }
        //     }
        // });

        return warns;
    }

    private async Task<List<PkmVersionWarning>> CheckPkmVersionWarnings()
    {
        var warns = new List<PkmVersionWarning>();

        var loaders = await loadersService.GetLoaders();

        var pkms = loaders.pkmLoader.GetAllDtos();

        var tasks = pkms.Select(pkm =>
        {
            if (pkm.SaveId != default)
            {
                var exists = loaders.saveLoadersDict.TryGetValue((uint)pkm.SaveId!, out var saveLoader);
                if (!exists)
                {
                    return new PkmVersionWarning(
                        PkmId: pkm.Id
                    );
                }

                var save = saveLoader.Save;
                var generation = save.Generation;

                var pkmVersion = loaders.pkmVersionLoader.GetEntitiesByPkmId(pkm.Id).Values.ToList()
                    .Find(pkmVersion => pkmVersion.Generation == generation);

                var savePkm = pkmVersion == null ? null : saveLoader.Pkms.GetAllDtos().Find(pkm => pkm.GetPkmVersion(loaders.pkmVersionLoader)?.Id == pkmVersion.Id);

                if (savePkm == null)
                {
                    Console.WriteLine($"Pkm-version warning");

                    return new PkmVersionWarning(
                        PkmId: pkm.Id,
                        PkmVersionId: pkmVersion?.Id
                    );
                }
            }
            return null;
        });

        return [.. tasks
            .Where(value => value != null)
            .OfType<PkmVersionWarning>()];
    }

    private async Task<List<SaveDuplicateWarning>> CheckSaveDuplicates()
    {
        var loaders = await loadersService.GetLoaders();

        if (loaders.saveLoadersDict.Count == 0)
        {
            return [];
        }

        var saveByPath = await saveService.GetSaveByPath();

        var tasks = loaders.saveLoadersDict.Values.Select(async (saveLoader) =>
        {
            var paths = saveByPath.ToList()
                .FindAll(entry => entry.Value.Id == saveLoader.Save.Id)
                .Select(entry => entry.Key);

            return new SaveDuplicateWarning(
                SaveId: saveLoader.Save.Id,
                Paths: [.. paths]
            );
        });

        return (await Task.WhenAll(tasks)).ToList().FindAll(warn => warn.Paths.Length > 1);
    }

    // private int GetSavePlayTimeS(SaveFile save)
    // {
    //     return save.PlayedHours * 60 * 60
    //     + save.PlayedMinutes * 60
    //      + save.PlayedSeconds;
    // }
}
