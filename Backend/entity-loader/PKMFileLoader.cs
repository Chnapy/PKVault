
using PKHeX.Core;

public class PKMFileLoader : PKMLoader
{
    public override PKM? GetEntity(PkmVersionEntity pkmVersion)
    {
        var bytes = File.ReadAllBytes(pkmVersion.Filepath);

        // TODO EntityFormat.GetFromBytes not working, use mapping
        return pkmVersion.Generation == 2 ? new PK2(bytes) : EntityFormat.GetFromBytes(bytes);
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
