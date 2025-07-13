using System.IO;
using PKHeX.Core;

public class SaveInfosService
{

    public static Dictionary<uint, List<SaveInfosDTO>> GetAllSaveInfos()
    {
        var dbData = SaveInfosEntity.GetAllSaveInfosEntity();
        var list = dbData.Select(SaveInfosDTO.FromEntity).ToList();

        var record = new Dictionary<uint, List<SaveInfosDTO>>();
        list.ForEach(saveInfos =>
        {
            if (!record.ContainsKey(saveInfos.Id))
            {
                record.Add(saveInfos.Id, new List<SaveInfosDTO>());
            }
            record[saveInfos.Id].Add(saveInfos);
        });

        return record;
    }
    public static void LoadLastSaves()
    {
        DexService.ClearDex();

        Console.WriteLine("Loading last saves.");

        var lastSavesInfos = SaveInfosEntity.GetLastSaveInfosEntity();
        lastSavesInfos.ForEach(entity =>
        {

            var save = SaveUtil.GetVariantSAV(entity.Filepath)!;
            DexService.UpdateDexWithSave(save, entity);
        });
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

        var entity = new SaveInfosEntity
        {
            SaveId = SaveId,
            Filepath = filepath,
            Timestamp = timestamp,
        };

        var success = DexService.UpdateDexWithSave(save, entity);
        if (!success)
        {
            throw new Exception("Update dex with new save failed, check previous logs.");
        }

        Console.WriteLine("Write save file to " + filepath);

        Directory.CreateDirectory(filesDirectory);

        File.WriteAllBytes(filepath, fileBytes);

        var savesToRemove = SaveInfosEntity.WriteEntity(entity);

        savesToRemove.ForEach(toRemove =>
        {
            Console.WriteLine("Delete extra save file: " + toRemove.Filepath);
            File.Delete(toRemove.Filepath);
        });

        return SaveInfosDTO.FromEntity(entity);
    }

    public static void DeleteSave(uint saveId, long timestamp)
    {
        var removedEntity = SaveInfosEntity.DeleteEntity(saveId, timestamp);
        if (removedEntity == null)
        {
            return;
        }

        File.Delete(removedEntity.Filepath);

        LoadLastSaves();
    }
}
