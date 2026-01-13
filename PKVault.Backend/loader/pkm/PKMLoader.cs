
using PKHeX.Core;

public class PKMLoader
{
    public static ImmutablePKM CreatePKM(byte[] bytes, PkmVersionEntity pkmVersionEntity)
    {
        // required to avoid mutation, like by PKHeX
        bytes = (byte[])bytes.Clone();

        var format = EntityFileExtension.GetContextFromExtension(pkmVersionEntity.Filepath, (EntityContext)pkmVersionEntity.Generation);
        var pkm = EntityFormat.GetFromBytes(bytes, prefer: format);

        pkm ??= pkmVersionEntity.Generation switch
        {
            1 => new PK1(bytes),
            2 => new PK2(bytes),
            3 => new PK3(bytes),
            4 => new PK4(bytes),
            5 => new PK5(bytes),
            _ => EntityFormat.GetFromBytes(bytes)!
        };

        return new(pkm);
    }

    public static byte[] GetPKMBytes(ImmutablePKM pkm)
    {
        return [.. pkm.DecryptedPartyData];
    }

    private static string GetPKMFilename(ImmutablePKM pkm)
    {
        var star = pkm.IsShiny ? " ★" : string.Empty;
        var speciesName = GameInfo.Strings.Species[pkm.Species].ToUpperInvariant().Replace(":", "");
        var id = pkm.GetPKMIdBase();
        return $"{pkm.Species:0000}{star} - {speciesName} - {id}.{pkm.Extension}";
    }

    public bool EnableLog = true;

    private FileIOService fileIOService;
    private SettingsService settingsService;
    private Dictionary<string, byte[]> bytesDict = new();
    private List<(bool Create, string Path)> actions = [];

    public PKMLoader(
        FileIOService _fileIOService,
        SettingsService _settingsService,
        PkmLoader pkmLoader,
        List<PkmVersionEntity> pkmVersionEntities
    )
    {
        fileIOService = _fileIOService;
        settingsService = _settingsService;
        pkmVersionEntities.ForEach(pkmVersionEntity =>
        {
            try
            {
                byte[]? pkmBytes = fileIOService.ReadBytes(pkmVersionEntity.Filepath);

                var pkmEntity = pkmLoader.GetDto(pkmVersionEntity.PkmId);

                var pkm = CreatePKM(pkmBytes, pkmVersionEntity);
                if (pkm == default)
                {
                    throw new Exception($"PKM is null, from entity Id={pkmVersionEntity.Id} Filepath={pkmVersionEntity.Filepath} bytes.length={pkmBytes.Length}");
                }

                bytesDict.Add(pkmVersionEntity.Filepath, pkmBytes);
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine(ex);
            }
        });
    }

    public Dictionary<string, byte[]> GetAllEntities()
    {
        return bytesDict.ToDictionary();
    }

    public byte[]? GetEntity(string filepath)
    {
        var bytes = bytesDict.GetValueOrDefault(filepath);

        return bytes;
    }

    public void DeleteEntity(string filepath)
    {
        var removed = bytesDict.Remove(filepath);

        if (EnableLog && removed)
            Console.WriteLine($"(M) Delete PKM filepath={filepath}");

        actions.Add((Create: false, Path: filepath));
    }

    public string WriteEntity(byte[] bytes, ImmutablePKM pkm, string? expectedFilepath)
    {
        var filepath = GetPKMFilepath(pkm);

        if (expectedFilepath != null && expectedFilepath != filepath)
        {
            if (EnableLog)
                Console.WriteLine($"(M) PKM-file filepath inconsistency. Expected={expectedFilepath} Obtained={filepath}");
            filepath = expectedFilepath;
        }

        if (EnableLog)
            Console.WriteLine($"(M) PKM-file Write idBase={pkm.GetPKMIdBase()} filepath={filepath}");

        bytesDict.Remove(filepath);
        bytesDict.Add(filepath, bytes);

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
                var bytes = GetEntity(action.Path);

                fileIOService.WriteBytes(action.Path, bytes);
            }
            else
            {
                fileIOService.Delete(action.Path);
            }
        }
    }

    public string GetPKMFilepath(ImmutablePKM pkm)
    {
        return MatcherUtil.NormalizePath(Path.Combine(settingsService.GetSettings().SettingsMutable.STORAGE_PATH, pkm.Format.ToString(), GetPKMFilename(pkm)));
    }
}
