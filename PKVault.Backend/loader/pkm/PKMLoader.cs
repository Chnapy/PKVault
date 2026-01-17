
using PKHeX.Core;

public interface IPKMLoader
{
    public Dictionary<string, (byte[] Data, PKMLoadError? Error)> GetAllEntities();
    public void DeleteEntity(string filepath);
    public string WriteEntity(ImmutablePKM pkm, string filepath, Dictionary<ushort, StaticEvolve> evolves);
    public void WriteToFiles();
    public ImmutablePKM CreatePKM(PkmVersionEntity pkmVersionEntity);
    public string GetPKMFilepath(ImmutablePKM pkm, Dictionary<ushort, StaticEvolve> evolves);
}

public class PKMLoader : IPKMLoader
{
    private static byte[] GetPKMBytes(ImmutablePKM pkm)
    {
        return [.. pkm.DecryptedPartyData];
    }

    private static string GetPKMFilename(ImmutablePKM pkm, Dictionary<ushort, StaticEvolve> evolves)
    {
        var star = pkm.IsShiny ? " ★" : string.Empty;
        var speciesName = GameInfo.Strings.Species[pkm.Species].ToUpperInvariant().Replace(":", "");
        var id = pkm.GetPKMIdBase(evolves);
        return $"{pkm.Species:0000}{star} - {speciesName} - {id}.{pkm.Extension}";
    }

    public bool EnableLog = true;

    private IFileIOService fileIOService;
    private string storagePath;
    private Dictionary<string, (byte[] Data, PKMLoadError? Error)> bytesDict = [];
    private List<(bool Create, string Path)> actions = [];

    public PKMLoader(
        IFileIOService _fileIOService,
        string _storagePath,
        List<PkmVersionEntity> pkmVersionEntities
    )
    {
        fileIOService = _fileIOService;
        storagePath = _storagePath;
        pkmVersionEntities.ForEach(pkmVersionEntity =>
        {
            byte[] bytes = [];
            PKMLoadError? error = null;
            try
            {
                var (TooSmall, TooBig) = fileIOService.CheckGameFile(pkmVersionEntity.Filepath);

                if (TooBig)
                    throw new PKMLoadException(PKMLoadError.TOO_BIG);

                if (TooSmall)
                    throw new PKMLoadException(PKMLoadError.TOO_SMALL);

                bytes = fileIOService.ReadBytes(pkmVersionEntity.Filepath);
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine(ex);
                error = GetPKMLoadError(ex);
            }

            bytesDict.Add(pkmVersionEntity.Filepath, (bytes, error));
        });
    }

    public Dictionary<string, (byte[] Data, PKMLoadError? Error)> GetAllEntities()
    {
        return bytesDict.ToDictionary();
    }

    private (byte[] Data, PKMLoadError? Error) GetEntity(string filepath)
    {
        return bytesDict.GetValueOrDefault(filepath);
    }

    public void DeleteEntity(string filepath)
    {
        var removed = bytesDict.Remove(filepath);

        if (EnableLog && removed)
            Console.WriteLine($"(M) Delete PKM filepath={filepath}");

        actions.Add((Create: false, Path: filepath));
    }

    public string WriteEntity(ImmutablePKM pkm, string filepath, Dictionary<ushort, StaticEvolve> evolves)
    {
        if (!pkm.IsEnabled)
        {
            throw new InvalidOperationException($"Write disabled PKM not allowed");
        }

        var bytes = GetPKMBytes(pkm);

        var pkmFilepath = GetPKMFilepath(pkm, evolves);
        if (pkmFilepath != filepath)
        {
            // throw new InvalidOperationException($"(M) PKM-file filepath inconsistency. Expected={expectedFilepath} Obtained={filepath}");
            if (EnableLog)
                Console.WriteLine($"(M) PKM-file filepath inconsistency. Expected={pkmFilepath} Obtained={filepath}");
        }

        if (EnableLog)
            Console.WriteLine($"(M) PKM-file Write idBase={pkm.GetPKMIdBase(evolves)} filepath={filepath} bytes.length={bytes.Length}");

        bytesDict.Remove(filepath);
        bytesDict.Add(filepath, (bytes, null));

        actions.Add((Create: true, Path: filepath));

        // Console.WriteLine($"{string.Join('\n', bytesDict.Keys)}");

        return filepath;
    }

    public void WriteToFiles()
    {
        foreach (var action in actions)
        {
            if (action.Create)
            {
                var (bytes, _) = GetEntity(action.Path);

                fileIOService.WriteBytes(action.Path, bytes);
            }
            else
            {
                fileIOService.Delete(action.Path);
            }
        }
    }

    public ImmutablePKM CreatePKM(PkmVersionEntity pkmVersionEntity)
    {
        var (bytes, loadError) = GetEntity(pkmVersionEntity.Filepath);
        if (loadError != null)
        {
            return new(GetPlaceholderPKM(), loadError);
        }

        PKM pkm;
        try
        {
            var ext = Path.GetExtension(pkmVersionEntity.Filepath.AsSpan());

            FileUtil.TryGetPKM(bytes, out var pk, ext, new SimpleTrainerInfo() { Context = (EntityContext)pkmVersionEntity.Generation });
            if (pk == null)
            {
                throw new Exception($"TryGetPKM gives null pkm, path={pkmVersionEntity.Filepath} bytes.length={bytes.Length}");
            }
            pkm = pk;

            // pkm ??= pkmVersionEntity.Generation switch
            // {
            //     1 => new PK1(bytes),
            //     2 => new PK2(bytes),
            //     3 => new PK3(bytes),
            //     4 => new PK4(bytes),
            //     5 => new PK5(bytes),
            //     _ => EntityFormat.GetFromBytes(bytes)!
            // };
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"PKM file load failure with PkmVersion.Id={pkmVersionEntity.Id} path=${pkmVersionEntity.Filepath}");
            Console.Error.WriteLine(ex);

            pkm = GetPlaceholderPKM();
            loadError = GetPKMLoadError(ex);
        }

        return new(pkm, loadError);
    }

    private PKM GetPlaceholderPKM()
    {
        // class used here doesn't matter
        // since this pkm should not be manipulated nor stored at all
        return new PK1
        {
            Species = 0,
            Form = 0,
            Gender = 0
        };
    }

    private PKMLoadError GetPKMLoadError(Exception ex) => ex switch
    {
        FileNotFoundException => PKMLoadError.NOT_FOUND,
        DirectoryNotFoundException => PKMLoadError.NOT_FOUND,
        UnauthorizedAccessException => PKMLoadError.UNAUTHORIZED,
        PKMLoadException pkmEx => pkmEx.Error,
        _ => PKMLoadError.UNKNOWN
    };

    public string GetPKMFilepath(ImmutablePKM pkm, Dictionary<ushort, StaticEvolve> evolves)
    {
        if (!pkm.IsEnabled)
        {
            throw new InvalidOperationException($"Get filepath from disabled PKM not allowed");
        }

        return MatcherUtil.NormalizePath(Path.Combine(
            storagePath,
            pkm.Format.ToString(),
            GetPKMFilename(pkm, evolves)
        ));
    }
}

public class PKMLoadException(PKMLoadError error) : IOException($"PKM load error occured: {error}")
{
    public readonly PKMLoadError Error = error;
}
