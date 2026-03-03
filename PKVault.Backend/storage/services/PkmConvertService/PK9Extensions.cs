
using PKHeX.Core;

public static class PK9Extensions
{
    public static PA9 ConvertToPA9(this PK9 pk9)
    {
        var rnd = Util.Rand;

        var pa9 = new PA9()
        {
            Version = GameVersion.ZA,
            // MetLocation = pk9.MetLocation,
            MetDate = pk9.MetDate ?? EncounterDate.GetDateSwitch(),
            MetLevel = pk9.MetLevel,

            // EggLocation = Locations.LinkTrade6,
            // EggMetDate = pk7.MetDate ?? EncounterDate.GetDateSwitch(),

            EncryptionConstant = rnd.Rand32(),
            Species = pk9.Species,
            TID16 = pk9.TID16,
            SID16 = pk9.SID16,
            CurrentLevel = pk9.CurrentLevel,
            EXP = pk9.EXP,
            Nature = pk9.Nature,
            StatNature = pk9.Nature,
            PID = pk9.PID,
            Ball = pk9.Ball,

            Move1 = pk9.Move1,
            Move2 = pk9.Move2,
            Move3 = pk9.Move3,
            Move4 = pk9.Move4,
            Move1_PPUps = pk9.Move1_PPUps,
            Move2_PPUps = pk9.Move2_PPUps,
            Move3_PPUps = pk9.Move3_PPUps,
            Move4_PPUps = pk9.Move4_PPUps,
            Gender = pk9.Gender,
            IsNicknamed = pk9.IsNicknamed,
            Form = pk9.Form,

            CurrentHandler = 1,
            HandlingTrainerName = pk9.OriginalTrainerName,
            HandlingTrainerGender = pk9.OriginalTrainerGender,

            Language = pk9.Language,
            Nickname = pk9.IsNicknamed
                ? pk9.Nickname
                : SpeciesName.GetSpeciesNameGeneration(pk9.Species, pk9.Language, 9),
            OriginalTrainerName = pk9.OriginalTrainerName,
            OriginalTrainerGender = pk9.OriginalTrainerGender,
            OriginalTrainerFriendship = pk9.OriginalTrainerFriendship,
            HandlingTrainerFriendship = pk9.HandlingTrainerFriendship,

            Ability = pk9.Ability,
            AbilityNumber = pk9.AbilityNumber,

            IVs = [
                pk9.IV_HP,
                pk9.IV_ATK,
                pk9.IV_DEF,
                pk9.IV_SPE,
                pk9.IV_SPA,
                pk9.IV_SPD,
            ],

            EV_HP = pk9.EV_HP,
            EV_ATK = pk9.EV_ATK,
            EV_DEF = pk9.EV_DEF,
            EV_SPA = pk9.EV_SPA,
            EV_SPD = pk9.EV_SPD,
            EV_SPE = pk9.EV_SPE,

            HeightScalar = 0,
            WeightScalar = 0,

            ObedienceLevel = pk9.ObedienceLevel,
        };

        for (var i = 0; i < pk9.MarkingCount; i++)
        {
            pa9.SetMarking(i, pk9.GetMarking(i));
        }

        pk9.CopyContestStatsTo(pa9);

        pk9.CopyRibbonSetCommon3(pa9);
        pk9.CopyRibbonSetEvent3(pa9);
        pk9.CopyRibbonSetCommon4(pa9);
        pk9.CopyRibbonSetEvent4(pa9);
        pk9.CopyRibbonSetCommon6(pa9);
        pk9.CopyRibbonSetMemory6(pa9);
        pk9.CopyRibbonSetCommon7(pa9);

        pa9.PassHeldItem(pk9.HeldItem, pk9.Context, pk9.Version);

        pa9.FixMetLocation([GameVersion.ZA]);

        pa9.FixPID(pk9.IsShiny, pk9.Form, pk9.Gender, pk9.Nature);

        return pa9;
    }

    public static PK8 ConvertToPK8(this PK9 pk9)
    {
        var rnd = Util.Rand;

        var pk8 = new PK8()
        {
            Version = GameVersion.SW,
            MetLocation = 30001,
            MetDate = pk9.MetDate ?? EncounterDate.GetDateSwitch(),
            MetLevel = pk9.MetLevel,

            // EggLocation = Locations.LinkTrade6,
            // EggMetDate = pk7.MetDate ?? EncounterDate.GetDateSwitch(),

            EncryptionConstant = rnd.Rand32(),
            Species = pk9.Species,
            TID16 = pk9.TID16,
            SID16 = pk9.SID16,
            CurrentLevel = pk9.CurrentLevel,
            EXP = pk9.EXP,
            Nature = pk9.Nature,
            StatNature = pk9.Nature,
            PID = pk9.PID,
            Ball = pk9.Ball,

            Move1 = pk9.Move1,
            Move2 = pk9.Move2,
            Move3 = pk9.Move3,
            Move4 = pk9.Move4,
            Move1_PPUps = pk9.Move1_PPUps,
            Move2_PPUps = pk9.Move2_PPUps,
            Move3_PPUps = pk9.Move3_PPUps,
            Move4_PPUps = pk9.Move4_PPUps,
            Gender = pk9.Gender,
            IsNicknamed = pk9.IsNicknamed,
            Form = pk9.Form,

            CurrentHandler = 1,
            HandlingTrainerName = pk9.OriginalTrainerName,
            HandlingTrainerGender = pk9.OriginalTrainerGender,

            Language = pk9.Language,
            Nickname = pk9.IsNicknamed
                ? pk9.Nickname
                : SpeciesName.GetSpeciesNameGeneration(pk9.Species, pk9.Language, 8),
            OriginalTrainerName = pk9.OriginalTrainerName,
            OriginalTrainerGender = pk9.OriginalTrainerGender,
            OriginalTrainerFriendship = pk9.OriginalTrainerFriendship,
            HandlingTrainerFriendship = pk9.HandlingTrainerFriendship,
            HandlingTrainerLanguage = (byte)pk9.Language,

            Ability = pk9.Ability,
            AbilityNumber = pk9.AbilityNumber,

            IVs = [
                pk9.IV_HP,
                pk9.IV_ATK,
                pk9.IV_DEF,
                pk9.IV_SPE,
                pk9.IV_SPA,
                pk9.IV_SPD,
            ],

            EV_HP = pk9.EV_HP,
            EV_ATK = pk9.EV_ATK,
            EV_DEF = pk9.EV_DEF,
            EV_SPA = pk9.EV_SPA,
            EV_SPD = pk9.EV_SPD,
            EV_SPE = pk9.EV_SPE,
        };

        pk9.CopyContestStatsTo(pk8);

        pk9.CopyRibbonSetCommon3(pk8);
        pk9.CopyRibbonSetEvent3(pk8);
        pk9.CopyRibbonSetCommon4(pk8);
        pk9.CopyRibbonSetEvent4(pk8);
        pk9.CopyRibbonSetCommon6(pk8);
        pk9.CopyRibbonSetMemory6(pk8);
        pk9.CopyRibbonSetCommon7(pk8);

        pk8.PassHeldItem(pk9.HeldItem, pk9.Context, pk9.Version);

        pk8.FixAbility();

        pk8.FixMetLocation([GameVersion.SW, GameVersion.SH]);

        pk8.FixPID(pk9.IsShiny, pk9.Form, pk9.Gender, pk9.Nature);

        // for Furfrou and Hoopa
        pk8.FormArgumentRemain = pk9.FormArgumentRemain;
        pk8.FormArgumentElapsed = pk9.FormArgumentElapsed;
        pk8.FormArgumentMaximum = pk9.FormArgumentMaximum;

        return pk8;
    }

    public static PK9 ConvertToPK9(this PA9 pa9)
    {
        var rnd = Util.Rand;

        var pk9 = new PK9()
        {
            Version = GameVersion.SL,
            MetLocation = pa9.MetLocation,
            MetDate = pa9.MetDate ?? EncounterDate.GetDateSwitch(),
            MetLevel = pa9.MetLevel,

            // EggLocation = Locations.LinkTrade6,
            // EggMetDate = pk7.MetDate ?? EncounterDate.GetDateSwitch(),

            EncryptionConstant = rnd.Rand32(),
            Species = pa9.Species,
            TID16 = pa9.TID16,
            SID16 = pa9.SID16,
            CurrentLevel = pa9.CurrentLevel,
            EXP = pa9.EXP,
            Nature = pa9.Nature,
            StatNature = pa9.Nature,
            PID = pa9.PID,
            Ball = pa9.Ball,

            Move1 = pa9.Move1,
            Move2 = pa9.Move2,
            Move3 = pa9.Move3,
            Move4 = pa9.Move4,
            Move1_PPUps = pa9.Move1_PPUps,
            Move2_PPUps = pa9.Move2_PPUps,
            Move3_PPUps = pa9.Move3_PPUps,
            Move4_PPUps = pa9.Move4_PPUps,
            Gender = pa9.Gender,
            IsNicknamed = pa9.IsNicknamed,
            Form = pa9.Form,

            CurrentHandler = 1,
            HandlingTrainerName = pa9.OriginalTrainerName,
            HandlingTrainerGender = pa9.OriginalTrainerGender,

            Language = pa9.Language,
            Nickname = pa9.IsNicknamed
                ? pa9.Nickname
                : SpeciesName.GetSpeciesNameGeneration(pa9.Species, pa9.Language, 9),
            OriginalTrainerName = pa9.OriginalTrainerName,
            OriginalTrainerGender = pa9.OriginalTrainerGender,
            OriginalTrainerFriendship = pa9.OriginalTrainerFriendship,
            HandlingTrainerFriendship = pa9.HandlingTrainerFriendship,

            Ability = pa9.Ability,
            AbilityNumber = pa9.AbilityNumber,

            IVs = [
                pa9.IV_HP,
                pa9.IV_ATK,
                pa9.IV_DEF,
                pa9.IV_SPE,
                pa9.IV_SPA,
                pa9.IV_SPD,
            ],

            EV_HP = pa9.EV_HP,
            EV_ATK = pa9.EV_ATK,
            EV_DEF = pa9.EV_DEF,
            EV_SPA = pa9.EV_SPA,
            EV_SPD = pa9.EV_SPD,
            EV_SPE = pa9.EV_SPE,

            HeightScalar = byte.Max(pa9.HeightScalar, 1),
            WeightScalar = byte.Max(pa9.WeightScalar, 1),

            ObedienceLevel = pa9.CurrentLevel,
            TeraTypeOriginal = (MoveType)Tera9RNG.GetTeraTypeFromPersonal(pa9.Species, pa9.Form, 0),
            TeraTypeOverride = (MoveType)Tera9RNG.GetTeraTypeFromPersonal(pa9.Species, pa9.Form, 0),
        };

        for (var i = 0; i < pk9.MarkingCount; i++)
        {
            pk9.SetMarking(i, pa9.GetMarking(i));
        }

        pa9.CopyContestStatsTo(pk9);

        pa9.CopyRibbonSetCommon3(pk9);
        pa9.CopyRibbonSetEvent3(pk9);
        pa9.CopyRibbonSetCommon4(pk9);
        pa9.CopyRibbonSetEvent4(pk9);
        pa9.CopyRibbonSetCommon6(pk9);
        pa9.CopyRibbonSetMemory6(pk9);
        pa9.CopyRibbonSetCommon7(pk9);

        pk9.PassHeldItem(pa9.HeldItem, pa9.Context, pa9.Version);

        pk9.FixAbility();

        pk9.FixMetLocation([GameVersion.SL, GameVersion.VL]);

        pk9.FixPID(pa9.IsShiny, pa9.Form, pa9.Gender, pa9.Nature);

        return pk9;
    }
}
