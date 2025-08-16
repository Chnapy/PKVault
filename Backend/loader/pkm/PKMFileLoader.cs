
using PKHeX.Core;

public class PKMFileLoader : PKMLoader
{
    public override byte[]? GetEntity(PkmVersionEntity pkmVersion)
    {
        var bytes = File.ReadAllBytes(pkmVersion.Filepath);

        return bytes;
    }

    public override void DeleteEntity(PkmVersionEntity pkmVersion)
    {
        Console.WriteLine($"Delete PKM filepath={pkmVersion.Filepath}");

        File.Delete(pkmVersion.Filepath);
    }

    public override string WriteEntity(byte[] bytes, PKM pkm, uint generation, string? expectedFilepath)
    {
        var filepath = GetPKMFilepath(pkm, generation);

        if (expectedFilepath != null && expectedFilepath != filepath)
        {
            Console.WriteLine($"PKM filepath inconsistency. Expected={expectedFilepath} Obtained={filepath}");
            filepath = expectedFilepath;
        }

        Console.WriteLine($"Write new PKM filepath={filepath}");

        Console.WriteLine($"PKM id={pkm.ID32} / {PkmSaveDTO.GetPKMId(pkm, generation)}");

        Directory.CreateDirectory(Path.GetDirectoryName(filepath)!);
        File.WriteAllBytes(filepath, bytes);

        return filepath;
    }
}
