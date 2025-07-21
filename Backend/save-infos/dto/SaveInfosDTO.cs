
using PKHeX.Core;

public class SaveInfosDTO
{
    public static SaveInfosDTO FromEntity(SaveInfosEntity entity)
    {
        var save = SaveUtil.GetVariantSAV(entity.Filepath)!;

        return new SaveInfosDTO
        {
            Id = entity.SaveId,
            Timestamp = entity.Timestamp,
            Version = save.Version,
            Generation = save.Generation,
            TID = save.DisplayTID,
            SID = save.DisplaySID,
            Language = save.Language,
            PlayTime = save.PlayTimeString,
            TrainerGender = save.Gender,
            TrainerName = save.OT,
            BoxCount = save.BoxCount,
            BoxSlotCount = save.BoxSlotCount,
            MaxSpeciesId = save.MaxSpeciesID,
            MaxIV = save.MaxIV,
        };
    }

    public uint Id { get; set; }

    public long Timestamp { get; set; }

    public GameVersion Version { get; set; }

    public byte Generation { get; set; }

    public uint TID { get; set; }

    public uint SID { get; set; }

    public int Language { get; set; }

    public string PlayTime { get; set; }

    public byte TrainerGender { get; set; }

    public string TrainerName { get; set; }

    public int BoxCount { get; set; }

    public int BoxSlotCount { get; set; }

    public int MaxSpeciesId { get; set; }

    public int MaxIV { get; set; }
}
