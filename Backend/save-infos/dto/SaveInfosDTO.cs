
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
            TrainerName = save.OT,
        };
    }

    public uint Id { get; set; }

    public long Timestamp { get; set; }

    public GameVersion Version { get; set; }

    public byte Generation { get; set; }

    public uint TID { get; set; }

    public uint SID { get; set; }

    public string TrainerName { get; set; }
}
