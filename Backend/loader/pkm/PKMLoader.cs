
using PKHeX.Core;

public abstract class PKMLoader
{
    public static PKM CreatePKM(byte[] bytes, PkmVersionEntity pkmVersionEntity, PkmEntity pkmEntity)
    {
        // required !
        bytes = (byte[])bytes.Clone();

        var format = EntityFileExtension.GetContextFromExtension(pkmVersionEntity.Filepath, (EntityContext)pkmVersionEntity.Generation);
        var pkm = EntityFormat.GetFromBytes(bytes, prefer: format);

        if (pkm == default)
        {
            pkm = pkmVersionEntity.Generation switch
            {
                1 => new PK1(bytes),
                2 => new PK2(bytes),
                3 => new PK3(bytes),
                4 => new PK4(bytes),
                5 => new PK5(bytes),
                _ => EntityFormat.GetFromBytes(bytes)
            };
        }

        // TODO code duplication with MainCreatePkmVersionAction
        if (pkmVersionEntity.Generation <= 2)
        {
            Console.WriteLine($"PKM G2 trash-bytes workaround");

            pkm.OriginalTrainerName = pkmEntity.OTName;
            pkm.Nickname = pkmEntity.Nickname;

            StringConverter.SetString(
                pkm.OriginalTrainerTrash,
                (ReadOnlySpan<char>)pkmEntity.OTName,
                pkm.TrashCharCountTrainer,
                StringConverterOption.None,
                (byte)pkmVersionEntity.Generation,
                false,
                false,
                pkm.Language
            );

            StringConverter.SetString(
                pkm.NicknameTrash,
                (ReadOnlySpan<char>)pkmEntity.Nickname,
                pkm.TrashCharCountNickname,
                StringConverterOption.None,
                (byte)pkmVersionEntity.Generation,
                false,
                false,
                pkm.Language
            );
        }

        return pkm;
    }

    public static byte[] GetPKMBytes(PKM pkm)
    {
        return pkm.Data;
    }

    public static string GetPKMFilepath(PKM pkm, uint generation)
    {
        return Path.Combine(Settings.mainPkmStoragePath, generation.ToString(), GetPKMFilename(pkm, generation));
    }

    private static string GetPKMFilename(PKM pkm, uint generation)
    {
        var star = pkm.IsShiny ? " ★" : string.Empty;
        var speciesName = GameInfo.Strings.Species[pkm.Species].ToUpperInvariant();
        var id = PkmSaveDTO.GetPKMId(pkm, generation);
        return $"{pkm.Species:0000}{star} - {speciesName} - {id}.{pkm.Extension}";
    }

    public abstract byte[]? GetEntity(PkmVersionEntity pkmVersion);

    public abstract void DeleteEntity(PkmVersionEntity pkmVersion);

    public abstract string WriteEntity(byte[] bytes, PKM pkm, uint generation, string? expectedFilepath);
}
