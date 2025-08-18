
using PKHeX.Core;

public class PKMMemoryLoader : PKMLoader
{
    private Dictionary<string, byte[]> bytesDict = new();

    public override byte[]? GetEntity(PkmVersionEntity pkmVersion)
    {
        var bytes = bytesDict.GetValueOrDefault(pkmVersion.Filepath);

        return bytes;
    }

    public override void DeleteEntity(PkmVersionEntity pkmVersion)
    {
        Console.WriteLine($"(M) Delete PKM filepath={pkmVersion.Filepath}");

        bytesDict.Remove(pkmVersion.Filepath);
    }

    public override string WriteEntity(byte[] bytes, PKM pkm, uint generation, string? expectedFilepath)
    {
        var filepath = GetPKMFilepath(pkm, generation);

        if (expectedFilepath != null && expectedFilepath != filepath)
        {
            Console.WriteLine($"(M) PKM filepath inconsistency. Expected={expectedFilepath} Obtained={filepath}");
            filepath = expectedFilepath;
        }

        Console.WriteLine($"(M) Write new PKM filepath={filepath}, id={PkmSaveDTO.GetPKMId(pkm, generation)}");

        bytesDict.Remove(filepath);
        bytesDict.Add(filepath, bytes);

        // Console.WriteLine($"{string.Join('\n', bytesDict.Keys)}");

        return filepath;
    }
}
