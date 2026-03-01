
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
            CurrentLevel = pk8.CurrentLevel,
            EXP = pk8.EXP,
            Nature = pk8.Nature,
            StatNature = pk8.Nature,
            PID = pk8.PID,
            Ball = pk8.Ball,

            Move1 = pk8.Move1,
            Move2 = pk8.Move2,
            Move3 = pk8.Move3,
            Move4 = pk8.Move4,
            Move1_PPUps = pk8.Move1_PPUps,
            Move2_PPUps = pk8.Move2_PPUps,
            Move3_PPUps = pk8.Move3_PPUps,
            Move4_PPUps = pk8.Move4_PPUps,
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

        pk9.Heal();
        pk9.RefreshChecksum();

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
            CurrentLevel = pk8.CurrentLevel,
            EXP = pk8.EXP,
            Nature = pk8.Nature,
            StatNature = pk8.Nature,
            PID = pk8.PID,
            Ball = pk8.Ball,

            Move1 = pk8.Move1,
            Move2 = pk8.Move2,
            Move3 = pk8.Move3,
            Move4 = pk8.Move4,
            Move1_PPUps = pk8.Move1_PPUps,
            Move2_PPUps = pk8.Move2_PPUps,
            Move3_PPUps = pk8.Move3_PPUps,
            Move4_PPUps = pk8.Move4_PPUps,
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

        pb8.Heal();
        pb8.RefreshChecksum();

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
            CurrentLevel = pk8.CurrentLevel,
            EXP = pk8.EXP,
            Nature = pk8.Nature,
            StatNature = pk8.Nature,
            PID = pk8.PID,
            Ball = pk8.Ball,

            Move1 = pk8.Move1,
            Move2 = pk8.Move2,
            Move3 = pk8.Move3,
            Move4 = pk8.Move4,
            Move1_PPUps = pk8.Move1_PPUps,
            Move2_PPUps = pk8.Move2_PPUps,
            Move3_PPUps = pk8.Move3_PPUps,
            Move4_PPUps = pk8.Move4_PPUps,
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

        pa8.ResetHeight();
        pa8.ResetWeight();

        pa8.Heal();
        pa8.RefreshChecksum();

        return pa8;
    }

    public static PK7 ConvertToPK7(this PK8 pk8)
    {
        return new();
    }
}
