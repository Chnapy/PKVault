using System.Diagnostics;
using PKHeX.Core;

public class WarningsService
{
    private static WarningsDTO WarningsDTO = new()
    {
        playTimeWarnings = [],
        pkmVersionWarnings = [],
    };

    public static WarningsDTO GetWarningsDTO()
    {
        return WarningsDTO;
    }

    // TODO huge perf issues
    public static async Task CheckWarnings()
    {
        Stopwatch sw = new();

        Console.WriteLine($"Warnings check");

        sw.Start();
        // WarningsDTO = new()
        // {
        //     playTimeWarnings = CheckPlayTimeWarning(),
        //     pkmVersionWarnings = await CheckPkmVersionWarnings(),
        // };
        sw.Stop();

        Console.WriteLine($"Warnings checked in {sw.Elapsed}");
    }

    // TODO
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

        var fileLoader = DataFileLoader.Create();

        var pkms = await fileLoader.loaders.pkmLoader.GetAllDtos();
        var pkmVersions = await fileLoader.loaders.pkmVersionLoader.GetAllDtos();

        pkms.ForEach(pkm =>
        {
            if (pkm.SaveId != default)
            {
                var saveLoader = fileLoader.loaders.saveLoadersDict[(uint)pkm.SaveId];
                var save = saveLoader.Save;
                var generation = save.Generation;

                var pkmVersion = pkmVersions.Find(pkmVersion => pkmVersion.PkmDto.Id == pkm.Id && pkmVersion.Generation == generation);

                var savePkm = saveLoader.Pkms.GetDto(pkmVersion.Id);

                if (savePkm == default)
                {
                    Console.WriteLine($"Pkm-version warning");

                    warns.Add(new PkmVersionWarning()
                    {
                        PkmVersionId = pkmVersion.Id,
                    });
                }
            }
        });

        return warns;
    }

    private static int GetSavePlayTimeS(SaveFile save)
    {
        return save.PlayedHours * 60 * 60
        + save.PlayedMinutes * 60
         + save.PlayedSeconds;
    }
}
