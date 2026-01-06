
using PKHeX.Core;

public abstract class PKMLoader
{
    public static PKM CreatePKM(byte[] bytes, PkmVersionEntity pkmVersionEntity)
    {
        // required !
        bytes = (byte[])bytes.Clone();

        var format = EntityFileExtension.GetContextFromExtension(pkmVersionEntity.Filepath, (EntityContext)pkmVersionEntity.Generation);
        var pkm = EntityFormat.GetFromBytes(bytes, prefer: format);

        pkm ??= pkmVersionEntity.Generation switch
        {
            1 => new PK1(bytes),
            2 => new PK2(bytes),
            3 => new PK3(bytes),
            4 => new PK4(bytes),
            5 => new PK5(bytes),
            _ => EntityFormat.GetFromBytes(bytes)!
        };

        return pkm;
    }

    public static byte[] GetPKMBytes(PKM pkm)
    {
        return [.. pkm.DecryptedPartyData];
    }

    public static string GetPKMFilepath(PKM pkm)
    {
        return MatcherUtil.NormalizePath(Path.Combine(SettingsService.BaseSettings.SettingsMutable.STORAGE_PATH, pkm.Format.ToString(), GetPKMFilename(pkm)));
    }

    private static string GetPKMFilename(PKM pkm)
    {
        var star = pkm.IsShiny ? " ★" : string.Empty;
        var speciesName = GameInfo.Strings.Species[pkm.Species].ToUpperInvariant().Replace(":", "");
        var id = BasePkmVersionDTO.GetPKMIdBase(pkm);
        return $"{pkm.Species:0000}{star} - {speciesName} - {id}.{pkm.Extension}";
    }

    public abstract byte[]? GetEntity(string filepath);

    public abstract void DeleteEntity(string filepath);

    public abstract string WriteEntity(byte[] bytes, PKM pkm, string? expectedFilepath);
}
