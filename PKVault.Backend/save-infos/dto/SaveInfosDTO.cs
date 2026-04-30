
using PKHeX.Core;

public record SaveInfosDTO(
    uint Id,
    DateTime LastWriteTime,
    GameVersion DisplayedVersion,
    GameVersion Version,
    EntityContext Context,
    byte Generation,
    uint TID,
    uint? SID,
    LanguageID Language,
    string PlayTime,
    Gender TrainerGender,
    string TrainerName,
    int DexSeenCount,
    int DexCaughtCount,
    int OwnedCount,
    int ShinyCount,
    int PartyCount,
    int DaycareCount,
    int BoxCount,
    int BoxSlotCount,
    string Path
)
{
    public static SaveInfosDTO FromSave(SaveWrapper save, GameVersion? displayedVersion, DateTime lastWriteTime)
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

        var DaycareCount = save.GetSave() is IDaycareStorage daycareSave ? daycareSave.DaycareSlotCount : 0;

        return new SaveInfosDTO(
            Id: save.Id,
            LastWriteTime: lastWriteTime,
            DisplayedVersion: displayedVersion ?? save.Version,
            Version: save.Version,
            Context: save.Context,
            Generation: save.Generation,
            TID: save.TID,
            SID: save.SID,
            Language: save.GetSafeLanguage(),
            PlayTime: save.PlayTimeString,
            TrainerGender: (Gender)save.Gender,
            TrainerName: save.OT,
            DexSeenCount: seenCount,
            DexCaughtCount: caughtCount,
            OwnedCount: ownedCount,
            ShinyCount: shinyCount,
            PartyCount: save.PartyCount,
            DaycareCount: DaycareCount,
            BoxCount: save.BoxCount,
            BoxSlotCount: save.BoxSlotCount,
            //:anDelete = true,
            //:ownloadUrl = $"{serverUrl}/api/save-infos/{save.ID32}/download",
            Path: save.Metadata.FilePath!
        );
    }
}
