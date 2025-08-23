
using PKHeX.Core;

public class PKMMemoryLoader : PKMLoader
{
    private Dictionary<string, byte[]> bytesDict = new();

    public override byte[]? GetEntity(string filepath)
    {
        var bytes = bytesDict.GetValueOrDefault(filepath);

        return bytes;
    }

    public override void DeleteEntity(string filepath)
    {
        Console.WriteLine($"(M) Delete PKM filepath={filepath}");

        bytesDict.Remove(filepath);
    }

    public override string WriteEntity(byte[] bytes, PKM pkm, string? expectedFilepath)
    {
        var filepath = GetPKMFilepath(pkm);

        if (expectedFilepath != null && expectedFilepath != filepath)
        {
            Console.WriteLine($"(M) PKM-file filepath inconsistency. Expected={expectedFilepath} Obtained={filepath}");
            filepath = expectedFilepath;
        }

        Console.WriteLine($"(M) PKM-file Write id={BasePkmVersionDTO.GetPKMId(pkm)} filepath={filepath}");

        bytesDict.Remove(filepath);
        bytesDict.Add(filepath, bytes);

        // Console.WriteLine($"{string.Join('\n', bytesDict.Keys)}");

        return filepath;
    }
}
