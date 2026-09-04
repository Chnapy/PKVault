using PKHeX.Core;

public interface ILegalityAnalysisService
{
    public LegalityAnalysisWrapper GetLegalitySafe(ImmutablePKM pkm, SaveWrapper? save = null, StorageSlotType slotType = StorageSlotType.None);
}

public class LegalityAnalysisWrapper(LegalityAnalysis? _la)
{
    public readonly LegalityAnalysis? la = _la;

    public IReadOnlyList<CheckResult> Results => la?.Results ?? [];
    public bool Parsed => la?.Parsed ?? true;
    public bool Valid => la?.Valid ?? true;
    public bool[] RelearnValid => la?.Info.Relearn.Select(r => r.Valid).ToArray() ?? [];
    public bool[] MovesValid => la?.Info.Moves.Select(r => r.Valid).ToArray() ?? [true, true, true, true];

    public string Report(string language, bool verbose = false) => la?.Report(language, verbose) ?? "";
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
