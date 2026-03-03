
using PKHeX.Core;

public static class PK8Extensions
{
    public static PK9 ConvertToPK9(this PK8 pk8)
    {
        var rnd = Util.Rand;

        var pk9 = new PK9()
        {
            Version = pk8.Version,
            MetLocation = pk8.MetLocation,
            MetDate = pk8.MetDate ?? EncounterDate.GetDateSwitch(),
            MetLevel = pk8.MetLevel,

            // EggLocation = Locations.LinkTrade6,
            // EggMetDate = pk7.MetDate ?? EncounterDate.GetDateSwitch(),

            EncryptionConstant = rnd.Rand32(),
            Species = pk8.Species,
            TID16 = pk8.TID16,
            SID16 = pk8.SID16,
            CurrentLevel = pk8.CurrentLevel,
            EXP = pk8.EXP,
            Nature = pk8.Nature,
            StatNature = pk8.Nature,
            PID = pk8.PID,
            Ball = pk8.Ball,

            Gender = pk8.Gender,
            IsNicknamed = pk8.IsNicknamed,
            Form = pk8.Form,

            CurrentHandler = 1,
            HandlingTrainerName = pk8.OriginalTrainerName,
            HandlingTrainerGender = pk8.OriginalTrainerGender,

            Language = pk8.Language,
            Nickname = pk8.IsNicknamed
                ? pk8.Nickname
                : SpeciesName.GetSpeciesNameGeneration(pk8.Species, pk8.Language, 9),
            OriginalTrainerName = pk8.OriginalTrainerName,
            OriginalTrainerGender = pk8.OriginalTrainerGender,
            OriginalTrainerFriendship = pk8.OriginalTrainerFriendship,
            HandlingTrainerFriendship = pk8.HandlingTrainerFriendship,

            Ability = pk8.Ability,
            AbilityNumber = pk8.AbilityNumber,

            IVs = [
                pk8.IV_HP,
                pk8.IV_ATK,
                pk8.IV_DEF,
                pk8.IV_SPE,
                pk8.IV_SPA,
                pk8.IV_SPD,
            ],

            EV_HP = pk8.EV_HP,
            EV_ATK = pk8.EV_ATK,
            EV_DEF = pk8.EV_DEF,
            EV_SPA = pk8.EV_SPA,
            EV_SPD = pk8.EV_SPD,
            EV_SPE = pk8.EV_SPE,

            HeightScalar = byte.Max(pk8.HeightScalar, 1),
            WeightScalar = byte.Max(pk8.WeightScalar, 1),

            ObedienceLevel = pk8.CurrentLevel,
            TeraTypeOriginal = (MoveType)Tera9RNG.GetTeraTypeFromPersonal(pk8.Species, pk8.Form, 0),
            TeraTypeOverride = (MoveType)Tera9RNG.GetTeraTypeFromPersonal(pk8.Species, pk8.Form, 0),
        };

        for (var i = 0; i < pk9.MarkingCount; i++)
        {
            pk9.SetMarking(i, pk8.GetMarking(i));
        }

        pk8.CopyContestStatsTo(pk9);

        pk8.CopyRibbonSetCommon3(pk9);
        pk8.CopyRibbonSetEvent3(pk9);
        pk8.CopyRibbonSetCommon4(pk9);
        pk8.CopyRibbonSetEvent4(pk9);
        pk8.CopyRibbonSetCommon6(pk9);
        pk8.CopyRibbonSetMemory6(pk9);
        pk8.CopyRibbonSetCommon7(pk9);

        pk9.PassHeldItem(pk8.HeldItem, pk8.Context, pk8.Version);

        pk9.FixAbility();

        pk9.FixMetLocation([
            GameVersion.S, GameVersion.R, GameVersion.E, GameVersion.FR, GameVersion.LG, GameVersion.CXD,
            GameVersion.D, GameVersion.P, GameVersion.Pt, GameVersion.SS, GameVersion.HG,
            GameVersion.B, GameVersion.W, GameVersion.B2, GameVersion.W2,
            GameVersion.X, GameVersion.Y, GameVersion.OR, GameVersion.AS,
            GameVersion.SN, GameVersion.MN, GameVersion.US, GameVersion.UM,
            GameVersion.SW, GameVersion.SH, GameVersion.BD, GameVersion.SP, GameVersion.PLA,
            GameVersion.SL, GameVersion.VL,
        ]);

        pk9.FixPID(pk8.IsShiny, pk8.Form, pk8.Gender, pk8.Nature);

        pk9.PassMoves(pk8);

        return pk9;
    }

    public static PB8 ConvertToPB8(this PK8 pk8)
    {
        var rnd = Util.Rand;

        var pb8 = new PB8()
        {
            Version = pk8.Version,
            MetLocation = pk8.MetLocation,
            MetDate = pk8.MetDate ?? EncounterDate.GetDateSwitch(),
            MetLevel = pk8.MetLevel,

            // EggLocation = Locations.LinkTrade6,
            // EggMetDate = pk7.MetDate ?? EncounterDate.GetDateSwitch(),

            EncryptionConstant = rnd.Rand32(),
            Species = pk8.Species,
            TID16 = pk8.TID16,
            SID16 = pk8.SID16,
            CurrentLevel = pk8.CurrentLevel,
            EXP = pk8.EXP,
            Nature = pk8.Nature,
            StatNature = pk8.Nature,
            PID = pk8.PID,
            Ball = pk8.Ball,

            Gender = pk8.Gender,
            IsNicknamed = pk8.IsNicknamed,
            Form = pk8.Form,

            CurrentHandler = 1,
            HandlingTrainerName = pk8.OriginalTrainerName,
            HandlingTrainerGender = pk8.OriginalTrainerGender,

            Language = pk8.Language,
            Nickname = pk8.IsNicknamed
                ? pk8.Nickname
                : SpeciesName.GetSpeciesNameGeneration(pk8.Species, pk8.Language, 8),
            OriginalTrainerName = pk8.OriginalTrainerName,
            OriginalTrainerGender = pk8.OriginalTrainerGender,
            OriginalTrainerFriendship = pk8.OriginalTrainerFriendship,
            HandlingTrainerFriendship = pk8.HandlingTrainerFriendship,

            Ability = pk8.Ability,
            AbilityNumber = pk8.AbilityNumber,

            IVs = [
                pk8.IV_HP,
                pk8.IV_ATK,
                pk8.IV_DEF,
                pk8.IV_SPE,
                pk8.IV_SPA,
                pk8.IV_SPD,
            ],

            EV_HP = pk8.EV_HP,
            EV_ATK = pk8.EV_ATK,
            EV_DEF = pk8.EV_DEF,
            EV_SPA = pk8.EV_SPA,
            EV_SPD = pk8.EV_SPD,
            EV_SPE = pk8.EV_SPE,
        };

        for (var i = 0; i < pk8.MarkingCount; i++)
        {
            pb8.SetMarking(i, pk8.GetMarking(i));
        }

        pk8.CopyContestStatsTo(pb8);

        pk8.CopyRibbonSetCommon3(pb8);
        pk8.CopyRibbonSetEvent3(pb8);
        pk8.CopyRibbonSetCommon4(pb8);
        pk8.CopyRibbonSetEvent4(pb8);
        pk8.CopyRibbonSetCommon6(pb8);
        pk8.CopyRibbonSetMemory6(pb8);
        pk8.CopyRibbonSetCommon7(pb8);

        pb8.PassHeldItem(pk8.HeldItem, pk8.Context, pk8.Version);

        pb8.FixAbility();

        pb8.FixMetLocation([
            GameVersion.S, GameVersion.R, GameVersion.E, GameVersion.FR, GameVersion.LG, GameVersion.CXD,
            GameVersion.D, GameVersion.P, GameVersion.Pt, GameVersion.SS, GameVersion.HG,
            GameVersion.B, GameVersion.W, GameVersion.B2, GameVersion.W2,
            GameVersion.X, GameVersion.Y, GameVersion.OR, GameVersion.AS,
            GameVersion.SN, GameVersion.MN, GameVersion.US, GameVersion.UM,
            GameVersion.SW, GameVersion.SH, GameVersion.BD, GameVersion.SP, GameVersion.PLA,
        ]);

        pb8.FixPID(pk8.IsShiny, pk8.Form, pk8.Gender, pk8.Nature);

        pb8.PassMoves(pk8);

        return pb8;
    }

    public static PA8 ConvertToPA8(this PK8 pk8)
    {
        var rnd = Util.Rand;

        var pa8 = new PA8()
        {
            Version = pk8.Version,
            MetLocation = pk8.MetLocation,
            MetDate = pk8.MetDate ?? EncounterDate.GetDateSwitch(),
            MetLevel = pk8.MetLevel,

            // EggLocation = Locations.LinkTrade6,
            // EggMetDate = pk7.MetDate ?? EncounterDate.GetDateSwitch(),

            EncryptionConstant = rnd.Rand32(),
            Species = pk8.Species,
            TID16 = pk8.TID16,
            SID16 = pk8.SID16,
            CurrentLevel = pk8.CurrentLevel,
            EXP = pk8.EXP,
            Nature = pk8.Nature,
            StatNature = pk8.Nature,
            PID = pk8.PID,
            Ball = pk8.Ball,

            Gender = pk8.Gender,
            IsNicknamed = pk8.IsNicknamed,
            Form = pk8.Form,

            CurrentHandler = 1,
            HandlingTrainerName = pk8.OriginalTrainerName,
            HandlingTrainerGender = pk8.OriginalTrainerGender,

            Language = pk8.Language,
            Nickname = pk8.IsNicknamed
                ? pk8.Nickname
                : SpeciesName.GetSpeciesNameGeneration(pk8.Species, pk8.Language, 8),
            OriginalTrainerName = pk8.OriginalTrainerName,
            OriginalTrainerGender = pk8.OriginalTrainerGender,
            OriginalTrainerFriendship = pk8.OriginalTrainerFriendship,
            HandlingTrainerFriendship = pk8.HandlingTrainerFriendship,

            Ability = pk8.Ability,
            AbilityNumber = pk8.AbilityNumber,

            IVs = [
                pk8.IV_HP,
                pk8.IV_ATK,
                pk8.IV_DEF,
                pk8.IV_SPE,
                pk8.IV_SPA,
                pk8.IV_SPD,
            ],

            EV_HP = pk8.EV_HP,
            EV_ATK = pk8.EV_ATK,
            EV_DEF = pk8.EV_DEF,
            EV_SPA = pk8.EV_SPA,
            EV_SPD = pk8.EV_SPD,
            EV_SPE = pk8.EV_SPE,
        };

        for (var i = 0; i < pk8.MarkingCount; i++)
        {
            pa8.SetMarking(i, pk8.GetMarking(i));
        }

        pk8.CopyContestStatsTo(pa8);

        pk8.CopyRibbonSetCommon3(pa8);
        pk8.CopyRibbonSetEvent3(pa8);
        pk8.CopyRibbonSetCommon4(pa8);
        pk8.CopyRibbonSetEvent4(pa8);
        pk8.CopyRibbonSetCommon6(pa8);
        pk8.CopyRibbonSetMemory6(pa8);
        pk8.CopyRibbonSetCommon7(pa8);

        pa8.FixAbility();

        pa8.FixMetLocation([
            GameVersion.S, GameVersion.R, GameVersion.E, GameVersion.FR, GameVersion.LG, GameVersion.CXD,
            GameVersion.D, GameVersion.P, GameVersion.Pt, GameVersion.SS, GameVersion.HG,
            GameVersion.B, GameVersion.W, GameVersion.B2, GameVersion.W2,
            GameVersion.X, GameVersion.Y, GameVersion.OR, GameVersion.AS,
            GameVersion.SN, GameVersion.MN, GameVersion.US, GameVersion.UM,
            GameVersion.SW, GameVersion.SH, GameVersion.BD, GameVersion.SP, GameVersion.PLA,
        ]);

        pa8.FixPID(pk8.IsShiny, pk8.Form, pk8.Gender, pk8.Nature);

        pa8.PassMoves(pk8);

        pa8.ResetHeight();
        pa8.ResetWeight();

        return pa8;
    }

    public static PK7 ConvertToPK7(this PK8 pk8)
    {
        var rnd = Util.Rand;

        var pk7 = new PK7()
        {
            Version = GameVersion.SN,
            MetLocation = 30001,
            MetDate = pk8.MetDate ?? EncounterDate.GetDateSwitch(),
            MetLevel = pk8.MetLevel,

            // EggLocation = Locations.LinkTrade6,
            // EggMetDate = pk7.MetDate ?? EncounterDate.GetDateSwitch(),

            EncryptionConstant = rnd.Rand32(),
            Species = pk8.Species,
            TID16 = pk8.TID16,
            SID16 = pk8.SID16,
            CurrentLevel = pk8.CurrentLevel,
            EXP = pk8.EXP,
            Nature = pk8.Nature,
            StatNature = pk8.Nature,
            PID = pk8.PID,
            Ball = pk8.Ball,

            Gender = pk8.Gender,
            IsNicknamed = pk8.IsNicknamed,
            Form = pk8.Form,

            CurrentHandler = 1,
            HandlingTrainerName = pk8.OriginalTrainerName,
            HandlingTrainerGender = pk8.OriginalTrainerGender,

            Language = pk8.Language,
            Nickname = pk8.IsNicknamed
                ? pk8.Nickname
                : SpeciesName.GetSpeciesNameGeneration(pk8.Species, pk8.Language, 7),
            OriginalTrainerName = pk8.OriginalTrainerName,
            OriginalTrainerGender = pk8.OriginalTrainerGender,
            OriginalTrainerFriendship = pk8.OriginalTrainerFriendship,
            HandlingTrainerFriendship = pk8.HandlingTrainerFriendship,

            Ability = pk8.Ability,
            AbilityNumber = pk8.AbilityNumber,

            IVs = [
                pk8.IV_HP,
                pk8.IV_ATK,
                pk8.IV_DEF,
                pk8.IV_SPE,
                pk8.IV_SPA,
                pk8.IV_SPD,
            ],

            EV_HP = pk8.EV_HP,
            EV_ATK = pk8.EV_ATK,
            EV_DEF = pk8.EV_DEF,
            EV_SPA = pk8.EV_SPA,
            EV_SPD = pk8.EV_SPD,
            EV_SPE = pk8.EV_SPE,
        };

        pk8.CopyContestStatsTo(pk7);

        pk8.CopyRibbonSetCommon3(pk7);
        pk8.CopyRibbonSetEvent3(pk7);
        pk8.CopyRibbonSetCommon4(pk7);
        pk8.CopyRibbonSetEvent4(pk7);
        pk8.CopyRibbonSetCommon6(pk7);
        pk8.CopyRibbonSetMemory6(pk7);
        pk8.CopyRibbonSetCommon7(pk7);

        pk7.PassHeldItem(pk8.HeldItem, pk8.Context, pk8.Version);

        pk7.FixAbility();

        pk7.FixMetLocation([GameVersion.SN, GameVersion.MN, GameVersion.US, GameVersion.UM]);

        pk7.FixPID(pk8.IsShiny, pk8.Form, pk8.Gender, pk8.Nature);

        pk7.PassMoves(pk8);

        // for Furfrou and Hoopa
        pk7.FormArgumentRemain = pk8.FormArgumentRemain;
        pk7.FormArgumentElapsed = pk8.FormArgumentElapsed;
        pk7.FormArgumentMaximum = pk8.FormArgumentMaximum;

        return pk7;
    }

    public static PK8 ConvertToPK8(this PB8 pb8)
    {
        var rnd = Util.Rand;

        var pk8 = new PK8()
        {
            Version = GameVersion.SW,
            MetLocation = 30001,
            MetDate = pb8.MetDate ?? EncounterDate.GetDateSwitch(),
            MetLevel = pb8.MetLevel,

            // EggLocation = Locations.LinkTrade6,
            // EggMetDate = pk7.MetDate ?? EncounterDate.GetDateSwitch(),

            EncryptionConstant = rnd.Rand32(),
            Species = pb8.Species,
            TID16 = pb8.TID16,
            SID16 = pb8.SID16,
            CurrentLevel = pb8.CurrentLevel,
            EXP = pb8.EXP,
            Nature = pb8.Nature,
            StatNature = pb8.Nature,
            PID = pb8.PID,
            Ball = pb8.Ball,

            Gender = pb8.Gender,
            IsNicknamed = pb8.IsNicknamed,
            Form = pb8.Form,

            CurrentHandler = 1,
            HandlingTrainerName = pb8.OriginalTrainerName,
            HandlingTrainerGender = pb8.OriginalTrainerGender,

            Language = pb8.Language,
            Nickname = pb8.IsNicknamed
                ? pb8.Nickname
                : SpeciesName.GetSpeciesNameGeneration(pb8.Species, pb8.Language, 8),
            OriginalTrainerName = pb8.OriginalTrainerName,
            OriginalTrainerGender = pb8.OriginalTrainerGender,
            OriginalTrainerFriendship = pb8.OriginalTrainerFriendship,
            HandlingTrainerFriendship = pb8.HandlingTrainerFriendship,
            HandlingTrainerLanguage = (byte)pb8.Language,

            Ability = pb8.Ability,
            AbilityNumber = pb8.AbilityNumber,

            IVs = [
                pb8.IV_HP,
                pb8.IV_ATK,
                pb8.IV_DEF,
                pb8.IV_SPE,
                pb8.IV_SPA,
                pb8.IV_SPD,
            ],

            EV_HP = pb8.EV_HP,
            EV_ATK = pb8.EV_ATK,
            EV_DEF = pb8.EV_DEF,
            EV_SPA = pb8.EV_SPA,
            EV_SPD = pb8.EV_SPD,
            EV_SPE = pb8.EV_SPE,
        };

        pb8.CopyContestStatsTo(pk8);

        pb8.CopyRibbonSetCommon3(pk8);
        pb8.CopyRibbonSetEvent3(pk8);
        pb8.CopyRibbonSetCommon4(pk8);
        pb8.CopyRibbonSetEvent4(pk8);
        pb8.CopyRibbonSetCommon6(pk8);
        pb8.CopyRibbonSetMemory6(pk8);
        pb8.CopyRibbonSetCommon7(pk8);

        pk8.PassHeldItem(pb8.HeldItem, pb8.Context, pb8.Version);

        pk8.FixAbility();

        pk8.FixMetLocation([GameVersion.SW, GameVersion.SH]);

        pk8.FixPID(pb8.IsShiny, pb8.Form, pb8.Gender, pb8.Nature);

        // for Furfrou and Hoopa
        pk8.FormArgumentRemain = pb8.FormArgumentRemain;
        pk8.FormArgumentElapsed = pb8.FormArgumentElapsed;
        pk8.FormArgumentMaximum = pb8.FormArgumentMaximum;

        pk8.PassMoves(pb8);

        return pk8;
    }

    public static PK8 ConvertToPK8(this PA8 pa8)
    {
        var rnd = Util.Rand;

        var pk8 = new PK8()
        {
            Version = GameVersion.SW,
            MetLocation = 30001,
            MetDate = pa8.MetDate ?? EncounterDate.GetDateSwitch(),
            MetLevel = pa8.MetLevel,

            // EggLocation = Locations.LinkTrade6,
            // EggMetDate = pk7.MetDate ?? EncounterDate.GetDateSwitch(),

            EncryptionConstant = rnd.Rand32(),
            Species = pa8.Species,
            TID16 = pa8.TID16,
            SID16 = pa8.SID16,
            CurrentLevel = pa8.CurrentLevel,
            EXP = pa8.EXP,
            Nature = pa8.Nature,
            StatNature = pa8.Nature,
            PID = pa8.PID,
            Ball = pa8.Ball,

            Gender = pa8.Gender,
            IsNicknamed = pa8.IsNicknamed,
            Form = pa8.Form,

            CurrentHandler = 1,
            HandlingTrainerName = pa8.OriginalTrainerName,
            HandlingTrainerGender = pa8.OriginalTrainerGender,

            Language = pa8.Language,
            Nickname = pa8.IsNicknamed
                ? pa8.Nickname
                : SpeciesName.GetSpeciesNameGeneration(pa8.Species, pa8.Language, 8),
            OriginalTrainerName = pa8.OriginalTrainerName,
            OriginalTrainerGender = pa8.OriginalTrainerGender,
            OriginalTrainerFriendship = pa8.OriginalTrainerFriendship,
            HandlingTrainerFriendship = pa8.HandlingTrainerFriendship,
            HandlingTrainerLanguage = (byte)pa8.Language,

            Ability = pa8.Ability,
            AbilityNumber = pa8.AbilityNumber,

            IVs = [
                pa8.IV_HP,
                pa8.IV_ATK,
                pa8.IV_DEF,
                pa8.IV_SPE,
                pa8.IV_SPA,
                pa8.IV_SPD,
            ],

            EV_HP = pa8.EV_HP,
            EV_ATK = pa8.EV_ATK,
            EV_DEF = pa8.EV_DEF,
            EV_SPA = pa8.EV_SPA,
            EV_SPD = pa8.EV_SPD,
            EV_SPE = pa8.EV_SPE,
        };

        pa8.CopyContestStatsTo(pk8);

        pa8.CopyRibbonSetCommon3(pk8);
        pa8.CopyRibbonSetEvent3(pk8);
        pa8.CopyRibbonSetCommon4(pk8);
        pa8.CopyRibbonSetEvent4(pk8);
        pa8.CopyRibbonSetCommon6(pk8);
        pa8.CopyRibbonSetMemory6(pk8);
        pa8.CopyRibbonSetCommon7(pk8);

        pk8.PassHeldItem(pa8.HeldItem, pa8.Context, pa8.Version);

        pk8.FixAbility();

        pk8.FixMetLocation([GameVersion.SW, GameVersion.SH]);

        pk8.FixPID(pa8.IsShiny, pa8.Form, pa8.Gender, pa8.Nature);

        // for Furfrou and Hoopa
        pk8.FormArgumentRemain = pa8.FormArgumentRemain;
        pk8.FormArgumentElapsed = pa8.FormArgumentElapsed;
        pk8.FormArgumentMaximum = pa8.FormArgumentMaximum;

        pk8.PassMoves(pa8);

        return pk8;
    }
}
