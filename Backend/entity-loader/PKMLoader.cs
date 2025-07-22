
using PKHeX.Core;

public abstract class PKMLoader
{
    public abstract PKM? GetEntity(PkmVersionEntity pkmVersion);

    public abstract void DeleteEntity(PkmVersionEntity pkmVersion);

    public abstract string WriteEntity(PKM pkm, string? expectedFilepath);

    public string GetPKMFilepath(PKM pkm)
    {
        return $"pkm/{pkm.Generation}/{pkm.FileName}";
    }
}
