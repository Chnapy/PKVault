using PKHeX.Core;

public interface IPkmConvertService
{
    public ImmutablePKM ConvertTo(ImmutablePKM sourcePkm, EntityContext context);
    public ImmutablePKM ConvertTo(ImmutablePKM sourcePkm, Type targetPkmType, PKMRndValues? rndValues, SaveFile? targetSave = null);
}

public class PkmConvertService(ILogger<PkmConvertService> log, ISettingsService settingsService, ILegalityAnalysisService legalityAnalysisService) : IPkmConvertService
{
    private readonly PKMConverterUtils pkmConverterUtils = new(legalityAnalysisService);
    private readonly PK2Converter pk2Converter = new(new(legalityAnalysisService));
    private readonly PK3Converter pk3Converter = new(new(legalityAnalysisService));
    private readonly PK4Converter pk4Converter = new(new(legalityAnalysisService));
    private readonly PK5Converter pk5Converter = new(new(legalityAnalysisService));
    private readonly PK6Converter pk6Converter = new(new(legalityAnalysisService));
    private readonly PK7Converter pk7Converter = new(new(legalityAnalysisService));
    private readonly PK8Converter pk8Converter = new(new(legalityAnalysisService));
    private readonly PK9Converter pk9Converter = new(new(legalityAnalysisService));

    public ImmutablePKM ConvertTo(ImmutablePKM sourcePkm, EntityContext context)
    {
        log.LogDebug($"Convert {sourcePkm.GetMutablePkm().GetType().Name} -> context={context}");

        Type targetType = BlankSaveFile.Get(context).BlankPKM.GetType();

        return ConvertTo(sourcePkm, targetType, null);
    }

    public ImmutablePKM ConvertTo(ImmutablePKM sourcePkm, Type targetPkmType, PKMRndValues? rndValues, SaveFile? targetSave = null)
    {
        log.LogDebug($"Convert {sourcePkm.GetMutablePkm().GetType().Name} -> {targetPkmType.Name}");

        var fallbackLang = settingsService.GetSettings().GetSafeLanguageID();

        var result = ConvertRecursive(sourcePkm.GetMutablePkm().Clone(), targetPkmType, fallbackLang, rndValues);

        if (result.GetType() != targetPkmType)
            throw new InvalidOperationException($"Failed to convert to {targetPkmType.Name}");

        if (targetSave != null)
        {
            result.HandlingTrainerName = targetSave.OT;
            result.HandlingTrainerGender = targetSave.Gender;

            result.CurrentHandler = targetSave.IsFromTrainer(result) ? (byte)0 : (byte)1;
        }

        pkmConverterUtils.FixCommonLegalityIssues(result, targetSave != null ? new(targetSave) : null);

        result.Heal();
        result.ResetPartyStats();
        result.RefreshChecksum();

        if (result.Species == 0)
        {
            throw new Exception($"Convert failed, Species=0");
        }

        return new(result);
    }

    private PKM ConvertRecursive(PKM current, Type targetType, LanguageID fallbackLang, PKMRndValues? rndValues)
    {
        // log.LogInformation($"Convert recursive {current.GetType().Name} -> {targetType.Name}");

        var currentValue = GetPKMTypeWeight(current.GetType());
        var targetValue = GetPKMTypeWeight(targetType);
        var direction = targetValue - currentValue;

        if (current.GetType() == targetType)
            return current;

        if (direction > 0)
        {

            var direct = TryPKToVariant(current, targetType, rndValues);
            if (direct != null)
                return ConvertRecursive(direct, targetType, fallbackLang, rndValues);

            var forward = TryForwardConversion(current, fallbackLang, rndValues);
            if (forward != null)
                return ConvertRecursive(forward, targetType, fallbackLang, rndValues);
        }
        else
        {

            var backward = TryBackwardConversion(current, rndValues);
            if (backward != null)
                return ConvertRecursive(backward, targetType, fallbackLang, rndValues);
        }

        throw new InvalidOperationException($"No conversion path from {current.GetType().Name} to {targetType.Name}");
    }

    private PKM? TryPKToVariant(PKM source, Type targetType, PKMRndValues? rndValues)
    {
        // log.LogInformation($"Convert forward {source.GetType().Name} -> {targetType.Name} - PID={rndValues?.PID}");

        return (source.GetType().Name, targetType.Name) switch
        {
            // ("PK1", "PK7") => ((PK1)source).ConvertToPK7(),
            // ("PK2", "PK7") => ((PK2)source).ConvertToPK7(),

            // G2
            ("PK2", "SK2") => ((PK2)source).ConvertToSK2(),

            // G3  
            ("PK3", "CK3") => pk3Converter.ConvertToCK3Fixed((PK3)source, rndValues),
            ("PK3", "XK3") => pk3Converter.ConvertToXK3Fixed((PK3)source, rndValues),

            // G4
            ("PK4", "BK4") => pk4Converter.ConvertToBK4Fixed((PK4)source, rndValues),
            ("PK4", "RK4") => pk4Converter.ConvertToRK4Fixed((PK4)source, rndValues),

            // G7
            ("PK7", "PB7") => pk7Converter.ConvertToPB7((PK7)source, rndValues),

            // G8
            ("PK8", "PB8") => pk8Converter.ConvertToPB8((PK8)source, rndValues),
            ("PK8", "PA8") => pk8Converter.ConvertToPA8((PK8)source, rndValues),

            // G9
            ("PK9", "PA9") => pk9Converter.ConvertToPA9((PK9)source, rndValues),

            _ => null
        };
    }

    private PKM? TryForwardConversion(PKM source, LanguageID fallbackLang, PKMRndValues? rndValues)
    {
        // log.LogInformation($"Convert forward {source.GetType().Name} - PID={rndValues?.PID}");

        if (source is ITrainerInfo sourceTrainer)
        {
            RecentTrainerCache.SetRecentTrainer(sourceTrainer);
        }

        var pkm = TryVariantToPK(source, rndValues)
            ?? source.GetType().Name switch
            {
                "PK1" => ((PK1)source).ConvertToPK2(),
                "PK2" => pk2Converter.ConvertToPK3((PK2)source, fallbackLang, rndValues),
                "PK3" => pk3Converter.ConvertToPK4Fixed((PK3)source, rndValues),
                "PK4" => pk4Converter.ConvertToPK5Fixed((PK4)source, rndValues),
                "PK5" => pk5Converter.ConvertToPK6Fixed((PK5)source, rndValues),
                "PK6" => pk6Converter.ConvertToPK7Fixed((PK6)source, rndValues),
                "PK7" => pk7Converter.ConvertToPK8((PK7)source, rndValues),
                "PK8" => pk8Converter.ConvertToPK9((PK8)source, rndValues),

                _ => null
            };

        // Check unexpected nature changes after G2
        // if (pkm != null && source.Generation > 2 && source.Nature != pkm.Nature)
        // {
        //     throw new Exception($"Different nature {source.Nature} / {pkm.Nature} - PID={rndValues?.PID}");
        // }

        return pkm;
    }

    private PKM? TryBackwardConversion(PKM source, PKMRndValues? rndValues)
    {
        // log.LogInformation($"Convert backward {source.GetType().Name} - PID={rndValues?.PID}");

        if (source is ITrainerInfo sourceTrainer)
        {
            RecentTrainerCache.SetRecentTrainer(sourceTrainer);
        }

        var pkm = TryVariantToPK(source, rndValues)
            ?? source.GetType().Name switch
            {
                "PK9" => pk9Converter.ConvertToPK8((PK9)source, rndValues),
                "PK8" => pk8Converter.ConvertToPK7((PK8)source, rndValues),
                "PK7" => pk7Converter.ConvertToPK6((PK7)source, rndValues),
                "PK6" => pk6Converter.ConvertToPK5((PK6)source, rndValues),
                "PK5" => pk5Converter.ConvertToPK4((PK5)source, rndValues),
                "PK4" => pk4Converter.ConvertToPK3((PK4)source, rndValues),
                "PK3" => pk3Converter.ConvertToPK2((PK3)source, rndValues),
                "PK2" => ((PK2)source).ConvertToPK1(),

                _ => null
            };

        // Check unexpected nature changes before G2
        // if (pkm != null && pkm.Generation > 2 && source.Nature != pkm.Nature)
        // {
        //     throw new Exception($"Different nature {source.Nature} / {pkm.Nature} - PID={rndValues?.PID}");
        // }

        return pkm;
    }

    private PKM? TryVariantToPK(PKM source, PKMRndValues? rndValues)
    {
        // log.LogInformation($"Convert backward {source.GetType().Name} - PID={rndValues?.PID}");

        return source.GetType().Name switch
        {
            "SK2" => ((SK2)source).ConvertToPK2(),
            "CK3" => ((CK3)source).ConvertToPK3(),
            "XK3" => ((XK3)source).ConvertToPK3(),
            "BK4" => ((BK4)source).ConvertToPK4(),
            "RK4" => ((RK4)source).ConvertToPK4(),
            "PB7" => pk7Converter.ConvertToPK7((PB7)source, rndValues),
            "PB8" => pk8Converter.ConvertToPK8((PB8)source, rndValues),
            "PA8" => pk8Converter.ConvertToPK8((PA8)source, rndValues),
            "PA9" => pk9Converter.ConvertToPK9((PA9)source, rndValues),

            _ => null
        };
    }

    private static int GetPKMTypeWeight(Type pkmType) => pkmType.Name switch
    {
        "PK1" => 0,
        "PK2" => 1,
        "SK2" => 2,
        "PK3" => 3,
        "CK3" => 4,
        "XK3" => 5,
        "PK4" => 6,
        "BK4" => 7,
        "RK4" => 8,
        "PK5" => 9,
        "PK6" => 10,
        "PK7" => 11,
        "PB7" => 12,
        "PK8" => 13,
        "PB8" => 14,
        "PA8" => 15,
        "PK9" => 16,
        "PA9" => 17,

        _ => throw new ArgumentException($"PKM type not handled: {pkmType}"),
    };
}
