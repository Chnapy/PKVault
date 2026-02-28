using PKHeX.Core;

public class PkmConvertService2
{
    public PKM ConvertTo(PKM sourcePkm, PKM blankTargetPkm)
    {
        var result = ConvertRecursive(sourcePkm.Clone(), blankTargetPkm.GetType());

        if (result.GetType() != blankTargetPkm.GetType())
            throw new InvalidOperationException($"Failed to convert to {blankTargetPkm.GetType().Name}");

        result.ResetPartyStats();
        result.RefreshChecksum();

        return result;
    }

    private PKM ConvertRecursive(PKM current, Type targetType)
    {
        if (current.GetType() == targetType)
            return current;

        var direct = TryPKToVariant(current, targetType);
        if (direct != null)
            return ConvertRecursive(direct, targetType);

        var forward = TryForwardConversion(current);
        if (forward != null)
            return ConvertRecursive(forward, targetType);

        var backward = TryBackwardConversion(current);
        if (backward != null)
            return ConvertRecursive(backward, targetType);

        throw new InvalidOperationException($"No conversion path from {current.GetType().Name} to {targetType.Name}");
    }

    private static PKM? TryPKToVariant(PKM source, Type targetType)
    {
        return (source.GetType().Name, targetType.Name) switch
        {
            // ("PK1", "PK7") => ((PK1)source).ConvertToPK7(),
            // ("PK2", "PK7") => ((PK2)source).ConvertToPK7(),

            // G2
            ("PK2", "SK2") => ((PK2)source).ConvertToSK2(),

            // G3  
            ("PK3", "CK3") => ((PK3)source).ConvertToCK3(),
            ("PK3", "XK3") => ((PK3)source).ConvertToXK3(),

            // G4
            ("PK4", "BK4") => ((PK4)source).ConvertToBK4(),
            ("PK4", "RK4") => ((PK4)source).ConvertToRK4(),

            // G7
            ("PK7", "PB7") => ((PK7)source).ConvertToPB7(),

            // G8
            ("PK8", "PB8") => ((PK8)source).ConvertToPB8(),
            ("PK8", "PA8") => ((PK8)source).ConvertToPA8(),

            // G9
            ("PK9", "PA9") => ((PK9)source).ConvertToPA9(),

            _ => null
        };
    }

    private static PKM? TryForwardConversion(PKM source)
    {
        var pkm = TryVariantToPK(source)
            ?? source.GetType().Name switch
            {
                "PK1" => ((PK1)source).ConvertToPK2(),
                "PK2" => ((PK2)source).ConvertToPK3(),
                "PK3" => ((PK3)source).ConvertToPK4(),
                "PK4" => ((PK4)source).ConvertToPK5(),
                "PK5" => ((PK5)source).ConvertToPK6(),
                "PK6" => ((PK6)source).ConvertToPK7(),
                "PK7" => ((PK7)source).ConvertToPK8(),
                "PK8" => ((PK8)source).ConvertToPK9(),

                _ => null
            };

        // Check unexpected nature changes after G2
        if (source.Generation > 2 && source.Nature != pkm.Nature)
        {
            throw new Exception($"Different nature {source.Nature} / {pkm.Nature}");
        }

        return pkm;
    }

    private static PKM? TryBackwardConversion(PKM source)
    {
        var pkm = TryVariantToPK(source)
            ?? source.GetType().Name switch
            {
                "PK9" => ((PK9)source).ConvertToPK8(),
                "PK8" => ((PK8)source).ConvertToPK7(),
                "PK7" => ((PK7)source).ConvertToPK6(),
                "PK6" => ((PK6)source).ConvertToPK5(),
                "PK5" => ((PK5)source).ConvertToPK4(),
                "PK4" => ((PK4)source).ConvertToPK3(),
                "PK3" => ((PK3)source).ConvertToPK2(),
                "PK2" => ((PK2)source).ConvertToPK1(),

                _ => null
            };

        // Check unexpected nature changes before G2
        if (pkm.Generation > 2 && source.Nature != pkm.Nature)
        {
            throw new Exception($"Different nature {source.Nature} / {pkm.Nature}");
        }

        return pkm;
    }

    private static PKM? TryVariantToPK(PKM source)
    {
        return source.GetType().Name switch
        {
            "SK2" => ((SK2)source).ConvertToPK2(),
            "CK3" => ((CK3)source).ConvertToPK3(),
            "XK3" => ((XK3)source).ConvertToPK3(),
            "BK4" => ((BK4)source).ConvertToPK4(),
            "RK4" => ((RK4)source).ConvertToPK4(),
            "PB7" => ((PB7)source).ConvertToPK7(),
            "PB8" => ((PB8)source).ConvertToPK8(),
            "PA8" => ((PA8)source).ConvertToPK8(),

            _ => null
        };
    }
}
