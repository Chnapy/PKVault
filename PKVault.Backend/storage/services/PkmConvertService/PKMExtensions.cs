using System.Security.Cryptography;
using System.Text;
using PKHeX.Core;

public static class PKMExtensions
{
    public static void FixCommonLegalityIssues(this PKM pkm)
    {
        pkm.FixPID(pkm.IsShiny, pkm.Form, pkm.Gender, pkm.Nature, true);
        pkm.FixBallLegality();
        pkm.FixHeldItemLegality();
        pkm.FixRibbonLegality();
        pkm.FixContestLegality();
    }

    public static void FixRibbonLegality(this PKM pkm)
    {
        if (pkm is GBPKM)
        {
            return;
        }

        LegalityAnalysis legality = new(pkm);
        if (!legality.Valid && legality.Results.Any(r => !r.Valid
            && r.Identifier == CheckIdentifier.Ribbon))
        {
            var args = new RibbonVerifierArguments(
                legality.Info.Entity,
                legality.EncounterMatch,
                legality.Info.EvoChainsAllGens
            );
            RibbonApplicator.FixInvalidRibbons(args);
        }
    }

    public static void FixContestLegality(this PKM pkm)
    {
        if (pkm is not IContestStats contest)
        {
            return;
        }

        LegalityAnalysis legality = new(pkm);
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

    public static void FixHeldItemLegality(this PKM pkm)
    {
        LegalityAnalysis legality = new(pkm);

        if (!legality.Valid && legality.Results.Any(r =>
            !r.Valid &&
            r.Identifier == CheckIdentifier.HeldItem &&
            r.Result == LegalityCheckResultCode.ItemUnreleased
        ))
        {
            pkm.HeldItem = 0;
        }
    }

    public static void FixBallLegality(this PKM pkm)
    {
        bool hasBallIllegality()
        {
            LegalityAnalysis legality = new(pkm);
            return !legality.Valid && legality.Results.Any(r =>
                !r.Valid &&
                r.Identifier == CheckIdentifier.Ball
            );
        }

        var initialBall = pkm.Ball;

        // first try to use default Pokeball
        // enough for most cases
        if (pkm.Ball != (byte)Ball.Poke && hasBallIllegality())
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

    public static void PassHeldItem(this PKM pkm, int srcHeldItem, EntityContext srcContext, GameVersion srcVersion)
    {
        pkm.HeldItem = ItemConverter.GetItemForFormat(srcHeldItem, srcContext, pkm.Context);

        pkm.PassHeldItemByString(srcHeldItem, srcContext, srcVersion);
    }

    public static void PassHeldItemByString(this PKM pkm, int srcHeldItem, EntityContext srcContext, GameVersion srcVersion)
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

    public static void PassMoves(this PKM pkm, PKM pkmSrc)
    {
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

        for (var i = 0; i < srcMoves.Length; i++)
        {
            var move = srcMoves[i];
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

        // Console.WriteLine($"MOVES = {pkm.Move1}/{pkm.Move2}/{pkm.Move3}/{pkm.Move4}");

        var legality = new LegalityAnalysis(pkm);
        var movesLegality = legality.Info.Moves;
        if (!movesLegality.Any(r => !r.Valid))
        {
            return;
        }

        for (var i = 0; i < movesLegality.Length; i++)
        {
            var r = movesLegality[i];
            if (r.Valid)
                continue;

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

    public static void FixPID(this PKM pkm, bool isShiny, byte form, byte gender, Nature nature, bool checkLegality = false)
    {
        var rnd = Util.Rand;
        var i = 0;

        bool hasPIDFixableIllegality()
        {
            if (!checkLegality)
            {
                return false;
            }

            LegalityAnalysis legality = new(pkm);
            return !legality.Valid && legality.Results.Any(r =>
                r.Identifier == CheckIdentifier.EC && r.Result == LegalityCheckResultCode.TransferEncryptGen6BitFlip
            );
        }

        while (
            pkm.IsShiny != isShiny
            || pkm.Form != form
            || pkm.Gender != gender
            || pkm.Nature != nature
            || hasPIDFixableIllegality()
        )
        {
            pkm.PID = EntityPID.GetRandomPID(rnd, pkm.Species, gender, pkm.Version, nature, form, pkm.PID);
            i++;
            if (i > 1_000_000)
            {
                break;
            }
        }

        if (pkm.Format >= 6 && (pkm.Gen3 || pkm.Gen4 || pkm.Gen5))
        {
            pkm.EncryptionConstant = pkm.PID;
        }

    }

    public static void FixMetLocation(this PKM pkm, GameVersion[] versionsToTry)
    {
        int countLocationIllegalities()
        {
            var legality = new LegalityAnalysis(pkm);
            return legality.Valid
                ? 0
                : legality.Results.ToList().FindAll(r => !r.Valid && (
                    (r.Identifier == CheckIdentifier.Encounter && r.Result != LegalityCheckResultCode.TransferTrackerMissing)
                    || r.Identifier == CheckIdentifier.Fateful
                    || r.Identifier == CheckIdentifier.GameOrigin
                    || (r.Identifier == CheckIdentifier.Ability && r.Result == LegalityCheckResultCode.AbilityHiddenFail)
                )).Count;
        }

        var currentSafestVersion = pkm.Version;

        var currentCount = countLocationIllegalities();
        if (currentCount == 0)
        {
            return;
        }

        GameVersion[] allVersionsToTry = [pkm.Version, .. versionsToTry];

        foreach (var version in allVersionsToTry)
        {
            pkm.Version = version;
            SetSuggestedMetLocation(pkm);

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

    public static void FixAbility(this PKM pkm)
    {
        bool hasAbilityIssue()
        {
            var legality = new LegalityAnalysis(pkm);

            return !legality.Valid && legality.Results.Any(r =>
                !r.Valid
                && (
                    r.Identifier == CheckIdentifier.Ability
                )
            );
        }

        for (var i = 0; i < pkm.PersonalInfo.AbilityCount && hasAbilityIssue(); i++)
        {
            pkm.RefreshAbility(i);
        }
    }

    public static void FixSID(this PKM pkm)
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

    public static void SetSuggestedMetLocation(PKM pkm)
    {
        var encounter = EncounterSuggestion.GetSuggestedMetInfo(pkm);
        if (encounter == null) return;

        ushort location = encounter.Location;
        if (pkm.Format < 3 && encounter.Encounter is { } x && !x.Version.Contains(GameVersion.C))
            location = 0;

        if (pkm.Format >= 3)
        {
            pkm.MetLocation = location;
            pkm.MetLevel = encounter.GetSuggestedMetLevel(pkm);

            if (encounter.HasGroundTile(pkm.Format) && pkm is IGroundTile pkmGround)
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
    }
}
