using PKHeX.Core;

public interface IPkmConvertService
{
    public ImmutablePKM ConvertTo(ImmutablePKM sourcePkm, EntityContext context);
    public ImmutablePKM ConvertTo(ImmutablePKM sourcePkm, Type targetPkmType, PKMRndValues? rndValues, SaveFile? targetSave = null);
}

public class PkmConvertService(ISettingsService settingsService) : IPkmConvertService
{
    public ImmutablePKM ConvertTo(ImmutablePKM sourcePkm, EntityContext context)
    {
        Console.WriteLine($"Convert {sourcePkm.GetMutablePkm().GetType().Name} -> context={context}");

        Type targetType = BlankSaveFile.Get(context).BlankPKM.GetType();

        return ConvertTo(sourcePkm, targetType, null);
    }

    public ImmutablePKM ConvertTo(ImmutablePKM sourcePkm, Type targetPkmType, PKMRndValues? rndValues, SaveFile? targetSave = null)
    {
        Console.WriteLine($"Convert {sourcePkm.GetMutablePkm().GetType().Name} -> {targetPkmType.Name}");

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

        result.FixCommonLegalityIssues(targetSave != null ? new(targetSave) : null);

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
        // Console.WriteLine($"Convert recursive {current.GetType().Name} -> {targetType.Name}");

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

    private static PKM? TryPKToVariant(PKM source, Type targetType, PKMRndValues? rndValues)
    {
        // Console.WriteLine($"Convert forward {source.GetType().Name} -> {targetType.Name} - PID={rndValues?.PID}");

        return (source.GetType().Name, targetType.Name) switch
        {
            // ("PK1", "PK7") => ((PK1)source).ConvertToPK7(),
            // ("PK2", "PK7") => ((PK2)source).ConvertToPK7(),

            // G2
            ("PK2", "SK2") => ((PK2)source).ConvertToSK2(),

            // G3  
            ("PK3", "CK3") => ((PK3)source).ConvertToCK3Fixed(rndValues),
            ("PK3", "XK3") => ((PK3)source).ConvertToXK3Fixed(rndValues),

            // G4
            ("PK4", "BK4") => ((PK4)source).ConvertToBK4Fixed(rndValues),
            ("PK4", "RK4") => ((PK4)source).ConvertToRK4Fixed(rndValues),

            // G7
            ("PK7", "PB7") => ((PK7)source).ConvertToPB7(rndValues),

            // G8
            ("PK8", "PB8") => ((PK8)source).ConvertToPB8(rndValues),
            ("PK8", "PA8") => ((PK8)source).ConvertToPA8(rndValues),

            // G9
            ("PK9", "PA9") => ((PK9)source).ConvertToPA9(rndValues),

            _ => null
        };
    }

    private static PKM? TryForwardConversion(PKM source, LanguageID fallbackLang, PKMRndValues? rndValues)
    {
        // Console.WriteLine($"Convert forward {source.GetType().Name} - PID={rndValues?.PID}");

        if (source is ITrainerInfo sourceTrainer)
        {
            RecentTrainerCache.SetRecentTrainer(sourceTrainer);
        }

        var pkm = TryVariantToPK(source, rndValues)
            ?? source.GetType().Name switch
            {
                "PK1" => ((PK1)source).ConvertToPK2(),
                "PK2" => ((PK2)source).ConvertToPK3(fallbackLang, rndValues),
                "PK3" => ((PK3)source).ConvertToPK4Fixed(rndValues),
                "PK4" => ((PK4)source).ConvertToPK5Fixed(rndValues),
                "PK5" => ((PK5)source).ConvertToPK6Fixed(rndValues),
                "PK6" => ((PK6)source).ConvertToPK7Fixed(rndValues),
                "PK7" => ((PK7)source).ConvertToPK8(rndValues),
                "PK8" => ((PK8)source).ConvertToPK9(rndValues),

                _ => null
            };

        // Check unexpected nature changes after G2
        // if (pkm != null && source.Generation > 2 && source.Nature != pkm.Nature)
        // {
        //     throw new Exception($"Different nature {source.Nature} / {pkm.Nature} - PID={rndValues?.PID}");
        // }

        return pkm;
    }

    private static PKM? TryBackwardConversion(PKM source, PKMRndValues? rndValues)
    {
        // Console.WriteLine($"Convert backward {source.GetType().Name} - PID={rndValues?.PID}");

        if (source is ITrainerInfo sourceTrainer)
        {
            RecentTrainerCache.SetRecentTrainer(sourceTrainer);
        }

        var pkm = TryVariantToPK(source, rndValues)
            ?? source.GetType().Name switch
            {
                "PK9" => ((PK9)source).ConvertToPK8(rndValues),
                "PK8" => ((PK8)source).ConvertToPK7(rndValues),
                "PK7" => ((PK7)source).ConvertToPK6(rndValues),
                "PK6" => ((PK6)source).ConvertToPK5(rndValues),
                "PK5" => ((PK5)source).ConvertToPK4(rndValues),
                "PK4" => ((PK4)source).ConvertToPK3(rndValues),
                "PK3" => ((PK3)source).ConvertToPK2(rndValues),
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

    private static PKM? TryVariantToPK(PKM source, PKMRndValues? rndValues)
    {
        // Console.WriteLine($"Convert backward {source.GetType().Name} - PID={rndValues?.PID}");

        return source.GetType().Name switch
        {
            "SK2" => ((SK2)source).ConvertToPK2(),
            "CK3" => ((CK3)source).ConvertToPK3(),
            "XK3" => ((XK3)source).ConvertToPK3(),
            "BK4" => ((BK4)source).ConvertToPK4(),
            "RK4" => ((RK4)source).ConvertToPK4(),
            "PB7" => ((PB7)source).ConvertToPK7(rndValues),
            "PB8" => ((PB8)source).ConvertToPK8(rndValues),
            "PA8" => ((PA8)source).ConvertToPK8(rndValues),
            "PA9" => ((PA9)source).ConvertToPK9(rndValues),

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
