
using PKHeX.Core;

public class PKMFileLoader : PKMLoader
{
    public override byte[]? GetEntity(string filepath)
    {
        var bytes = File.ReadAllBytes(filepath);

        return bytes;
    }

    public override void DeleteEntity(string filepath)
    {
        Console.WriteLine($"Delete PKM filepath={filepath}");

        File.Delete(filepath);
    }

    public override string WriteEntity(byte[] bytes, PKM pkm, string? expectedFilepath)
    {
        var filepath = GetPKMFilepath(pkm);

        if (expectedFilepath != null && expectedFilepath != filepath)
        {
            Console.WriteLine($"PKM filepath inconsistency. Expected={expectedFilepath} Obtained={filepath}");
            filepath = expectedFilepath;
        }

        Console.WriteLine($"PKM-file Write idBase={BasePkmVersionDTO.GetPKMIdBase(pkm)} filepath={filepath}");

        Directory.CreateDirectory(Path.GetDirectoryName(filepath)!);
        File.WriteAllBytes(filepath, bytes);

        return filepath;
    }
}
