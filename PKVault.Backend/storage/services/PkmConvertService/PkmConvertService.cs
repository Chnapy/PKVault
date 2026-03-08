using PKHeX.Core;

public interface IPkmConvertService
{
    public ImmutablePKM ConvertTo(ImmutablePKM sourcePkm, uint generation);
    public ImmutablePKM ConvertToExisting(ImmutablePKM sourcePkm, PKM existingTargetPkm, bool keepMoves);
    public ImmutablePKM ConvertTo(ImmutablePKM sourcePkm, Type targetPkmType, PKMRndValues? rndValues, SaveFile? targetSave = null);
}

public class PkmConvertService(ISettingsService settingsService) : IPkmConvertService
{
    public ImmutablePKM ConvertTo(ImmutablePKM sourcePkm, uint generation)
    {
        Console.WriteLine($"Convert {sourcePkm.GetMutablePkm().GetType().Name} -> G{generation}");

        Type targetType = generation switch
        {
            1 => typeof(PK1),
            2 => typeof(PK2),
            3 => typeof(PK3),
            4 => typeof(PK4),
            5 => typeof(PK5),
            6 => typeof(PK6),
            7 => typeof(PK7),
            8 => typeof(PK8),
            9 => typeof(PK9),
            _ => throw new Exception($"PKM case not found for generation={generation}")
        };

        return ConvertTo(sourcePkm, targetType, null);
    }

    public ImmutablePKM ConvertToExisting(ImmutablePKM sourcePkm, PKM existingTargetPkm, bool keepMoves)
    {
        Console.WriteLine($"Convert existing {sourcePkm.GetMutablePkm().GetType().Name} -> {existingTargetPkm.GetType().Name} keepMoves={keepMoves}");

        if (existingTargetPkm.Species == 0)
        {
            throw new Exception($"Invalid existingTargetPkm = {existingTargetPkm.GetType().Name}");
        }

        var result = ConvertTo(
            sourcePkm,
            existingTargetPkm.GetType(),
            existingTargetPkm is GBPKM
                ? null
                : new(
                    PID: existingTargetPkm.PID,
                    EncryptionConstant: existingTargetPkm.EncryptionConstant
                )
        );

        if (keepMoves)
        {
            result = result.Update(pkm =>
            {
                pkm.CopyMovesFrom(existingTargetPkm);

                pkm.Heal();
                pkm.ResetPartyStats();
                pkm.RefreshChecksum();
            });
        }

        return result;
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
        }

        result.FixCommonLegalityIssues();

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
        Console.WriteLine($"Convert recursive {current.GetType().Name} -> {targetType.Name}");

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
        Console.WriteLine($"Convert forward {source.GetType().Name} -> {targetType.Name} - PID={rndValues?.PID}");

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
        Console.WriteLine($"Convert forward {source.GetType().Name} - PID={rndValues?.PID}");

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
        Console.WriteLine($"Convert backward {source.GetType().Name} - PID={rndValues?.PID}");

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
        Console.WriteLine($"Convert backward {source.GetType().Name} - PID={rndValues?.PID}");

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
