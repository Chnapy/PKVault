
using PKHeX.Core;

public class SaveInfosDTO
{
    public static SaveInfosDTO FromEntity(SaveInfosEntity entity)
    {
        var save = SaveUtil.GetVariantSAV(entity.Filepath)!;

        var seenCount = save.SeenCount;
        var caughtCount = save.CaughtCount;

        var allPkms = save.GetAllPKM();

        var ownedCount = allPkms.Count;

        var shinyCount = allPkms.FindAll(pkm => pkm.IsShiny).Count;

        if (caughtCount == 0)
        {
            caughtCount = allPkms.Count;
        }

        if (seenCount == 0)
        {
            seenCount = caughtCount;
        }

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
            DexSeenCount = seenCount,
            DexCaughtCount = caughtCount,
            OwnedCount = ownedCount,
            ShinyCount = shinyCount,
            BoxCount = save.BoxCount,
            BoxSlotCount = save.BoxSlotCount,
            MaxSpeciesId = save.MaxSpeciesID,
            MaxIV = save.MaxIV,
            CanDelete = true,
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

    public int DexSeenCount { get; set; }

    public int DexCaughtCount { get; set; }

    public int OwnedCount { get; set; }

    public int ShinyCount { get; set; }

    public int BoxCount { get; set; }

    public int BoxSlotCount { get; set; }

    public int MaxSpeciesId { get; set; }

    public int MaxIV { get; set; }

    public bool CanDelete { get; set; }
}
