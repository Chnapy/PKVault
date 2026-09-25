using PKHeX.Core;
using Serilog;

namespace PKVault.Core;

public interface IPkmConvertService
{
    public ImmutablePKM ConvertTo(ImmutablePKM sourcePkm, EntityContext context);
    public ImmutablePKM ConvertTo(ImmutablePKM sourcePkm, Type targetPkmType, ConvertContext? ctx);
}

public class PkmConvertService(ISettingsService settingsService, ILegalityAnalysisService legalityAnalysisService) : IPkmConvertService
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
        Log.Debug($"Convert {sourcePkm.GetMutablePkm().GetType().Name} -> context={context}");

        Type targetType = BlankSaveFile.Get(context).BlankPKM.GetType();

        return ConvertTo(sourcePkm, targetType, null);
    }

    public ImmutablePKM ConvertTo(ImmutablePKM sourcePkm, Type targetPkmType, ConvertContext? ctx)
    {
        Log.Debug($"Convert {sourcePkm.GetMutablePkm().GetType().Name} -> {targetPkmType.Name}");

        ctx ??= new(null, null);

        var fallbackLang = settingsService.GetSettings().GetSafeLanguageID();

        var result = ConvertRecursive(sourcePkm.GetMutablePkm().Clone(), targetPkmType, fallbackLang, ctx);

        if (result.GetType() != targetPkmType)
            throw new InvalidOperationException($"Failed to convert to {targetPkmType.Name}");

        pkmConverterUtils.FixCommonLegalityIssues(result, ctx);

        result.Heal();
        result.ResetPartyStats();
        result.RefreshChecksum();

        if (result.Species == 0)
        {
            throw new Exception($"Convert failed, Species=0");
        }

        if (sourcePkm.Species > result.MaxSpeciesID)
        {
            throw new InvalidOperationException($"Species incompatible: {sourcePkm.Species} > {result.MaxSpeciesID}");
        }

        return new(result);
    }

    private PKM ConvertRecursive(PKM current, Type targetType, LanguageID fallbackLang, ConvertContext ctx)
    {
        // log.LogInformation($"Convert recursive {current.GetType().Name} -> {targetType.Name}");

        var currentValue = GetPKMTypeWeight(current.GetType());
        var targetValue = GetPKMTypeWeight(targetType);
        var direction = targetValue - currentValue;

        if (current.GetType() == targetType)
            return current;

        if (direction > 0)
        {

            var direct = TryPKToVariant(current, targetType, ctx);
            if (direct != null)
                return ConvertRecursive(direct, targetType, fallbackLang, ctx);

            var forward = TryForwardConversion(current, fallbackLang, ctx);
            if (forward != null)
                return ConvertRecursive(forward, targetType, fallbackLang, ctx);
        }
        else
        {

            var backward = TryBackwardConversion(current, ctx);
            if (backward != null)
                return ConvertRecursive(backward, targetType, fallbackLang, ctx);
        }

        throw new InvalidOperationException($"No conversion path from {current.GetType().Name} to {targetType.Name}");
    }

    private PKM? TryPKToVariant(PKM source, Type targetType, ConvertContext ctx)
    {
        // log.LogInformation($"Convert forward {source.GetType().Name} -> {targetType.Name} - PID={ctx.PID}");

        return (source.GetType().Name, targetType.Name) switch
        {
            // ("PK1", "PK7") => ((PK1)source).ConvertToPK7(),
            // ("PK2", "PK7") => ((PK2)source).ConvertToPK7(),

            // G2
            ("PK2", "SK2") => ((PK2)source).ConvertToSK2(),

            // G3  
            ("PK3", "CK3") => pk3Converter.ConvertToCK3Fixed((PK3)source, ctx),
            ("PK3", "XK3") => pk3Converter.ConvertToXK3Fixed((PK3)source, ctx),

            // G4
            ("PK4", "BK4") => pk4Converter.ConvertToBK4Fixed((PK4)source, ctx),
            ("PK4", "RK4") => pk4Converter.ConvertToRK4Fixed((PK4)source, ctx),

            // G7
            ("PK7", "PB7") => pk7Converter.ConvertToPB7((PK7)source, ctx),

            // G8
            ("PK8", "PB8") => pk8Converter.ConvertToPB8((PK8)source, ctx),
            ("PK8", "PA8") => pk8Converter.ConvertToPA8((PK8)source, ctx),

            // G9
            ("PK9", "PA9") => pk9Converter.ConvertToPA9((PK9)source, ctx),

            _ => null
        };
    }

    private PKM? TryForwardConversion(PKM source, LanguageID fallbackLang, ConvertContext ctx)
    {
        // log.LogInformation($"Convert forward {source.GetType().Name} - PID={ctx.PID}");

        if (source is ITrainerInfo sourceTrainer)
        {
            RecentTrainerCache.SetRecentTrainer(sourceTrainer);
        }

        var pkm = TryVariantToPK(source, ctx)
            ?? source.GetType().Name switch
            {
                "PK1" => ((PK1)source).ConvertToPK2(),
                "PK2" => pk2Converter.ConvertToPK3((PK2)source, fallbackLang, ctx),
                "PK3" => pk3Converter.ConvertToPK4Fixed((PK3)source, ctx),
                "PK4" => pk4Converter.ConvertToPK5Fixed((PK4)source, ctx),
                "PK5" => pk5Converter.ConvertToPK6Fixed((PK5)source, ctx),
                "PK6" => pk6Converter.ConvertToPK7Fixed((PK6)source, ctx),
                "PK7" => pk7Converter.ConvertToPK8((PK7)source, ctx),
                "PK8" => pk8Converter.ConvertToPK9((PK8)source, ctx),

                _ => null
            };

        // Check unexpected nature changes after G2
        // if (pkm != null && source.Generation > 2 && source.Nature != pkm.Nature)
        // {
        //     throw new Exception($"Different nature {source.Nature} / {pkm.Nature} - PID={ctx.PID}");
        // }

        return pkm;
    }

    private PKM? TryBackwardConversion(PKM source, ConvertContext ctx)
    {
        // log.LogInformation($"Convert backward {source.GetType().Name} - PID={ctx.PID}");

        if (source is ITrainerInfo sourceTrainer)
        {
            RecentTrainerCache.SetRecentTrainer(sourceTrainer);
        }

        var pkm = TryVariantToPK(source, ctx)
            ?? source.GetType().Name switch
            {
                "PK9" => pk9Converter.ConvertToPK8((PK9)source, ctx),
                "PK8" => pk8Converter.ConvertToPK7((PK8)source, ctx),
                "PK7" => pk7Converter.ConvertToPK6((PK7)source, ctx),
                "PK6" => pk6Converter.ConvertToPK5((PK6)source, ctx),
                "PK5" => pk5Converter.ConvertToPK4((PK5)source, ctx),
                "PK4" => pk4Converter.ConvertToPK3((PK4)source, ctx),
                "PK3" => pk3Converter.ConvertToPK2((PK3)source, ctx),
                "PK2" => ((PK2)source).ConvertToPK1(),

                _ => null
            };

        // Check unexpected nature changes before G2
        // if (pkm != null && pkm.Generation > 2 && source.Nature != pkm.Nature)
        // {
        //     throw new Exception($"Different nature {source.Nature} / {pkm.Nature} - PID={ctx.PID}");
        // }

        return pkm;
    }

    private PKM? TryVariantToPK(PKM source, ConvertContext ctx)
    {
        // log.LogInformation($"Convert backward {source.GetType().Name} - PID={ctx.PID}");

        return source.GetType().Name switch
        {
            "SK2" => ((SK2)source).ConvertToPK2(),
            "CK3" => ((CK3)source).ConvertToPK3(),
            "XK3" => ((XK3)source).ConvertToPK3(),
            "BK4" => ((BK4)source).ConvertToPK4(),
            "RK4" => ((RK4)source).ConvertToPK4(),
            "PB7" => pk7Converter.ConvertToPK7((PB7)source, ctx),
            "PB8" => pk8Converter.ConvertToPK8((PB8)source, ctx),
            "PA8" => pk8Converter.ConvertToPK8((PA8)source, ctx),
            "PA9" => pk9Converter.ConvertToPK9((PA9)source, ctx),

            _ => null
        };
    }

    public static int GetPKMTypeWeight(Type pkmType) => pkmType.Name switch
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
