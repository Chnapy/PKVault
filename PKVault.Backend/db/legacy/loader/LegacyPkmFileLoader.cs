using PKHeX.Core;

public interface ILegacyPkmFileLoader
{
    public (byte[] Data, PKMLoadError? Error) GetEntity(string filepath);
    public void DeleteEntity(string filepath);
    public string WriteEntity(ImmutablePKM pkm, string filepath, Dictionary<ushort, StaticEvolve> evolves);
    public ImmutablePKM CreatePKM(string id, string filepath, byte generation);
    public ImmutablePKM CreatePKM(PkmVariantEntity pkmVersionEntity);
    public string GetPKMFilepath(ImmutablePKM pkm, Dictionary<ushort, StaticEvolve> evolves);
}

public class LegacyPkmFileLoader : ILegacyPkmFileLoader
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

    // public bool EnableLog = true;

    private IFileIOService fileIOService;
    private string storagePath;

    private Dictionary<string, (byte[] Data, PKMLoadError? Error)> bytesDict = [];
    private List<(bool Create, string Path)> actions = [];

    public LegacyPkmFileLoader(
        IFileIOService _fileIOService,
        string _storagePath
    )
    {
        fileIOService = _fileIOService;
        storagePath = _storagePath;

    }

    public (byte[] Data, PKMLoadError? Error) GetEntity(string filepath)
    {
        return GetFileOrLoad(filepath);
    }

    public void DeleteEntity(string filepath)
    {
        var removed = bytesDict.Remove(filepath);

        // if (EnableLog && removed)
        //     Console.WriteLine($"(M) Delete PKM filepath={filepath}");

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
            // if (EnableLog)
            //     Console.WriteLine($"(M) PKM-file filepath inconsistency. Expected={pkmFilepath} Obtained={filepath}");
        }

        // if (EnableLog)
        //     Console.WriteLine($"(M) PKM-file Write idBase={pkm.GetPKMIdBase(evolves)} filepath={filepath} bytes.length={bytes.Length}");

        bytesDict.Remove(filepath);
        bytesDict.Add(filepath, (bytes, null));

        actions.Add((Create: true, Path: filepath));

        // Console.WriteLine($"{string.Join('\n', bytesDict.Keys)}");

        return filepath;
    }

    private (byte[] Data, PKMLoadError? Error) GetFileOrLoad(string filepath)
    {
        if (bytesDict.TryGetValue(filepath, out var file))
        {
            return file;
        }

        byte[] bytes = [];
        PKMLoadError? error = null;
        try
        {
            var (TooSmall, TooBig) = fileIOService.CheckGameFile(filepath);

            if (TooBig)
                throw new LegacyPKMLoadException(LegacyPKMLoadError.TOO_BIG);

            if (TooSmall)
                throw new LegacyPKMLoadException(LegacyPKMLoadError.TOO_SMALL);

            bytes = fileIOService.ReadBytesSync(filepath);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine(ex);
            error = GetPKMLoadError(ex);
        }

        file = (bytes, error);

        bytesDict.Add(filepath, file);

        return file;
    }

    public ImmutablePKM CreatePKM(PkmVariantEntity pkmVersionEntity)
    {
        return CreatePKM(
            pkmVersionEntity.Id, pkmVersionEntity.Filepath, pkmVersionEntity.Generation
        );
    }

    public ImmutablePKM CreatePKM(string id, string filepath, byte generation)
    {
        var (bytes, loadError) = GetEntity(filepath);
        if (loadError != null)
        {
            return new(GetPlaceholderPKM(), loadError);
        }

        PKM pkm;
        try
        {
            var ext = Path.GetExtension(filepath.AsSpan());

            FileUtil.TryGetPKM(bytes, out var pk, ext, new SimpleTrainerInfo() { Context = (EntityContext)generation });
            if (pk == null)
            {
                throw new Exception($"TryGetPKM gives null pkm, path={filepath} bytes.length={bytes.Length}");
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
            Console.Error.WriteLine($"PKM file load failure with PkmVersion.Id={id} path=${filepath}");
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

public class LegacyPKMLoadException(LegacyPKMLoadError error) : IOException($"PKM load error occured: {error}")
{
    public readonly LegacyPKMLoadError Error = error;
}

public enum LegacyPKMLoadError
{
    UNKNOWN,
    NOT_FOUND,
    TOO_SMALL,
    TOO_BIG,
    UNAUTHORIZED
}
