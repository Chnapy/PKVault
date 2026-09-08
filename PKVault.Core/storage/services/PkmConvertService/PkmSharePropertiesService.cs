using PKHeX.Core;
using Serilog;

namespace PKVault.Core;

public interface IPkmSharePropertiesService
{
    public void SharePropertiesTo(ImmutablePKM source, PKM targetPkm, SaveFile? save);
}

/**
 * Share properties from a PKM source to a PKM target,
 * handling all convert requirements and contexts differences.
 */
public class PkmSharePropertiesService(IPkmConvertService pkmConvertService, ILegalityAnalysisService legalityAnalysisService) : IPkmSharePropertiesService
{
    private readonly PKMConverterUtils utils = new(legalityAnalysisService);

    public void SharePropertiesTo(ImmutablePKM source, PKM targetPkm, SaveFile? save)
    {
        var sourcePkm = source.GetMutablePkm();

        Log.Logger.Debug($"Convert existing {sourcePkm.GetType().Name} -> {targetPkm.GetType().Name}");

        if (targetPkm.Species == 0)
        {
            throw new Exception($"Invalid targetPkm = {targetPkm.GetType().Name}");
        }

        var noConvertNeeded = sourcePkm.GetType() == targetPkm.GetType();

        var result = pkmConvertService.ConvertTo(
            source,
            targetPkm.GetType(),
            targetPkm is GBPKM
                ? null
                : new(
                    PID: targetPkm.PID,
                    EncryptionConstant: targetPkm.EncryptionConstant
                ),
            save
        );

        var resultPkm = result.GetMutablePkm();

        targetPkm.Species = resultPkm.Species;

        if (sourcePkm is not PK1)
        {
            targetPkm.Gender = resultPkm.Gender;
            targetPkm.Form = resultPkm.Form;
            if (targetPkm is IFormArgument targetPkmForm && resultPkm is IFormArgument resultPkmForm)
            {
                targetPkmForm.FormArgument = resultPkmForm.FormArgument;
                targetPkmForm.FormArgumentElapsed = resultPkmForm.FormArgumentElapsed;
                targetPkmForm.FormArgumentMaximum = resultPkmForm.FormArgumentMaximum;
                targetPkmForm.FormArgumentRemain = resultPkmForm.FormArgumentRemain;
            }
        }

        if (sourcePkm is not GBPKM)
        {
            targetPkm.Nature = resultPkm.Nature;
            targetPkm.StatAlignment = resultPkm.StatAlignment;
            targetPkm.PID = resultPkm.PID;

            if (targetPkm.Format >= 6 && (targetPkm.Gen3 || targetPkm.Gen4 || targetPkm.Gen5))
            {
                targetPkm.EncryptionConstant = targetPkm.PID;
            }

            targetPkm.Ability = resultPkm.Ability;
        }

        targetPkm.Language = resultPkm.Language;

        if (sourcePkm is not PB7)
        {
            var resultIVs = utils.GetAllIVs(resultPkm);
            var targetIVs = utils.GetAllIVs(targetPkm);
            var passIVs = true;
            for (var i = 0; i < resultIVs.Length; i++)
            {
                if (resultIVs[i] < targetIVs[i])
                {
                    passIVs = false;
                    break;
                }
            }
            if (passIVs)
            {
                utils.CopyIVsFrom(targetPkm, resultPkm);
            }
        }

        targetPkm.IsNicknamed = resultPkm.IsNicknamed;
        if (!targetPkm.IsNicknamed)
            targetPkm.ClearNickname();
        else if (targetPkm.MaxStringLengthNickname <= sourcePkm.MaxStringLengthNickname
            || !targetPkm.Nickname.StartsWith(resultPkm.Nickname))
        {
            // some characters may change over generations
            // eg: G5/CH'DING G6/CH’DING G1/CH DING
            // https://github.com/Chnapy/PKVault/issues/205
            if (targetPkm.Nickname.Replace('’', '\'').Replace(' ', '\'') != resultPkm.Nickname.Replace('’', '\'').Replace(' ', '\''))
                targetPkm.Nickname = resultPkm.Nickname;
        }

        targetPkm.CurrentLevel = resultPkm.CurrentLevel;
        targetPkm.EXP = resultPkm.EXP;

        if (sourcePkm is not PK1)
        {
            targetPkm.CurrentFriendship = resultPkm.CurrentFriendship;
        }

        if (
            targetPkm is IObedienceLevel targetPkmOL
            && resultPkm is IObedienceLevel resultPkmOL
        )
        {
            targetPkmOL.ObedienceLevel = resultPkmOL.ObedienceLevel;
        }

        if (targetPkm is PB7 targetPb7
            && resultPkm is PB7 resultPb7)
        {
            targetPb7.AV_HP = resultPb7.AV_HP;
            targetPb7.AV_ATK = resultPb7.AV_ATK;
            targetPb7.AV_DEF = resultPb7.AV_DEF;
            targetPb7.AV_SPE = resultPb7.AV_SPE;
            targetPb7.AV_SPA = resultPb7.AV_SPA;
            targetPb7.AV_SPD = resultPb7.AV_SPD;
        }
        else
        {
            utils.CopyEVsFrom(targetPkm, resultPkm);
        }

        if (sourcePkm is ITeraType)
        {
            if (
                targetPkm is ITeraType targetPkmTera
                && resultPkm is ITeraType resultPkmTera
            )
            {
                targetPkmTera.TeraTypeOriginal = resultPkmTera.TeraTypeOriginal;
                targetPkmTera.TeraTypeOverride = resultPkmTera.TeraTypeOverride;
            }
        }

        if (sourcePkm is not PK1)
        {
            if (
                targetPkm is not PK1
                && resultPkm is not PK1
            )
            {
                targetPkm.PokerusDays = resultPkm.PokerusDays;
                targetPkm.PokerusStrain = resultPkm.PokerusStrain;
            }
        }
        
        if (source.Format >= 2
            && sourcePkm is not PB7
            && sourcePkm is not PA8
        )
        {
            utils.CopyHeldItemFrom(targetPkm, resultPkm.HeldItem, resultPkm.Context, resultPkm.Version);
        }

        if (sourcePkm is IAppliedMarkings)
        {
            if (targetPkm is IAppliedMarkings<bool> targetPkmMarking
                && resultPkm is IAppliedMarkings<bool> resultPkmMarking
            )
            {
                for (var i = 0; i < targetPkmMarking.MarkingCount; i++)
                {
                    targetPkmMarking.SetMarking(i, resultPkmMarking.GetMarking(i));
                }
            }
            else if (targetPkm is IAppliedMarkings<MarkingColor> targetPkmMarking2
                && resultPkm is IAppliedMarkings<MarkingColor> resultPkmMarking2
            )
            {
                for (var i = 0; i < targetPkmMarking2.MarkingCount; i++)
                {
                    targetPkmMarking2.SetMarking(i, resultPkmMarking2.GetMarking(i));
                }
            }
        }

        if (sourcePkm is IContestStatsReadOnly)
        {
            if (
                targetPkm is IContestStats targetPkmContest
                && resultPkm is IContestStatsReadOnly resultPkmContest
            )
            {
                resultPkmContest.CopyContestStatsTo(targetPkmContest);
            }
        }

        if (sourcePkm is IRibbonSetCommon3)
        {
            if (
                targetPkm is IRibbonSetCommon3 targetPkmCommon3
                && resultPkm is IRibbonSetCommon3 resultPkmCommon3
            )
            {
                resultPkmCommon3.CopyRibbonSetCommon3(targetPkmCommon3);
            }
        }

        if (sourcePkm is IRibbonSetEvent3)
        {
            if (
                targetPkm is IRibbonSetEvent3 targetPkmEvent3
                && resultPkm is IRibbonSetEvent3 resultPkmEvent3
            )
            {
                resultPkmEvent3.CopyRibbonSetEvent3(targetPkmEvent3);
            }
        }

        if (sourcePkm is IRibbonSetCommon4)
        {
            if (
                targetPkm is IRibbonSetCommon4 targetPkmCommon4
                && resultPkm is IRibbonSetCommon4 resultPkmCommon4
            )
            {
                resultPkmCommon4.CopyRibbonSetCommon4(targetPkmCommon4);
            }
        }

        if (sourcePkm is IRibbonSetEvent4)
        {
            if (
                targetPkm is IRibbonSetEvent4 targetPkmEvent4
                && resultPkm is IRibbonSetEvent4 resultPkmEvent4
            )
            {
                resultPkmEvent4.CopyRibbonSetEvent4(targetPkmEvent4);
            }
        }

        if (sourcePkm is IRibbonSetCommon6)
        {
            if (
                targetPkm is IRibbonSetCommon6 targetPkmCommon6
                && resultPkm is IRibbonSetCommon6 resultPkmCommon6
            )
            {
                resultPkmCommon6.CopyRibbonSetCommon6(targetPkmCommon6);
            }
        }

        if (sourcePkm is IRibbonSetMemory6)
        {
            if (
                targetPkm is IRibbonSetMemory6 targetPkmMemory6
                && resultPkm is IRibbonSetMemory6 resultPkmMemory6
            )
            {
                resultPkmMemory6.CopyRibbonSetMemory6(targetPkmMemory6);
            }
        }

        if (sourcePkm is IRibbonSetCommon7)
        {
            if (
                targetPkm is IRibbonSetCommon7 targetPkmCommon7
                && resultPkm is IRibbonSetCommon7 resultPkmCommon7
            )
            {
                resultPkmCommon7.CopyRibbonSetCommon7(targetPkmCommon7);
            }
        }

        if (sourcePkm is IRibbonSetCommon8)
        {
            if (
                targetPkm is IRibbonSetCommon8 targetPkmCommon8
                && resultPkm is IRibbonSetCommon8 resultPkmCommon8
            )
            {
                resultPkmCommon8.CopyRibbonSetCommon8(targetPkmCommon8);
            }
        }

        if (sourcePkm is IRibbonSetCommon9)
        {
            if (
                targetPkm is IRibbonSetCommon9 targetPkmCommon9
                && resultPkm is IRibbonSetCommon9 resultPkmCommon9
            )
            {
                resultPkmCommon9.CopyRibbonSetCommon9(targetPkmCommon9);
            }
        }

        if (sourcePkm is IRibbonSetMark8)
        {
            if (
                targetPkm is IRibbonSetMark8 targetPkmMark8
                && resultPkm is IRibbonSetMark8 resultPkmMark8
            )
            {
                resultPkmMark8.CopyRibbonSetMark8(targetPkmMark8);
            }
        }

        if (sourcePkm is IRibbonSetMark9)
        {
            if (
                targetPkm is IRibbonSetMark9 targetPkmMark9
                && resultPkm is IRibbonSetMark9 resultPkmMark9
            )
            {
                resultPkmMark9.CopyRibbonSetMark9(targetPkmMark9);
            }
        }

        // no PKHeX Copy* helper for these G3-only sets (#239)
        if (sourcePkm is IRibbonSetOnly3)
        {
            if (
                targetPkm is IRibbonSetOnly3 targetPkmOnly3
                && resultPkm is IRibbonSetOnly3 resultPkmOnly3
            )
            {
                resultPkmOnly3.CopyRibbonSetOnly3(targetPkmOnly3);
            }
        }

        if (sourcePkm is IRibbonSetUnique3)
        {
            if (
                targetPkm is IRibbonSetUnique3 targetPkmUnique3
                && resultPkm is IRibbonSetUnique3 resultPkmUnique3
            )
            {
                resultPkmUnique3.CopyRibbonSetUnique3(targetPkmUnique3);
            }
        }

        if (sourcePkm is IRibbonSetUnique4)
        {
            if (
                targetPkm is IRibbonSetUnique4 targetPkmUnique4
                && resultPkm is IRibbonSetUnique4 resultPkmUnique4
            )
            {
                resultPkmUnique4.CopyRibbonSetUnique4(targetPkmUnique4);
            }
        }

        targetPkm.TID16 = resultPkm.TID16;
        if (sourcePkm is not GBPKM)
        {
            targetPkm.SID16 = resultPkm.SID16;
        }

        if (targetPkm.MaxStringLengthTrainer <= sourcePkm.MaxStringLengthTrainer
            || !targetPkm.OriginalTrainerName.StartsWith(resultPkm.OriginalTrainerName))
        {
            targetPkm.OriginalTrainerName = resultPkm.OriginalTrainerName;
        }

        if (sourcePkm is not PK1)
        {
            targetPkm.OriginalTrainerGender = resultPkm.OriginalTrainerGender;
        }

        if (resultPkm.OriginalTrainerFriendship > 0)
        {
            targetPkm.OriginalTrainerFriendship = resultPkm.OriginalTrainerFriendship;
        }

        if (noConvertNeeded)
        {
            utils.CopyMovesFrom(targetPkm, resultPkm);

            if (sourcePkm is IScaledSizeReadOnly)
            {
                if (
                    targetPkm is IScaledSize targetPkmSize
                    && resultPkm is IScaledSizeReadOnly resultPkmSize
                )
                {
                    targetPkmSize.WeightScalar = resultPkmSize.WeightScalar;
                    targetPkmSize.HeightScalar = resultPkmSize.HeightScalar;
                }
            }

            if (sourcePkm is IScaledSize3)
            {
                if (
                    targetPkm is IScaledSize3 targetPkmScale
                    && resultPkm is IScaledSize3 resultPkmScale
                )
                {
                    targetPkmScale.Scale = resultPkmScale.Scale;
                }
            }

            if (sourcePkm is IScaledSizeAbsolute)
            {
                if (
                    targetPkm is IScaledSizeAbsolute targetPkmSizeAbs
                    && resultPkm is IScaledSizeAbsolute resultPkmSizeAbs
                )
                {
                    targetPkmSizeAbs.WeightAbsolute = resultPkmSizeAbs.WeightAbsolute;
                    targetPkmSizeAbs.HeightAbsolute = resultPkmSizeAbs.HeightAbsolute;
                }
            }

            if (sourcePkm is ICombatPower)
            {
                if (
                    targetPkm is ICombatPower targetPkmCP
                    && resultPkm is ICombatPower resultPkmCP
                )
                {
                    targetPkmCP.Stat_CP = resultPkmCP.Stat_CP;
                }
            }

            targetPkm.Ball = resultPkm.Ball;
            targetPkm.CurrentHandler = resultPkm.CurrentHandler;
            targetPkm.HandlingTrainerName = resultPkm.HandlingTrainerName;
            targetPkm.HandlingTrainerGender = resultPkm.HandlingTrainerGender;
            targetPkm.HandlingTrainerFriendship = resultPkm.HandlingTrainerFriendship;
        }

        if (targetPkm is PB7 targetPb7b)
        {
            targetPb7b.Stat_CP = targetPb7b.CalcCP;
        }

        var legality = legalityAnalysisService.GetLegalitySafe(new(targetPkm));
        var args = new RibbonVerifierArguments(
            legality.la.Info.Entity,
            legality.la.EncounterMatch,
            legality.la.Info.EvoChainsAllGens
        );
        RibbonApplicator.FixInvalidRibbons(args);

        targetPkm.Heal();
        targetPkm.ResetPartyStats();
        targetPkm.RefreshChecksum();

        var target = new ImmutablePKM(targetPkm);

        if (!target.IsEnabled)
        {
            throw new Exception($"!target.IsEnabled");
        }
    }
}

/**
 * PKHeX has no Copy* helper for the Gen 3-only ribbon sets, unlike the rest.
 */
internal static class MissingRibbonSetExtensions
{
    public static void CopyRibbonSetOnly3(this IRibbonSetOnly3 set, IRibbonSetOnly3 dest)
    {
        dest.RibbonCountG3Cool = set.RibbonCountG3Cool;
        dest.RibbonCountG3Beauty = set.RibbonCountG3Beauty;
        dest.RibbonCountG3Cute = set.RibbonCountG3Cute;
        dest.RibbonCountG3Smart = set.RibbonCountG3Smart;
        dest.RibbonCountG3Tough = set.RibbonCountG3Tough;
        dest.RibbonWorld = set.RibbonWorld;
    }

    public static void CopyRibbonSetUnique3(this IRibbonSetUnique3 set, IRibbonSetUnique3 dest)
    {
        dest.RibbonWinning = set.RibbonWinning;
        dest.RibbonVictory = set.RibbonVictory;
    }

    public static void CopyRibbonSetUnique4(this IRibbonSetUnique4 set, IRibbonSetUnique4 dest)
    {
        dest.RibbonAbility = set.RibbonAbility;
        dest.RibbonAbilityGreat = set.RibbonAbilityGreat;
        dest.RibbonAbilityDouble = set.RibbonAbilityDouble;
        dest.RibbonAbilityMulti = set.RibbonAbilityMulti;
        dest.RibbonAbilityPair = set.RibbonAbilityPair;
        dest.RibbonAbilityWorld = set.RibbonAbilityWorld;

        dest.RibbonG3Cool = set.RibbonG3Cool;
        dest.RibbonG3CoolSuper = set.RibbonG3CoolSuper;
        dest.RibbonG3CoolHyper = set.RibbonG3CoolHyper;
        dest.RibbonG3CoolMaster = set.RibbonG3CoolMaster;
        dest.RibbonG3Beauty = set.RibbonG3Beauty;
        dest.RibbonG3BeautySuper = set.RibbonG3BeautySuper;
        dest.RibbonG3BeautyHyper = set.RibbonG3BeautyHyper;
        dest.RibbonG3BeautyMaster = set.RibbonG3BeautyMaster;
        dest.RibbonG3Cute = set.RibbonG3Cute;
        dest.RibbonG3CuteSuper = set.RibbonG3CuteSuper;
        dest.RibbonG3CuteHyper = set.RibbonG3CuteHyper;
        dest.RibbonG3CuteMaster = set.RibbonG3CuteMaster;
        dest.RibbonG3Smart = set.RibbonG3Smart;
        dest.RibbonG3SmartSuper = set.RibbonG3SmartSuper;
        dest.RibbonG3SmartHyper = set.RibbonG3SmartHyper;
        dest.RibbonG3SmartMaster = set.RibbonG3SmartMaster;
        dest.RibbonG3Tough = set.RibbonG3Tough;
        dest.RibbonG3ToughSuper = set.RibbonG3ToughSuper;
        dest.RibbonG3ToughHyper = set.RibbonG3ToughHyper;
        dest.RibbonG3ToughMaster = set.RibbonG3ToughMaster;

        dest.RibbonG4Cool = set.RibbonG4Cool;
        dest.RibbonG4CoolGreat = set.RibbonG4CoolGreat;
        dest.RibbonG4CoolUltra = set.RibbonG4CoolUltra;
        dest.RibbonG4CoolMaster = set.RibbonG4CoolMaster;
        dest.RibbonG4Beauty = set.RibbonG4Beauty;
        dest.RibbonG4BeautyGreat = set.RibbonG4BeautyGreat;
        dest.RibbonG4BeautyUltra = set.RibbonG4BeautyUltra;
        dest.RibbonG4BeautyMaster = set.RibbonG4BeautyMaster;
        dest.RibbonG4Cute = set.RibbonG4Cute;
        dest.RibbonG4CuteGreat = set.RibbonG4CuteGreat;
        dest.RibbonG4CuteUltra = set.RibbonG4CuteUltra;
        dest.RibbonG4CuteMaster = set.RibbonG4CuteMaster;
        dest.RibbonG4Smart = set.RibbonG4Smart;
        dest.RibbonG4SmartGreat = set.RibbonG4SmartGreat;
        dest.RibbonG4SmartUltra = set.RibbonG4SmartUltra;
        dest.RibbonG4SmartMaster = set.RibbonG4SmartMaster;
        dest.RibbonG4Tough = set.RibbonG4Tough;
        dest.RibbonG4ToughGreat = set.RibbonG4ToughGreat;
        dest.RibbonG4ToughUltra = set.RibbonG4ToughUltra;
        dest.RibbonG4ToughMaster = set.RibbonG4ToughMaster;
    }
}
