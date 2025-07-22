
using PKHeX.Core;

public class PKMFileLoader : PKMLoader
{
    public override PKM? GetEntity(PkmVersionEntity pkmVersion)
    {
        var bytes = File.ReadAllBytes(pkmVersion.Filepath);

        PKM? pkm = pkmVersion.Generation switch
        {
            1 => new PK1(bytes),
            2 => new PK2(bytes),
            3 => new PK3(bytes),
            4 => new PK4(bytes),
            5 => new PK5(bytes),
            _ => EntityFormat.GetFromBytes(bytes)
        };

        return pkm;
    }

    public override void DeleteEntity(PkmVersionEntity pkmVersion)
    {
        Console.WriteLine($"Delete PKM filepath={pkmVersion.Filepath}");

        File.Delete(pkmVersion.Filepath);
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

        File.WriteAllBytes(filepath, pkm.Data);

        return filepath;
    }
}
