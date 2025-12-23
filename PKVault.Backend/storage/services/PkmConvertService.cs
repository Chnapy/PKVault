
using PKHeX.Core;

public class PkmConvertService
{
    public static PKM GetConvertedPkm(PKM sourcePkm, uint generation, uint? intermediatePid)
    {
        PKM? blankPkm = generation switch
        {
            1 => new PK1(),
            2 => new PK2(),
            3 => new PK3(),
            4 => new PK4(),
            5 => new PK5(),
            6 => new PK6(),
            7 => new PK7(),
            8 => new PK8(),
            9 => new PK9(),
            _ => default
        };
        if (blankPkm == default)
        {
            throw new Exception($"PKM case not found for generation={generation}");
        }

        return GetConvertedPkm(sourcePkm, blankPkm, intermediatePid);
    }

    public static PKM GetConvertedPkm(PKM sourcePkm, PKM blankPkm, uint? intermediatePid)
    {
        EntityConverter.AllowIncompatibleConversion = EntityCompatibilitySetting.AllowIncompatibleSane;

        if (!EntityConverter.IsCompatibleWithModifications(sourcePkm, blankPkm))
        {
            throw new Exception($"PKM conversion not possible, origin PKM not compatible with generation={blankPkm.Format}");
        }

        var intermediatePkm = GetIntermediatePkmConvert(sourcePkm, blankPkm.Format, intermediatePid);

        var converted = EntityConverter.TryMakePKMCompatible(
            intermediatePkm,
            blankPkm,
            out var result,
            out var destPkm
        );

        Console.WriteLine($"Convert result={result}");

        if (destPkm.Species != sourcePkm.Species)
        {
            throw new Exception($"PKM converted broken, species={destPkm.Species} original.species={sourcePkm.Species}");
        }

        if (result == EntityConverterResult.None)
        {
            return destPkm;
        }

        if (destPkm.Generation != blankPkm.Format)
        {
            destPkm.Version = GameUtil.GetVersion(blankPkm.Format);
            // Console.WriteLine($"Error convert gen - {destPkm.Species} / {destPkm.Version} / {destPkm.Generation}-{blankPkm.Format} / {result}");
        }

        PassAllToPkm(sourcePkm, destPkm);

        return destPkm;
    }

    private static PKM GetIntermediatePkmConvert(PKM sourcePkm, uint generation, uint? intermediatePid)
    {
        // G1-2 to G3+
        if (sourcePkm.Format <= 2 && generation > 2)
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

        PassIDBreakableToPkm(sourcePkm, pkmIntermediate);
        PassStaticsToPkm(sourcePkm, pkmIntermediate);
        PassDynamicsToPkm(sourcePkm, pkmIntermediate);
        PassHeldItemToPkm(sourcePkm, pkmIntermediate);

        pkmIntermediate.ResetPartyStats();
        pkmIntermediate.RefreshChecksum();

        Console.WriteLine($"[convert] pkm-intermediate G3, PID={pkmIntermediate.PID} Gender={pkmIntermediate.Gender} IsShiny={pkmIntermediate.IsShiny} Language={pkmIntermediate.Language} ");
        Console.WriteLine($"\tVersion={pkmIntermediate.Version} MetLocation={pkmIntermediate.MetLocation} MetLevel={pkmIntermediate.MetLevel} Ball={pkmIntermediate.Ball} FatefulEncounter={pkmIntermediate.FatefulEncounter}");

        return pkmIntermediate;
    }

    public static void PassAllToPkm(PKM sourcePkm, PKM destPkm)
    {
        PassIDBreakableToPkm(sourcePkm, destPkm);
        PassAllToPkmSafe(sourcePkm, destPkm);
    }

    public static void PassAllToPkmSafe(PKM sourcePkm, PKM destPkm)
    {
        PassStaticsToPkm(sourcePkm, destPkm);
        PassDynamicsToPkm(sourcePkm, destPkm);
        PassHeldItemToPkm(sourcePkm, destPkm);
        PassMovesToPkm(sourcePkm, destPkm);

        destPkm.ResetPartyStats();
        destPkm.RefreshChecksum();
    }

    public static void PassAllDynamicsNItemToPkm(PKM sourcePkm, PKM destPkm)
    {
        PassDynamicsToPkm(sourcePkm, destPkm);
        PassHeldItemToPkm(sourcePkm, destPkm);

        destPkm.ResetPartyStats();
        destPkm.RefreshChecksum();
    }

    private static void PassIDBreakableToPkm(PKM sourcePkm, PKM destPkm)
    {
        Func<int, int> convertIVFn = value => value;
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
    }

    private static void PassStaticsToPkm(PKM sourcePkm, PKM destPkm)
    {
        if (sourcePkm.Language != 0)
        {
            destPkm.Language = sourcePkm.Language;
        }

        destPkm.Gender = sourcePkm.Gender;

        destPkm.OriginalTrainerName = sourcePkm.OriginalTrainerName;

        ApplyAbilityToPkm(destPkm);

        destPkm.MetDate = sourcePkm.MetDate;
        // pkmConverted.MetLocation = pkmOrigin.MetLocation;

        if (sourcePkm.Format == destPkm.Format)
        {
            destPkm.Version = sourcePkm.Version;
            destPkm.FatefulEncounter = sourcePkm.FatefulEncounter;
            destPkm.MetLocation = sourcePkm.MetLocation;
            destPkm.MetLevel = sourcePkm.MetLevel;
            destPkm.Ball = sourcePkm.Ball;
        }
        else
        {
            if (destPkm is PB7 pb7)
            {
                // TODO use EntityContext.GetSingleGameVersion()
                pb7.Version = GameVersion.GO;
                pb7.MetLocation = 0;
            }
            else if (destPkm.Format == 3)
            {
                // pkmIntermediate.Origin
                // TODO use EntityContext.GetSingleGameVersion()
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
    }

    public static void PassDynamicsToPkm(PKM sourcePkm, PKM destPkm)
    {
        ApplyNicknameToPkm(destPkm, sourcePkm.Nickname, sourcePkm.IsNicknamed);

        destPkm.CurrentLevel = sourcePkm.CurrentLevel;
        destPkm.EXP = sourcePkm.EXP;

        Func<float, int> convertEVFn = value => (int)value;

        if (destPkm is PB7)
        {
            convertEVFn = value => (int)(value / sourcePkm.MaxEV * 200);
        }
        else if (sourcePkm is PB7)
        {
            convertEVFn = value => (int)(value / 200 * destPkm.MaxEV);
        }
        else if (sourcePkm.Format <= 2 && destPkm.Format > 2)
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

        ApplyEVsAVsToPkm(destPkm, evs);
    }

    private static void PassHeldItemToPkm(PKM sourcePkm, PKM destPkm)
    {
        if (destPkm is PB7 pb7)
        {
            pb7.ApplyHeldItem(0, destPkm.Context);
        }
        else
        {
            destPkm.ApplyHeldItem(sourcePkm.HeldItem, sourcePkm.Context);
        }
        // Console.WriteLine($"HELD-ITEM = {destPkm.HeldItem}");
    }

    public static void PassMovesToPkm(PKM sourcePkm, PKM destPkm)
    {
        Span<ushort> moves = stackalloc ushort[4];
        sourcePkm.GetMoves(moves);
        ApplyMovesToPkm(destPkm, moves);
    }

    public static void ApplyNicknameToPkm(PKM pkm, string nickname, bool sourcePkmIsNicknamed)
    {
        var language = GetPkmLanguage(pkm);

        if (!sourcePkmIsNicknamed)
        {
            nickname = "";
        }

        var defaultNickname = SpeciesName.GetSpeciesNameGeneration(pkm.Species, language, pkm.Format);
        if (defaultNickname.Length == 0)
        {
            Console.WriteLine($"defaultNickname EMPTY for SPECIES={pkm.Species} LANG={language} FORMAT={pkm.Format} NICKNAME={nickname}");
        }

        if (nickname.Trim().Length == 0)
        {
            nickname = defaultNickname;
        }

        if (nickname.Length > pkm.MaxStringLengthNickname)
        {
            nickname = nickname[..pkm.MaxStringLengthNickname];
        }

        var isNicknamed = SpeciesName.IsNicknamed(pkm.Species, nickname, language, pkm.Format)
            && !nickname.Equals(defaultNickname, StringComparison.InvariantCultureIgnoreCase);

        pkm.IsNicknamed = isNicknamed;
        pkm.Nickname = isNicknamed ? nickname : defaultNickname;

        // Console.WriteLine($"NICKNAME: {isNicknamed} {pkm.Nickname} expected={nickname} default={defaultNickname}");
    }

    public static void ApplyEVsAVsToPkm(PKM pkm, Span<int> evs)
    {
        if (pkm is PB7 pb7)
        {
            for (var i = 0; i < evs.Length; i++)
            {
                pb7.SetAV(i, (byte)evs.ToArray()[i]);
            }
        }
        else
        {
            pkm.SetEVs(evs);
        }
    }

    public static void ApplyAbilityToPkm(PKM pkm)
    {
        bool hasAbilityOrPidIssue() => new LegalityAnalysis(pkm).Results.Any(result =>
            !result.Valid
            && (result.Identifier == CheckIdentifier.Ability || result.Identifier == CheckIdentifier.PID)
        );
        for (var i = 0; i < pkm.PersonalInfo.AbilityCount && hasAbilityOrPidIssue(); i++)
        {
            pkm.RefreshAbility(i);
        }
    }

    public static void ApplyMovesToPkm(PKM pkm, Span<ushort> moves)
    {
        pkm.SetMoves(moves);
        pkm.FixMoves();
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

    public static int GetPkmLanguage(PKM pkm)
    {
        if (pkm is GBPKM gbpkm)
        {
            return gbpkm.IsSpeciesNameMatch(pkm.Language) ? pkm.Language : gbpkm.GuessedLanguage(pkm.Language);
        }

        return pkm.Language;
    }
}
