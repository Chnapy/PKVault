
using PKHeX.Core;

public class PKMMemoryLoader : PKMLoader
{
    public bool EnableLog = true;

    private Dictionary<string, byte[]> bytesDict = new();
    private List<(bool Create, string Path)> actions = [];

    public PKMMemoryLoader(
        PkmLoader pkmLoader,
        List<PkmVersionEntity> pkmVersionEntities
    )
    {
        pkmVersionEntities.ForEach(pkmVersionEntity =>
        {
            try
            {
                byte[]? pkmBytes = File.ReadAllBytes(pkmVersionEntity.Filepath);

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

    public override byte[]? GetEntity(string filepath)
    {
        var bytes = bytesDict.GetValueOrDefault(filepath);

        return bytes;
    }

    public override void DeleteEntity(string filepath)
    {
        var removed = bytesDict.Remove(filepath);

        if (EnableLog && removed)
            Console.WriteLine($"(M) Delete PKM filepath={filepath}");

        actions.Add((Create: false, Path: filepath));
    }

    public override string WriteEntity(byte[] bytes, PKM pkm, string? expectedFilepath)
    {
        var filepath = GetPKMFilepath(pkm);

        if (expectedFilepath != null && expectedFilepath != filepath)
        {
            if (EnableLog)
                Console.WriteLine($"(M) PKM-file filepath inconsistency. Expected={expectedFilepath} Obtained={filepath}");
            filepath = expectedFilepath;
        }

        if (EnableLog)
            Console.WriteLine($"(M) PKM-file Write idBase={BasePkmVersionDTO.GetPKMIdBase(pkm)} filepath={filepath}");

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

                Directory.CreateDirectory(Path.GetDirectoryName(action.Path)!);
                File.WriteAllBytes(action.Path, bytes);
            }
            else
            {
                if (File.Exists(action.Path))
                {
                    File.Delete(action.Path);
                }
            }
        }
    }
}
