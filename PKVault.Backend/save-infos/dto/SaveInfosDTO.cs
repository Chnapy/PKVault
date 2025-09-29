
using PKHeX.Core;

public class SaveInfosDTO
{
    public static SaveInfosDTO FromSave(SaveFile save, DateTime lastWriteTime)
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
            // CanDelete = true,
            // DownloadUrl = $"{serverUrl}/api/save-infos/{save.ID32}/download",
        };
    }

    public required uint Id { get; set; }

    public required DateTime LastWriteTime { get; set; }

    public required GameVersion Version { get; set; }

    public required byte Generation { get; set; }

    public required uint TID { get; set; }

    public required uint SID { get; set; }

    public required int Language { get; set; }

    public required string PlayTime { get; set; }

    public required byte TrainerGender { get; set; }

    public required string TrainerName { get; set; }

    public required int DexSeenCount { get; set; }

    public required int DexCaughtCount { get; set; }

    public required int OwnedCount { get; set; }

    public required int ShinyCount { get; set; }

    public required int PartyCount { get; set; }

    public required int DaycareCount { get; set; }

    public required int BoxCount { get; set; }

    public required int BoxSlotCount { get; set; }

    // public bool CanDelete { get; set; }

    // public string DownloadUrl { get; set; }

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
