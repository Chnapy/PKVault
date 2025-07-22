
using PKHeX.Core;

public class PKMMemoryLoader : PKMLoader
{
    private Dictionary<string, PKM> pkmDict = new();

    public override PKM? GetEntity(PkmVersionEntity pkmVersion)
    {
        return pkmDict.GetValueOrDefault(pkmVersion.Filepath);
    }

    public override void DeleteEntity(PkmVersionEntity pkmVersion)
    {
        Console.WriteLine($"Delete PKM filepath={pkmVersion.Filepath}");

        pkmDict.Remove(pkmVersion.Filepath);
    }

    public override string WriteEntity(PKM pkm, string? expectedFilepath)
    {
        var filepath = GetPKMFilepath(pkm);

        if (expectedFilepath != null && expectedFilepath != filepath)
        {
            Console.WriteLine($"PKM filepath inconsistency. Expected={expectedFilepath} Obtained={filepath}");
            filepath = expectedFilepath;
        }

        Console.WriteLine($"Write new PKM filepath={filepath}");

        Console.WriteLine($"PKM id={pkm.ID32} / {PkmSaveDTO.GetPKMId(pkm)}");

        pkmDict.Add(filepath, pkm);

        return filepath;
    }
}
