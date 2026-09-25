using System.Buffers;
using System.Security.Cryptography;
using System.Text;
using PKHeX.Core;
using Serilog;

namespace PKVault.Core;

public record ConvertContext(
    PKM? TargetPkm,
    SaveWrapper? TargetSave
);

public class PKMConverterUtils(ILegalityAnalysisService legalityAnalysisService)
{
    private readonly PKMPersonalFixer personalFixer = new(legalityAnalysisService);

    public void FixCommonLegalityIssues(PKM pkm, ConvertContext ctx)
    {
        FixHandlingTrainer(pkm, ctx);
        FixPersonalData(pkm, pkm.IsShiny, pkm.Form, pkm.Gender, pkm.Nature, pkm.Ability, true, ctx);
        FixBallLegality(pkm, ctx);
        FixHeldItemLegality(pkm, ctx);
        FixRibbonLegality(pkm, ctx);
        FixContestLegality(pkm, ctx);
        FixPokerusLegality(pkm, ctx);
        FixMovesLegality(pkm, ctx);
        FixRelearnMovesLegality(pkm, ctx);
        FixRegionLegality(pkm, ctx);

        var fixMemories = pkm.GetType().GetMethod("FixMemories");
        fixMemories?.Invoke(pkm, null);
    }

    public void FixHandlingTrainer(PKM pkm, ConvertContext ctx)
    {
        var save = ctx.TargetSave;
        if (save != null)
        {
            pkm.HandlingTrainerName = save.OT;
            pkm.HandlingTrainerGender = save.Gender;

            pkm.CurrentHandler = save.GetSave().IsFromTrainer(pkm) ? (byte)0 : (byte)1;
        }
    }

    public void FixRegionLegality(PKM pkm, ConvertContext ctx)
    {
        if (pkm is not IRegionOrigin pkmRg)
            return;

        var legality = legalityAnalysisService.GetLegalitySafe(new(pkm), ctx.TargetSave);
        if (legality.la == null || legality.Valid)
            return;

        if (!legality.Results.Any(r => !r.Valid && r.Result == LegalityCheckResultCode.GeoHardwareInvalid))
            return;

        if (ctx.TargetSave != null && ctx.TargetSave.GetSave() is IRegionOriginReadOnly saveRg)
            saveRg.CopyRegionOrigin(pkmRg);
        else
            pkmRg.ClearRegionOrigin();
    }

    // Fix each move legality ONLY if an expected one is present
    public void FixMovesLegality(PKM pkm, ConvertContext ctx)
    {
        var legality = legalityAnalysisService.GetLegalitySafe(new(pkm), ctx.TargetSave);
        if (legality.la == null || legality.MovesValid.All(r => r))
        {
            return;
        }

        ushort[] moves = [
            pkm.Move1,
            pkm.Move2,
            pkm.Move3,
            pkm.Move4,
        ];

        for (var i = 0; i < legality.la.Info.Moves.Length; i++)
        {
            var r = legality.la.Info.Moves[i];
            if (r.Valid)
                continue;

            pkm.SetMove(i, 0);
        }

        legality = legalityAnalysisService.GetLegalitySafe(new(pkm), ctx.TargetSave);

        List<ushort> newMoves = [];
        IEnumerable<ushort> encounterMoves = [];

        for (var i = 0; i < legality.la!.Info.Moves.Length; i++)
        {
            var r = legality.la.Info.Moves[i];

            var move = r.Expect > 0
                ? r.Expect
                : moves[i];

            // if duplicate
            // replace it by first valid one
            if (newMoves.Contains(move))
            {
                if (!encounterMoves.Any())
                    encounterMoves = DexDataService.GetEncounterMoves(legality.la.Info);

                move = encounterMoves.FirstOrDefault(m => m > 0 && !newMoves.Contains(m));
            }

            pkm.SetMove(i, move);
            if (move > 0)
                newMoves.Add(move);
        }

        pkm.FixMoves();
    }

    public void FixRelearnMovesLegality(PKM pkm, ConvertContext ctx)
    {
        var legality = legalityAnalysisService.GetLegalitySafe(new(pkm), ctx.TargetSave);
        if (legality.la != null && legality.RelearnValid.Any(r => !r))
        {

            ushort[] moves = [
                pkm.RelearnMove1,
                pkm.RelearnMove2,
                pkm.RelearnMove3,
                pkm.RelearnMove4,
            ];

            for (var i = 0; i < legality.la.Info.Relearn.Length; i++)
            {
                var r = legality.la.Info.Relearn[i];
                if (r.Valid)
                    continue;

                pkm.SetRelearnMove(i, 0);
            }

            legality = legalityAnalysisService.GetLegalitySafe(new(pkm), ctx.TargetSave);

            List<ushort> newMoves = [];
            IEnumerable<ushort> encounterMoves = [];

            for (var i = 0; i < legality.la!.Info.Relearn.Length; i++)
            {
                var r = legality.la.Info.Relearn[i];

                var move = r.Expect > 0
                    ? r.Expect
                    : moves[i];

                // if duplicate
                // replace it by first valid one
                // may be useless with relearn-moves
                if (newMoves.Contains(move))
                {
                    if (!encounterMoves.Any())
                        encounterMoves = DexDataService.GetEncounterMoves(legality.la.Info);

                    move = encounterMoves.FirstOrDefault(m => m > 0 && !newMoves.Contains(m));
                }

                pkm.SetRelearnMove(i, move);
                if (move > 0)
                    newMoves.Add(move);
            }

            var fixRelearn = pkm.GetType().GetMethod("FixRelearn");
            fixRelearn?.Invoke(pkm, null);
        }

        if (pkm is PA9 pa9)
        {
            legality = legalityAnalysisService.GetLegalitySafe(new(pkm), ctx.TargetSave);
            if (legality.Valid)
                return;

            var plusMoveResults = legality.Results.Where(r => !r.Valid
                && r.Identifier == CheckIdentifier.RelearnMove
                && r.Result == LegalityCheckResultCode.PlusMoveSufficientLevelMissing_0);
            if (!plusMoveResults.Any())
                return;

            var permit = pa9.PersonalInfo;

            foreach (var r in plusMoveResults)
            {
                var move = r.Argument;
                var level = r.Argument2;

                var index = permit.PlusMoveIndexes.IndexOf(move);

                pa9.SetMovePlusFlag(index);
            }
        }
    }

    public bool FixPokerusLegality(PKM pkm, ConvertContext ctx, int recursive = 0)
    {
        if (pkm is PK1 || pkm is PB7)
        {
            return true;
        }

        if (recursive > 16)
        {
            return false;
        }

        var initialPokerusDays = pkm.PokerusDays;
        var initialPokerusStrain = pkm.PokerusStrain;

        var legality = legalityAnalysisService.GetLegalitySafe(new(pkm), ctx.TargetSave);
        if (legality.Valid)
        {
            return true;
        }

        var miscIssues = legality.Results.Where(r => !r.Valid && r.Identifier == CheckIdentifier.Misc);

        var daysIssue = miscIssues.FirstOrDefault(r => r.Result == LegalityCheckResultCode.PokerusDaysLEQ_0);
        var strainIssue = miscIssues.FirstOrDefault(r => r.Result == LegalityCheckResultCode.PokerusStrainUnobtainable_0);

        if (daysIssue != default)
        {
            pkm.PokerusDays = (int)daysIssue.Value;
        }

        var success = true;

        if (strainIssue != default)
        {
            pkm.PokerusStrain = (pkm.PokerusStrain + 1) % 16;
            if (pkm.PokerusStrain == 0)
                pkm.PokerusStrain = 1;
            success = FixPokerusLegality(pkm, ctx, recursive + 1);
        }

        if (!success && recursive == 0)
        {
            pkm.PokerusDays = initialPokerusDays;
            pkm.PokerusStrain = initialPokerusStrain;
        }

        return success;
    }

    public void FixRibbonLegality(PKM pkm, ConvertContext ctx)
    {
        if (pkm is GBPKM)
        {
            return;
        }

        var legality = legalityAnalysisService.GetLegalitySafe(new(pkm), ctx.TargetSave);
        if (!legality.Valid
            && legality.Results.Any(r => !r.Valid && r.Identifier == CheckIdentifier.Ribbon)
            && legality.la != null
        )
        {
            var args = new RibbonVerifierArguments(
                legality.la.Info.Entity,
                legality.la.EncounterMatch,
                legality.la.Info.EvoChainsAllGens
            );
            RibbonApplicator.FixInvalidRibbons(args);
        }
    }

    public void FixContestLegality(PKM pkm, ConvertContext ctx)
    {
        if (pkm is not IContestStats contest)
        {
            return;
        }

        var legality = legalityAnalysisService.GetLegalitySafe(new(pkm), ctx.TargetSave);
        if (legality.Valid)
        {
            return;
        }

        var invalidMemories = legality.Results.Where(r => !r.Valid
            && r.Identifier == CheckIdentifier.Memory);

        if (invalidMemories.Any(r => r.Result == LegalityCheckResultCode.ContestZero))
        {
            contest.ContestCool = 0;
            contest.ContestBeauty = 0;
            contest.ContestCute = 0;
            contest.ContestSmart = 0;
            contest.ContestTough = 0;
            contest.ContestSheen = 0;
        }
        else if (invalidMemories.Any(r => r.Result == LegalityCheckResultCode.ContestZeroSheen))
        {
            contest.ContestSheen = 0;
        }
    }

    public void FixHeldItemLegality(PKM pkm, ConvertContext ctx)
    {
        var legality = legalityAnalysisService.GetLegalitySafe(new(pkm), ctx.TargetSave);

        if (!legality.Valid && legality.Results.Any(r =>
            !r.Valid &&
            r.Identifier == CheckIdentifier.HeldItem &&
            r.Result == LegalityCheckResultCode.ItemUnreleased
        ))
        {
            pkm.HeldItem = 0;
        }
    }

    public void FixBallLegality(PKM pkm, ConvertContext ctx)
    {
        bool hasBallIllegality()
        {
            var legality = legalityAnalysisService.GetLegalitySafe(new(pkm), ctx.TargetSave);
            return !legality.Valid && legality.Results.Any(r =>
                !r.Valid &&
                r.Identifier == CheckIdentifier.Ball
            );
        }

        var initialBall = pkm.Ball;

        // first try to use default Pokeball
        // enough for most cases
        // force without extra condition because it may have side-effects (G4PKM)
        if (hasBallIllegality())
        {
            pkm.Ball = (byte)Ball.Poke;
        }

        // then tryu with all other balls
        var balls = Enum.GetValues<Ball>();
        for (var i = 0; i < balls.Length && hasBallIllegality(); i++)
        {
            var ball = balls[i];
            // ignore already tried balls
            if ((byte)ball == initialBall || ball == Ball.Poke)
            {
                continue;
            }

            if (hasBallIllegality())
            {
                pkm.Ball = (byte)ball;
            }
        }

        // if nothing works, reset to initial ball
        if (hasBallIllegality())
        {
            pkm.Ball = initialBall;
        }
    }

    public void CopyHeldItemFrom(PKM pkm, int srcHeldItem, EntityContext srcContext, GameVersion srcVersion)
    {
        pkm.HeldItem = ItemConverter.GetItemForFormat(srcHeldItem, srcContext, pkm.Context);

        CopyHeldItemByStringFrom(pkm, srcHeldItem, srcContext, srcVersion);
    }

    public void CopyHeldItemByStringFrom(PKM pkm, int srcHeldItem, EntityContext srcContext, GameVersion srcVersion)
    {
        if (srcHeldItem > 0 && pkm.HeldItem == 0)
        {
            var stringsSrc = GameInfo.Strings.GetItemStrings(srcContext, srcVersion);
            var stringsDest = GameInfo.Strings.GetItemStrings(pkm.Context, pkm.Version);

            var strSrc = stringsSrc[srcHeldItem];
            var strDestIndex = stringsDest.ToList().FindIndex(str => str == strSrc);
            if (strDestIndex > 0)
            {
                pkm.HeldItem = strDestIndex;
            }
        }
    }

    public void CopyMovesFrom(PKM pkm, PKM pkmSrc)
    {
        var srcLegality = legalityAnalysisService.GetLegalitySafe(new(pkmSrc));

        (ushort Move, int PPUps)[] srcMoves = [
            (pkmSrc.Move1, pkmSrc.Move1_PPUps),
            (pkmSrc.Move2, pkmSrc.Move2_PPUps),
            (pkmSrc.Move3, pkmSrc.Move3_PPUps),
            (pkmSrc.Move4, pkmSrc.Move4_PPUps),
        ];

        List<(ushort Move, int PPUps)> cleanedMoves = [.. srcMoves.Select((move,i) =>
        {
            if (move.Move >= pkm.MaxMoveID)
                return (Move: (ushort)0, PPUps: 0);
            return move;
        })
        .Where(move => move.Move != 0)];

        while (cleanedMoves.Count < 4)
        {
            cleanedMoves.Add((Move: 0, PPUps: 0));
        }

        for (var i = 0; i < cleanedMoves.Count; i++)
        {
            var move = cleanedMoves[i];
            pkm.SetMove(i, move.Move);
            switch (i)
            {
                case 0:
                    pkm.Move1_PPUps = move.PPUps;
                    break;
                case 1:
                    pkm.Move2_PPUps = move.PPUps;
                    break;
                case 2:
                    pkm.Move3_PPUps = move.PPUps;
                    break;
                case 3:
                    pkm.Move4_PPUps = move.PPUps;
                    break;
            }
        }
        pkm.FixMoves();

        // log.LogInformation($"MOVES = {pkm.Move1}/{pkm.Move2}/{pkm.Move3}/{pkm.Move4}");

        var legality = legalityAnalysisService.GetLegalitySafe(new(pkm));
        if (legality.la == null
            || legality.MovesValid.All(r => r)
            // all moves are wrong, or empty
            || legality.la.Info.Moves.All(r =>
                r.Info.Method == LearnMethod.Empty
                || r.Info.Method == LearnMethod.Unobtainable
                || r.Info.Method == LearnMethod.UnobtainableExpect)
        )
        {
            return;
        }

        for (var i = 0; i < legality.MovesValid.Length; i++)
        {
            if (legality.MovesValid[i])
                continue;

            // if move was already invalid, keep it like that
            if (!srcLegality.MovesValid[i])
                continue;

            var r = legality.la.Info.Moves[i];

            if (r.Info.Method == LearnMethod.Unobtainable)
            {
                pkm.SetMove(i, 0);
            }
        }

        // if no more moves
        // reset first one
        if (pkm.Move1 + pkm.Move2 + pkm.Move3 + pkm.Move4 == 0)
        {
            pkm.SetMove(0, pkmSrc.Move1);
        }

        pkm.FixMoves();
    }

    public void CopyCommonPropertiesFrom(PKM pkm, PKM pkmSrc, byte generation, ConvertContext ctx)
    {
        pkm.Species = pkmSrc.Species;
        pkm.Gender = pkmSrc.Gender;
        pkm.Form = pkmSrc.Form;
        pkm.Language = pkmSrc.Language;

        pkm.SetNickname(pkmSrc.IsNicknamed ? pkmSrc.Nickname : "");

        pkm.Nature = pkmSrc.Nature;
        pkm.StatAlignment = pkmSrc.StatAlignment;

        pkm.PID = ctx.TargetPkm?.PID ?? pkmSrc.PID;
        pkm.EncryptionConstant = ctx.TargetPkm?.EncryptionConstant ?? Util.Rand.Rand32();

        pkm.Ability = pkmSrc.Ability;
        pkm.AbilityNumber = pkmSrc.AbilityNumber;

        pkm.Ball = pkmSrc.Ball;

        pkm.CurrentLevel = pkmSrc.CurrentLevel;
        pkm.EXP = pkmSrc.EXP;

        pkm.TID16 = pkmSrc.TID16;
        pkm.SID16 = pkmSrc.SID16;

        pkm.CurrentHandler = pkmSrc.CurrentHandler;
        pkm.HandlingTrainerName = pkmSrc.HandlingTrainerName;
        pkm.HandlingTrainerGender = pkmSrc.HandlingTrainerGender;
        pkm.HandlingTrainerFriendship = pkmSrc.HandlingTrainerFriendship;
        pkm.OriginalTrainerName = pkmSrc.OriginalTrainerName;
        pkm.OriginalTrainerGender = pkmSrc.OriginalTrainerGender;
        pkm.OriginalTrainerFriendship = pkmSrc.OriginalTrainerFriendship;
    }

    public void CopyIVsFrom(PKM pkm, PKM pkmSrc)
    {
        pkm.IVs = [
            pkmSrc.IV_HP,
            pkmSrc.IV_ATK,
            pkmSrc.IV_DEF,
            pkmSrc.IV_SPE,
            pkmSrc.IV_SPA,
            pkmSrc.IV_SPD,
        ];
    }

    public void CopyEVsFrom(PKM pkm, PKM pkmSrc)
    {
        pkm.EV_HP = pkmSrc.EV_HP;
        pkm.EV_ATK = pkmSrc.EV_ATK;
        pkm.EV_DEF = pkmSrc.EV_DEF;
        pkm.EV_SPA = pkmSrc.EV_SPA;
        pkm.EV_SPD = pkmSrc.EV_SPD;
        pkm.EV_SPE = pkmSrc.EV_SPE;
    }

    public void FixPersonalData(
        PKM pkm,
        bool isShiny, byte form, byte gender, Nature nature, int ability,
        bool checkLegality, ConvertContext ctx
    )
    {
        personalFixer.FixPersonalData(
            pkm, isShiny, form, gender, nature, ability,
            checkLegality, ctx
        );
    }

    // Note: pkm.SetAbility and direct assignments are not reliable
    public void FixAbility(PKM pkm, ConvertContext ctx)
    {
        personalFixer.FixAbility(pkm, ctx);
    }

    public void FixMetLocation(PKM pkm, ConvertContext ctx)
    {
        if (ctx.TargetPkm?.GetType() == pkm.GetType())
        {
            pkm.Version = ctx.TargetPkm.Version;
            pkm.MetLocation = ctx.TargetPkm.MetLocation;
            pkm.MetLevel = ctx.TargetPkm.MetLevel;
            if (pkm is ICaughtData2 pkm2 && ctx.TargetPkm is ICaughtData2 target2)
            {
                pkm2.MetTimeOfDay = target2.MetTimeOfDay;
            }
            if (pkm is IGroundTile pkmG && ctx.TargetPkm is IGroundTile targetG)
            {
                pkmG.GroundTile = targetG.GroundTile;
            }
            return;
        }

        int countLocationIllegalities()
        {
            var legality = legalityAnalysisService.GetLegalitySafe(new(pkm));

            if (legality.Valid)
                return 0;

            var invalidResults = legality.Results.Where(r => !r.Valid);
            if (!invalidResults.Any())
                return 0;

            var customCount = invalidResults.Count(r =>
                (r.Identifier == CheckIdentifier.Encounter && r.Result != LegalityCheckResultCode.TransferTrackerMissing)
                || r.Identifier == CheckIdentifier.Fateful
                || r.Identifier == CheckIdentifier.GameOrigin
                || (r.Identifier == CheckIdentifier.Ability && r.Result == LegalityCheckResultCode.AbilityHiddenFail)
                || r.Result == LegalityCheckResultCode.AbilityMismatch3
            );
            if (customCount > 0)
                return customCount;

            return 0;
        }

        var currentSafestVersion = pkm.Version;

        var currentCount = countLocationIllegalities();
        if (currentCount == 0)
        {
            return;
        }

        var versionsToTry = GameUtil.GetVersionsWithinRange(pkm, pkm.Context)
            .OrderByDescending(v => v.Generation)
            .ThenBy(v => (byte)v)
            .ToArray();

        GameVersion[] allVersionsToTry = [pkm.Version, .. versionsToTry];
        // allVersionsToTry = allVersionsToTry.Distinct().ToArray();

        foreach (var version in allVersionsToTry)
        {
            pkm.Version = version;

            var hasSuggested = SetSuggestedMetLocation(pkm);
            if (!hasSuggested)
                continue;

            var count = countLocationIllegalities();
            if (count < currentCount)
            {
                currentSafestVersion = version;
                currentCount = count;
            }
            if (currentCount == 0)
            {
                break;
            }
        }

        if (currentCount > 0)
        {
            pkm.Version = currentSafestVersion;
            SetSuggestedMetLocation(pkm);
        }
    }

    public void FixSID(PKM pkm)
    {
        if (pkm.SID16 == 0)
        {
            string key = $"{pkm.OriginalTrainerName}|{pkm.TID16}";
            byte[] hash = SHA256.HashData(Encoding.UTF8.GetBytes(key));

            var raw = BitConverter.ToInt32(hash, 0) & 0x7FFFFFFF;
            var id = (ushort)(raw % 100000);
            pkm.SID16 = id;
        }
    }

    public int[] GetAllIVs(PKM pkm)
    {
        return [
            pkm.IV_HP,
            pkm.IV_ATK,
            pkm.IV_DEF,
            pkm.IV_SPE,
            pkm.IV_SPA,
            pkm.IV_SPD,
        ];
    }

    private bool SetSuggestedMetLocation(PKM pkm)
    {
        if (pkm is PB7 && pkm.Version == GameVersion.GO)
        {
            pkm.MetLocation = Locations.GO7;
            pkm.MetLevel = pkm.CurrentLevel;
            return true;
        }

        if (pkm.Format >= 8 && pkm.Version == GameVersion.GO)
        {
            pkm.MetLocation = Locations.GO8;
            pkm.MetLevel = pkm.CurrentLevel;
            return true;
        }

        var encounter = EncounterSuggestion.GetSuggestedMetInfo(pkm);
        if (encounter == null)
            return false;

        ushort location = encounter.Location;
        if (pkm.Format < 3 && encounter.Encounter is { } x && !x.Version.Contains(GameVersion.C))
            location = 0;

        if (pkm.Format >= 3)
        {
            pkm.MetLocation = location;
            pkm.MetLevel = encounter.GetSuggestedMetLevel(pkm);

            if (pkm is IGroundTile pkmGround)
                pkmGround.GroundTile = encounter.GetSuggestedGroundTile();

            if (pkm is { Gen6: true, WasEgg: true })
                pkm.SetHatchMemory6();
        }
        else
        {
            pkm.MetLocation = location;
            pkm.MetLevel = encounter.GetSuggestedMetLevel(pkm);
            if (pkm is ICaughtData2 pk2)
            {
                pk2.MetTimeOfDay = location == 0 ? 0 : encounter.GetSuggestedMetTimeOfDay();
            }
        }

        return true;
    }
}
