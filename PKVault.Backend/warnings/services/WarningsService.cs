using PKHeX.Core;

public class WarningsService
{
    private static WarningsDTO WarningsDTO = new()
    {
        SaveChangedWarnings = [],
        PlayTimeWarnings = [],
        PkmVersionWarnings = [],
        PkmDuplicateWarnings = [],
    };

    public static WarningsDTO GetWarningsDTO()
    {
        return WarningsDTO;
    }

    public static async Task CheckWarnings()
    {
        var logtime = LogUtil.Time($"Warnings check");

        var saveChangedWarnings = CheckSaveChangedWarnings();
        var pkmVersionWarnings = CheckPkmVersionWarnings();
        var pkmDuplicateWarnings = CheckSavePkmDuplicates();

        WarningsDTO = new()
        {
            SaveChangedWarnings = await saveChangedWarnings,
            PlayTimeWarnings = CheckPlayTimeWarning(),
            PkmVersionWarnings = await pkmVersionWarnings,
            PkmDuplicateWarnings = await pkmDuplicateWarnings,
        };

        logtime();
    }

    private static async Task<List<SaveChangedWarning>> CheckSaveChangedWarnings()
    {
        var warns = new List<SaveChangedWarning>();

        var loader = await StorageService.GetLoader();

        var startTime = loader.startTime;

        if (loader.loaders.saveLoadersDict.Count == 0)
        {
            return [];
        }

        return [.. loader.loaders.saveLoadersDict.Values
            .Where(saveLoaders => saveLoaders.Boxes.HasWritten || saveLoaders.Pkms.HasWritten)
            .Where(saveLoaders =>
            {
                var path = LocalSaveService.SaveByPath.Keys.ToList().Find(path => LocalSaveService.SaveByPath[path].ID32 == saveLoaders.Save.ID32);
                if (path == default)
                {
                    throw new KeyNotFoundException($"Path not found for given save {saveLoaders.Save.ID32}");
                }

                var lastWriteTime = File.GetLastWriteTimeUtc(path);
                // Console.WriteLine($"Check save {saveLoaders.Save.ID32} to {path}.\nWrite-time from {lastWriteTime} to {startTime}.");
                return lastWriteTime > startTime;
            })
            .Select(saveLoaders => new SaveChangedWarning() { SaveId = saveLoaders.Save.ID32 })];
    }

    private static List<PlayTimeWarning> CheckPlayTimeWarning()
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

    private static async Task<List<PkmVersionWarning>> CheckPkmVersionWarnings()
    {
        var warns = new List<PkmVersionWarning>();

        var loader = await StorageService.GetLoader();

        var pkmVersions = loader.loaders.pkmVersionLoader.GetAllDtos();
        var pkms = loader.loaders.pkmLoader.GetAllDtos();

        var tasks = pkms.Select(async pkm =>
        {
            if (pkm.SaveId != default)
            {
                var exists = loader.loaders.saveLoadersDict.TryGetValue((uint)pkm.SaveId!, out var saveLoader);
                if (!exists)
                {
                    return new PkmVersionWarning()
                    {
                        PkmId = pkm.Id,
                    };
                }

                var save = saveLoader.Save;
                var generation = save.Generation;

                var pkmVersion = pkmVersions.Find(pkmVersion => pkmVersion.PkmDto.Id == pkm.Id && pkmVersion.Generation == generation);

                var savePkm = pkmVersion == null ? null : saveLoader.Pkms.GetAllDtos().Find(pkm => pkm.PkmVersionId == pkmVersion.Id);

                if (savePkm == null)
                {
                    Console.WriteLine($"Pkm-version warning");

                    return new PkmVersionWarning()
                    {
                        PkmId = pkm.Id,
                        PkmVersionId = pkmVersion?.Id,
                    };
                }
            }
            return null;
        });

        return [.. (await Task.WhenAll(tasks))
            .Where(value => value != null)
            .OfType<PkmVersionWarning>()];
    }

    private static async Task<List<PkmDuplicateWarning>> CheckSavePkmDuplicates()
    {
        var loader = await StorageService.GetLoader();

        if (loader.loaders.saveLoadersDict.Count == 0)
        {
            return [];
        }

        var tasks = loader.loaders.saveLoadersDict.Values.Select(async (saveLoader) =>
        {
            var pkmCountByIdBase = new Dictionary<string, int>();

            var pkms = saveLoader.Pkms.GetAllDtos();
            pkms.ForEach(pkm =>
            {
                var count = pkmCountByIdBase.TryGetValue(pkm.IdBase, out var _count) ? _count : 0;
                pkmCountByIdBase[pkm.IdBase] = count + 1;
            });

            var duplicateIdBases = pkmCountByIdBase.Count > 0
                ? pkmCountByIdBase.ToList().FindAll(entry => entry.Value > 1).Select(entry => entry.Key).ToArray()
                : [];

            return new PkmDuplicateWarning()
            {
                SaveId = saveLoader.Save.ID32,
                DuplicateIdBases = duplicateIdBases,
            };
        });

        return (await Task.WhenAll(tasks)).ToList().FindAll(warn => warn.DuplicateIdBases.Length > 0);
    }

    private static int GetSavePlayTimeS(SaveFile save)
    {
        return save.PlayedHours * 60 * 60
        + save.PlayedMinutes * 60
         + save.PlayedSeconds;
    }
}
