
using PKHeX.Core;

public class PkmConvertService
{
    public static PKM GetConvertedPkm(PKM sourcePkm, uint generation, uint? intermediatePid)
    {
        EntityConverter.AllowIncompatibleConversion = EntityCompatibilitySetting.AllowIncompatibleSane;

        PKM? blankPkm = generation switch
        {
            1 => new PK1(),
            2 => new PK2(),
            3 => new PK3(),
            4 => new PK4(),
            5 => new PK5(),
            7 => new PK7(),
            _ => default
        };
        if (blankPkm == default)
        {
            throw new Exception($"PKM case not found for generation={generation}");
        }

        if (!EntityConverter.IsCompatibleWithModifications(sourcePkm, blankPkm))
        {
            throw new Exception($"PKM conversion not possible, origin PKM not compatible with generation={generation}");
        }

        var intermediatePkm = GetIntermediatePkmConvert(sourcePkm, generation, intermediatePid);

        var converted = EntityConverter.TryMakePKMCompatible(
            intermediatePkm,
            blankPkm,
            out var result,
            out var destPkm
        );

        if (destPkm.Species != sourcePkm.Species)
        {
            throw new Exception($"PKM converted broken, species={destPkm.Species} original.species={sourcePkm.Species}");
        }

        Console.WriteLine($"Convert result={result}");

        if (result == EntityConverterResult.None)
        {
            return destPkm;
        }

        PassStaticsToPkm(sourcePkm, destPkm);
        PassDynamicsToPkm(sourcePkm, destPkm);
        PassHeldItemToPkm(sourcePkm, destPkm);

        destPkm.RefreshChecksum();

        return destPkm;
    }

    private static PKM GetIntermediatePkmConvert(PKM sourcePkm, uint generation, uint? intermediatePid)
    {
        // G1-2 to G3+
        if (sourcePkm.Generation <= 2 && generation > 2)
        {
            return GetIntermediateConvertG2ToG3(sourcePkm, intermediatePid);
        }

        return sourcePkm;
    }

    private static PKM GetIntermediateConvertG2ToG3(PKM sourcePkm, uint? intermediatePid)
    {
        var pkmIntermediate = EntityConverter.ConvertToType(sourcePkm, new PK3().GetType(), out var intermediateResult);
        Console.WriteLine($"Convert-intermediate result={intermediateResult}");

        if (pkmIntermediate == default)
        {
            throw new Exception($"Convert-intermediate failed, result={intermediateResult}");
        }

        // pkmIntermediate.Language = (int)LanguageID.French; //pkmOrigin.Language;
        // if (pkmIntermediate is IHandlerLanguage pkmIntermediateHLang)
        // {
        //     pkmIntermediateHLang.HandlingTrainerLanguage = (byte)LanguageID.French;
        // }

        // allow to keep same generated PID between memory => file loaders
        // because PID is randomly generated
        if (intermediatePid != null)
        {
            pkmIntermediate.PID = (uint)intermediatePid;
        }
        else
        {
            if (sourcePkm.IsShiny)
            {
                CommonEdits.SetShiny(pkmIntermediate, Shiny.Random);
            }
            else
            {
                pkmIntermediate.SetPIDGender(sourcePkm.Gender);
            }
        }

        // pkmIntermediate.Origin
        // pkmIntermediate.Version = GameVersion.E;
        // pkmIntermediate.FatefulEncounter = false;
        // pkmIntermediate.MetLocation = 0;
        // pkmIntermediate.MetLevel = 0;
        // pkmIntermediate.Ball = (byte)Ball.Poke; //pkmOrigin.Ball;

        PassStaticsToPkm(sourcePkm, pkmIntermediate);
        PassDynamicsToPkm(sourcePkm, pkmIntermediate);
        PassHeldItemToPkm(sourcePkm, pkmIntermediate);

        pkmIntermediate.RefreshChecksum();

        Console.WriteLine($"[convert] pkm-intermediate G3, PID={pkmIntermediate.PID} Gender={pkmIntermediate.Gender} IsShiny={pkmIntermediate.IsShiny} Language={pkmIntermediate.Language} ");
        Console.WriteLine($"\tVersion={pkmIntermediate.Version} MetLocation={pkmIntermediate.MetLocation} MetLevel={pkmIntermediate.MetLevel} Ball={pkmIntermediate.Ball} FatefulEncounter={pkmIntermediate.FatefulEncounter}");

        return pkmIntermediate;
    }

    private static void PassStaticsToPkm(PKM sourcePkm, PKM destPkm)
    {
        destPkm.Language = (int)LanguageID.French; //pkmOrigin.Language;
        if (destPkm is IHandlerLanguage pkmIntermediateHLang)
        {
            pkmIntermediateHLang.HandlingTrainerLanguage = (byte)LanguageID.French;
        }

        destPkm.OriginalTrainerName = sourcePkm.OriginalTrainerName;

        Func<int, int> convertIVFn = (int value) => value;
        if (sourcePkm.Format <= 2 && destPkm.Format > 2)
        {
            convertIVFn = ConvertIVG2ToG3;
        }
        else if (destPkm.Format <= 2 && sourcePkm.Format > 2)
        {
            convertIVFn = ConvertIVG3ToG2;
        }

        Span<int> ivs = [
            convertIVFn(sourcePkm.IV_HP),
            convertIVFn(sourcePkm.IV_ATK),
            convertIVFn(sourcePkm.IV_DEF),
            convertIVFn(sourcePkm.IV_SPE),
            convertIVFn(sourcePkm.IV_SPA),
            convertIVFn(sourcePkm.IV_SPD),
        ];
        destPkm.SetIVs(ivs);

        destPkm.MetDate = sourcePkm.MetDate;
        // pkmConverted.MetLocation = pkmOrigin.MetLocation;

        if (destPkm.Format == 3)
        {
            // pkmIntermediate.Origin
            destPkm.Version = GameVersion.E;
            destPkm.FatefulEncounter = false;
            destPkm.MetLocation = 0;
            destPkm.MetLevel = 0;
            destPkm.Ball = (byte)Ball.Poke; //pkmOrigin.Ball;
        }
        else if (destPkm.Format <= 2)
        {
            destPkm.MetLocation = 0;
            destPkm.MetLevel = 0;

            if (destPkm is ICaughtData2 destPkmG2)
            {
                destPkmG2.MetTimeOfDay = 0;
            }
        }
    }

    public static void PassDynamicsToPkm(PKM sourcePkm, PKM destPkm)
    {
        ApplyNicknameToPkm(destPkm, sourcePkm.Nickname);

        destPkm.CurrentLevel = sourcePkm.CurrentLevel;
        destPkm.EXP = sourcePkm.EXP;

        Func<float, int> convertEVFn = (float value) => (int)value;
        if (sourcePkm.Format <= 2 && destPkm.Format > 2)
        {
            convertEVFn = ConvertEVG2ToG3;
        }
        else if (destPkm.Format <= 2 && sourcePkm.Format > 2)
        {
            convertEVFn = ConvertEVG3ToG2;
        }

        Span<int> evs = [
            convertEVFn(sourcePkm.EV_HP),
            convertEVFn(sourcePkm.EV_ATK),
            convertEVFn(sourcePkm.EV_DEF),
            convertEVFn(sourcePkm.EV_SPE),
            convertEVFn(sourcePkm.EV_SPA),
            convertEVFn(sourcePkm.EV_SPD),
        ];

        ApplyEVsToPkm(destPkm, evs);
    }

    public static void PassHeldItemToPkm(PKM sourcePkm, PKM destPkm)
    {
        destPkm.ApplyHeldItem(sourcePkm.HeldItem, sourcePkm.Context);

        Console.WriteLine($"HELD-ITEM = {destPkm.HeldItem}");
    }

    public static void ApplyNicknameToPkm(PKM pkm, string nickname)
    {
        var generation = pkm.Format;

        var defaultNickname = SpeciesName.GetSpeciesNameGeneration(pkm.Species, (int)LanguageID.French, pkm.Format);
        if (nickname.Length == 0)
        {
            nickname = defaultNickname;
        }

        if (nickname.Length > pkm.MaxStringLengthNickname)
        {
            nickname = nickname[..pkm.MaxStringLengthNickname];
        }

        var isNicknamed = SpeciesName.IsNicknamed(pkm.Species, nickname, (int)LanguageID.French, generation) && !nickname.Equals(defaultNickname, StringComparison.InvariantCultureIgnoreCase);

        pkm.IsNicknamed = isNicknamed;
        pkm.Nickname = isNicknamed ? nickname : defaultNickname;

        // Console.WriteLine($"NICKNAME: {isNicknamed} {pkm.Nickname} expected={nickname} default={defaultNickname}");
    }

    public static void ApplyEVsToPkm(PKM pkm, Span<int> evs)
    {
        pkm.SetEVs(evs);
    }

    public static void ApplyMovesToPkm(PKM pkm, Span<ushort> moves)
    {
        pkm.SetMoves(moves);
    }

    private static int ConvertEVG2ToG3(float evValue)
    {
        return (int)(evValue / 65535 * 255);
    }

    private static int ConvertEVG3ToG2(float evValue)
    {
        return (int)(evValue * 65535 / 255);
    }

    private static int ConvertIVG2ToG3(int ivValue)
    {
        return ivValue * 2 + (ivValue % 2);
    }

    private static int ConvertIVG3ToG2(int ivValue)
    {
        return ivValue / 2;
    }
}
