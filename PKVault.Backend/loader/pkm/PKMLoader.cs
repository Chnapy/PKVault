
using PKHeX.Core;

public abstract class PKMLoader
{
    public static ImmutablePKM CreatePKM(byte[] bytes, PkmVersionEntity pkmVersionEntity)
    {
        // required to avoid mutation, like by PKHeX
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

        return new(pkm);
    }

    public static byte[] GetPKMBytes(ImmutablePKM pkm)
    {
        return [.. pkm.DecryptedPartyData];
    }

    public static string GetPKMFilepath(ImmutablePKM pkm)
    {
        return MatcherUtil.NormalizePath(Path.Combine(SettingsService.BaseSettings.SettingsMutable.STORAGE_PATH, pkm.Format.ToString(), GetPKMFilename(pkm)));
    }

    private static string GetPKMFilename(ImmutablePKM pkm)
    {
        var star = pkm.IsShiny ? " ★" : string.Empty;
        var speciesName = GameInfo.Strings.Species[pkm.Species].ToUpperInvariant().Replace(":", "");
        var id = pkm.GetPKMIdBase();
        return $"{pkm.Species:0000}{star} - {speciesName} - {id}.{pkm.Extension}";
    }

    public abstract byte[]? GetEntity(string filepath);

    public abstract void DeleteEntity(string filepath);

    public abstract string WriteEntity(byte[] bytes, ImmutablePKM pkm, string? expectedFilepath);
}
