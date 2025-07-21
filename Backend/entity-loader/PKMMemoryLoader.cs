
using PKHeX.Core;

public class PKMMemoryLoader
{
    private Dictionary<string, PKM> pkmDict = new();

    // public PKMMemoryLoader(Dictionary<string, PKM> _pkmDict)
    // {
    //     pkmDict = _pkmDict.ToDictionary();
    // }

    public PKM? GetEntity(PkmVersionEntity pkmVersion)
    {
        return pkmDict.GetValueOrDefault(pkmVersion.Filepath);
    }

    public PKM? DeleteEntity(PkmVersionEntity pkmVersion)
    {
        Console.WriteLine($"Delete PKM filepath={pkmVersion}");

        var toDelete = pkmDict.GetValueOrDefault(pkmVersion.Filepath);

        pkmDict.Remove(pkmVersion.Filepath);

        return toDelete;
    }

    public PKM WriteEntity(PKM pkm, string? expectedFilepath)
    {
        var filepath = GetPKMFilepath(pkm);

        if (expectedFilepath != null && expectedFilepath != filepath)
        {
            Console.WriteLine($"PKM filepath inconsistency. Expected={expectedFilepath} Obtained={filepath}");
            filepath = expectedFilepath;
        }

        Console.WriteLine($"Write new PKM filepath={filepath}");

        pkmDict.Add(filepath, pkm);

        return pkm;
    }

    public string GetPKMFilepath(PKM pkm)
    {
        return $"pkm/{pkm.Generation}/{pkm.FileName}";
    }
}
