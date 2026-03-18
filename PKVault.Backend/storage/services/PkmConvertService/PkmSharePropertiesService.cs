using PKHeX.Core;

public interface IPkmSharePropertiesService
{
    public void SharePropertiesTo(ImmutablePKM source, PKM targetPkm);
}

/**
 * Share properties from a PKM source to a PKM target,
 * handling all convert requirements and contexts differences.
 */
public class PkmSharePropertiesService(IPkmConvertService pkmConvertService) : IPkmSharePropertiesService
{
    public void SharePropertiesTo(ImmutablePKM source, PKM targetPkm)
    {
        var sourcePkm = source.GetMutablePkm();

        Console.WriteLine($"Convert existing {sourcePkm.GetType().Name} -> {targetPkm.GetType().Name}");

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
                )
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
            targetPkm.StatNature = resultPkm.StatNature;
            targetPkm.PID = resultPkm.PID;

            if (targetPkm.Format >= 6 && (targetPkm.Gen3 || targetPkm.Gen4 || targetPkm.Gen5))
            {
                targetPkm.EncryptionConstant = targetPkm.PID;
            }

            targetPkm.Ability = resultPkm.Ability;
            targetPkm.AbilityNumber = resultPkm.AbilityNumber;
        }

        targetPkm.Language = resultPkm.Language;

        var resultIVs = resultPkm.GetAllIVs();
        var targetIVs = targetPkm.GetAllIVs();
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
            targetPkm.CopyIVsFrom(resultPkm);
        }

        targetPkm.IsNicknamed = resultPkm.IsNicknamed;
        if (!targetPkm.IsNicknamed
            || targetPkm.MaxStringLengthNickname <= sourcePkm.MaxStringLengthNickname
            || !targetPkm.Nickname.StartsWith(resultPkm.Nickname))
        {
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
            targetPkm.CopyEVsFrom(resultPkm);
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

        if (targetPkm.HeldItem == 0)
        {
            targetPkm.CopyHeldItemFrom(resultPkm.HeldItem, resultPkm.Context, resultPkm.Version);
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
            targetPkm.CopyMovesFrom(resultPkm);

            targetPkm.Ball = resultPkm.Ball;
            targetPkm.CurrentHandler = resultPkm.CurrentHandler;
            targetPkm.HandlingTrainerName = resultPkm.HandlingTrainerName;
            targetPkm.HandlingTrainerGender = resultPkm.HandlingTrainerGender;
            targetPkm.HandlingTrainerFriendship = resultPkm.HandlingTrainerFriendship;
        }

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
