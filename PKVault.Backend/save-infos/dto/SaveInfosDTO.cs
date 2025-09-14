
using PKHeX.Core;

public class SaveInfosDTO
{
    public static SaveInfosDTO FromSave(SaveFile save, bool isBackup, DateTime? backupTime, DateTime lastWriteTime)
    {
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

        var DaycareCount = save is IDaycareStorage daycareSave ? daycareSave.DaycareSlotCount : 0;

        return new SaveInfosDTO
        {
            Id = save.ID32,
            LastWriteTime = lastWriteTime,
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
            PartyCount = save.PartyCount,
            DaycareCount = DaycareCount,
            BoxCount = save.BoxCount,
            BoxSlotCount = save.BoxSlotCount,
            CanDelete = true,
        };
    }

    public uint Id { get; set; }

    public DateTime LastWriteTime { get; set; }

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

    public int PartyCount { get; set; }

    public int DaycareCount { get; set; }

    public int BoxCount { get; set; }

    public int BoxSlotCount { get; set; }

    public bool CanDelete { get; set; }

    public static bool IsSpeciesAllowed(int species, SaveFile save)
    {
        if (save is SAV7b)
        {
            return species <= 151
                || species == 808
                || species == 809;
        }

        return species <= save.MaxSpeciesID;
    }
}
