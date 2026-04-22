using System.Security.Cryptography;
using System.Text;
using PKHeX.Core;

public record PKMRndValues(uint PID, uint EncryptionConstant);

public static class PKMExtensions
{
    public static void FixCommonLegalityIssues(this PKM pkm, SaveWrapper? save)
    {
        pkm.FixPID(pkm.IsShiny, pkm.Form, pkm.Gender, pkm.Nature, true, save);
        pkm.FixBallLegality(save);
        pkm.FixHeldItemLegality(save);
        pkm.FixRibbonLegality(save);
        pkm.FixContestLegality(save);
        pkm.FixPokerusLegality(save);
    }

    public static bool FixPokerusLegality(this PKM pkm, SaveWrapper? save = null, int recursive = 0)
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

        var legality = PkmLegalityService.GetLegalitySafe(new(pkm), save);
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
            success = pkm.FixPokerusLegality(save, recursive + 1);
        }

        if (!success && recursive == 0)
        {
            pkm.PokerusDays = initialPokerusDays;
            pkm.PokerusStrain = initialPokerusStrain;
        }

        return success;
    }

    public static void FixRibbonLegality(this PKM pkm, SaveWrapper? save = null)
    {
        if (pkm is GBPKM)
        {
            return;
        }

        var legality = PkmLegalityService.GetLegalitySafe(new(pkm), save);
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

    public static void FixContestLegality(this PKM pkm, SaveWrapper? save = null)
    {
        if (pkm is not IContestStats contest)
        {
            return;
        }

        var legality = PkmLegalityService.GetLegalitySafe(new(pkm), save);
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

    public static void FixHeldItemLegality(this PKM pkm, SaveWrapper? save = null)
    {
        var legality = PkmLegalityService.GetLegalitySafe(new(pkm), save);

        if (!legality.Valid && legality.Results.Any(r =>
            !r.Valid &&
            r.Identifier == CheckIdentifier.HeldItem &&
            r.Result == LegalityCheckResultCode.ItemUnreleased
        ))
        {
            pkm.HeldItem = 0;
        }
    }

    public static void FixBallLegality(this PKM pkm, SaveWrapper? save = null)
    {
        bool hasBallIllegality()
        {
            var legality = PkmLegalityService.GetLegalitySafe(new(pkm), save);
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

    public static void CopyHeldItemFrom(this PKM pkm, int srcHeldItem, EntityContext srcContext, GameVersion srcVersion)
    {
        pkm.HeldItem = ItemConverter.GetItemForFormat(srcHeldItem, srcContext, pkm.Context);

        pkm.CopyHeldItemByStringFrom(srcHeldItem, srcContext, srcVersion);
    }

    public static void CopyHeldItemByStringFrom(this PKM pkm, int srcHeldItem, EntityContext srcContext, GameVersion srcVersion)
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

    public static void CopyMovesFrom(this PKM pkm, PKM pkmSrc)
    {
        var srcLegality = PkmLegalityService.GetLegalitySafe(new(pkmSrc));
        var srcMovesLegality = srcLegality.Info.Moves;

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

        // Console.WriteLine($"MOVES = {pkm.Move1}/{pkm.Move2}/{pkm.Move3}/{pkm.Move4}");

        var legality = PkmLegalityService.GetLegalitySafe(new(pkm));
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

            // if move was already invalid, keep it like that
            if (!srcMovesLegality[i].Valid)
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

    public static void CopyCommonPropertiesFrom(this PKM pkm, PKM pkmSrc, byte generation, PKMRndValues? rndValues)
    {
        if (pkmSrc.Species > pkm.MaxSpeciesID)
        {
            throw new InvalidOperationException($"Species incompatible: {pkmSrc.Species} > {pkm.MaxSpeciesID}");
        }

        pkm.Species = pkmSrc.Species;
        pkm.Gender = pkmSrc.Gender;
        pkm.Form = pkmSrc.Form;
        pkm.Language = pkmSrc.Language;

        pkm.SetNickname(pkmSrc.IsNicknamed ? pkmSrc.Nickname : "");

        pkm.Nature = pkmSrc.Nature;
        pkm.StatNature = pkmSrc.StatNature;

        pkm.PID = rndValues?.PID ?? pkmSrc.PID;
        pkm.EncryptionConstant = rndValues?.EncryptionConstant ?? Util.Rand.Rand32();

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

    public static void CopyIVsFrom(this PKM pkm, PKM pkmSrc)
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

    public static void CopyEVsFrom(this PKM pkm, PKM pkmSrc)
    {
        pkm.EV_HP = pkmSrc.EV_HP;
        pkm.EV_ATK = pkmSrc.EV_ATK;
        pkm.EV_DEF = pkmSrc.EV_DEF;
        pkm.EV_SPA = pkmSrc.EV_SPA;
        pkm.EV_SPD = pkmSrc.EV_SPD;
        pkm.EV_SPE = pkmSrc.EV_SPE;
    }

    public static void FixPID(this PKM pkm, bool isShiny, byte form, byte gender, Nature nature, bool checkLegality = false, SaveWrapper? save = null)
    {
        var rnd = Util.Rand;
        var i = 0;

        bool hasWrongShiny()
        {
            if (pkm is PK1)
                return false;

            return pkm.IsShiny != isShiny;
        }

        bool hasWrongForm()
        {
            if (pkm is PK1)
                return false;

            return pkm.Form != form;
        }

        bool hasWrongGender()
        {
            if (pkm is PK1)
                return false;

            if (!pkm.PersonalInfo.IsDualGender)
                return false;

            return pkm.Gender != gender;
        }

        bool hasWrongNature()
        {
            if (pkm is GBPKM)
                return false;

            return pkm.Nature != nature;
        }

        bool hasPIDFixableIllegality()
        {
            if (!checkLegality)
            {
                return false;
            }

            var legality = PkmLegalityService.GetLegalitySafe(new(pkm), save);
            return !legality.Valid && legality.Results.Any(r =>
                r.Identifier == CheckIdentifier.EC && r.Result == LegalityCheckResultCode.TransferEncryptGen6BitFlip
            );
        }

        while (
            hasWrongShiny()
            || hasWrongForm()
            || hasWrongGender()
            || hasWrongNature()
            || hasPIDFixableIllegality()
        )
        {
            if (pkm is GBPKM gbpkm)
            {
                if (isShiny)
                {
                    gbpkm.SetShiny();
                }
                else
                {
                    gbpkm.SetPIDGender(gender);
                }
                break;
            }

            pkm.PID = EntityPID.GetRandomPID(rnd, pkm.Species, gender, pkm.Version, nature, form, pkm.PID);
            i++;

            if (i > 10_000_000)
            {
                throw new Exception(
                    $"PID FIX ERROR: {pkm.GetType().Name} {pkm.Nickname} {pkm.Species}"
                    + $"\nPID shiny={pkm.IsShiny}/{isShiny} form={pkm.Form}/{form} gender={pkm.Gender}/{gender} nature={pkm.Nature}/{nature} checkLegality={checkLegality}"
                );
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
            var legality = PkmLegalityService.GetLegalitySafe(new(pkm));
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
            var legality = PkmLegalityService.GetLegalitySafe(new(pkm));

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

    public static int[] GetAllIVs(this PKM pkm)
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
