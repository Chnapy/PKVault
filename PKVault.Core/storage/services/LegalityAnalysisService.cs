using PKHeX.Core;

namespace PKVault.Core;

public interface ILegalityAnalysisService
{
    public LegalityAnalysisWrapper GetLegalitySafe(ImmutablePKM pkm, SaveWrapper? save = null, StorageSlotType slotType = StorageSlotType.None);
}

public class LegalityAnalysisWrapper
{
    private static readonly HashSet<(CheckIdentifier Identifier, LegalityCheckResultCode Result)> ResultsToIgnore = [
        // "HOME Transfer Tracker missing", not relevant
        // we're not using Settings.HOMETransfer.HOMETransferTrackerNotPresent because it has side-effects on others checks
        (CheckIdentifier.Encounter, LegalityCheckResultCode.TransferTrackerMissing)
    ];

    public readonly LegalityAnalysis? la;

    public readonly IReadOnlyList<CheckResult> Results;
    public LegalInfo? Info => la?.Info;
    public bool Parsed => la?.Parsed ?? true;
    public readonly bool Valid;
    public readonly bool[] RelearnValid;
    public readonly bool[] MovesValid;

    public LegalityAnalysisWrapper(LegalityAnalysis? _la)
    {
        la = _la;

        Results = la?.Results
            .Where(r => !ResultsToIgnore.Contains((r.Identifier, r.Result)))
            .ToList() ?? [];

        MovesValid = la?.Info.Moves.Select(r => r.Valid).ToArray() ?? [true, true, true, true];
        RelearnValid = la?.Info.Relearn.Select(r => r.Valid).ToArray() ?? [];
        Valid = Results.All(r => r.Valid)
            && MovesValid.All(m => m)
            && RelearnValid.All(m => m);
    }

    public string Report(string language)
    {
        if (la == null)
            return "";

        var localizer = LegalityLocalizationContext.Create(la, language);
        var info = la.Info;
        var pk = info.Entity;

        var invalidTxt = localizer.Settings.Description(Severity.Invalid);

        List<string> moveLines = [];
        LegalityFormatting.AddMoves(localizer, info.Moves, moveLines, pk.Context, false);
        if (pk.Format >= 6)
            LegalityFormatting.AddRelearn(localizer, info.Relearn, moveLines, false);
        // remove "Invalid "
        var movePrefix = $"{invalidTxt} ";
        moveLines = moveLines
            .Select(l => l.TrimStart(movePrefix).ToString())
            .ToList();

        List<string> otherLines = [];
        LegalityFormatting.AddSecondaryChecksInvalid(localizer, Results, otherLines);
        // remove "Invalid: "
        var prefixToTrim = string.Format(localizer.Settings.Lines.F0_1, invalidTxt, "");
        otherLines = otherLines.Select(l => l.StartsWith(prefixToTrim)
            ? l[prefixToTrim.Length..]
            : l)
            .ToList();

        return string.Join('\n', [.. moveLines, .. otherLines]);
    }
}

public class LegalityAnalysisService(ISettingsService settingsService) : ILegalityAnalysisService
{
    private static readonly Lock legalityLock = new();

    public LegalityAnalysisWrapper GetLegalitySafe(ImmutablePKM pkm, SaveWrapper? save = null, StorageSlotType slotType = StorageSlotType.None)
    {
        if (settingsService.GetSettings().SettingsMutable.SKIP_LEGALITY_CHECKS)
        {
            return new(null);
        }

        return new(GetLegalitySafeRaw(pkm, save, slotType));
    }

    /**
     * Check legality with correct global settings.
     * Required to expect same result as in PKHeX.
     *
     * If no save passed, some checks won't be done.
     */
    public static LegalityAnalysis GetLegalitySafeRaw(ImmutablePKM pkm, SaveWrapper? save = null, StorageSlotType slotType = StorageSlotType.None)
    {
        // lock required because of ParseSettings static context causing race condition
        lock (legalityLock)
        {
            if (save != null)
            {
                ParseSettings.InitFromSaveFileData(save.GetSave());
            }
            else
            {
                ParseSettings.ClearActiveTrainer();
            }

            var la = save != null && pkm.GetType() == save.PKMType // quick sanity check
                ? new LegalityAnalysis(pkm.GetMutablePkm(), save.Personal, slotType)
                : new LegalityAnalysis(pkm.GetMutablePkm(), pkm.PersonalInfo, slotType);

            ParseSettings.ClearActiveTrainer();

            return la;
        }
    }
}
