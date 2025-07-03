using System.IO;
using PKHeX.Core;

public class SaveInfosService
{

    public static List<SaveInfosDTO> GetAllSaveInfos()
    {
        var dbData = SaveInfosEntity.GetAllSaveInfosEntity();
        var list = dbData.Select(SaveInfosDTO.FromEntity).ToList();

        return list;
    }

    public static SaveInfosDTO UploadNewSave(byte[] fileBytes, string formFilename)
    {
        var filesDirectory = "saves";

        var save = SaveUtil.GetVariantSAV(fileBytes, formFilename)!;

        var TID = save.DisplayTID;
        var SID = save.DisplaySID;

        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        var SaveId = save.ID32;

        var filename = $"{SaveId}_{timestamp}{save.Extension}";
        var filepath = $"{filesDirectory}/{filename}";

        Directory.CreateDirectory(filesDirectory);

        File.WriteAllBytes(filepath, fileBytes);

        var entity = new SaveInfosEntity
        {
            SaveId = SaveId,
            Filepath = filepath,
            Timestamp = timestamp,
        };

        var savesToRemove = SaveInfosEntity.WriteEntity(entity);

        savesToRemove.ForEach(toRemove =>
        {
            File.Delete(toRemove.Filepath);
        });

        DexService.UpdateDexWithSave(save, entity);

        return SaveInfosDTO.FromEntity(entity);
    }

}
