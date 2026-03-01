
using PKHeX.Core;

public static class PK7Extensions
{
    public static PK8 ConvertToPK8(this PK7 pk7)
    {
        var rnd = Util.Rand;

        var pk8 = new PK8()
        {
            Version = pk7.Version,
            MetLocation = 30001,
            MetDate = pk7.MetDate ?? EncounterDate.GetDateSwitch(),
            MetLevel = pk7.MetLevel,

            // EggLocation = Locations.LinkTrade6,
            // EggMetDate = pk7.MetDate ?? EncounterDate.GetDateSwitch(),

            EncryptionConstant = rnd.Rand32(),
            Species = pk7.Species,
            TID16 = pk7.TID16,
            CurrentLevel = pk7.CurrentLevel,
            EXP = pk7.EXP,
            Nature = pk7.Nature,
            StatNature = pk7.Nature,
            PID = pk7.PID,
            Ball = pk7.Ball,

            Move1 = pk7.Move1,
            Move2 = pk7.Move2,
            Move3 = pk7.Move3,
            Move4 = pk7.Move4,
            Move1_PPUps = pk7.Move1_PPUps,
            Move2_PPUps = pk7.Move2_PPUps,
            Move3_PPUps = pk7.Move3_PPUps,
            Move4_PPUps = pk7.Move4_PPUps,
            Gender = pk7.Gender,
            IsNicknamed = pk7.IsNicknamed,
            Form = pk7.Form,

            CurrentHandler = 1,
            HandlingTrainerName = pk7.OriginalTrainerName,
            HandlingTrainerGender = pk7.OriginalTrainerGender,

            Language = pk7.Language,
            Nickname = pk7.IsNicknamed
                ? pk7.Nickname
                : SpeciesName.GetSpeciesNameGeneration(pk7.Species, pk7.Language, 8),
            OriginalTrainerName = pk7.OriginalTrainerName,
            OriginalTrainerGender = pk7.OriginalTrainerGender,
            OriginalTrainerFriendship = pk7.OriginalTrainerFriendship,
            HandlingTrainerFriendship = pk7.HandlingTrainerFriendship,
            HandlingTrainerLanguage = (byte)pk7.Language,

            Ability = pk7.Ability,
            AbilityNumber = pk7.AbilityNumber,

            IVs = [
                pk7.IV_HP,
                pk7.IV_ATK,
                pk7.IV_DEF,
                pk7.IV_SPE,
                pk7.IV_SPA,
                pk7.IV_SPD,
            ],

            EV_HP = pk7.EV_HP,
            EV_ATK = pk7.EV_ATK,
            EV_DEF = pk7.EV_DEF,
            EV_SPA = pk7.EV_SPA,
            EV_SPD = pk7.EV_SPD,
            EV_SPE = pk7.EV_SPE,
        };

        // Console.WriteLine($"1-ABILITY PK7 {pk7.Ability} PK8 {pk8.Ability}");
        pk8.FixAbility();
        // Console.WriteLine($"AB1={pk8.PersonalInfo.Ability1}");
        // Console.WriteLine($"AB2={pk8.PersonalInfo.Ability2}");
        // Console.WriteLine($"2-ABILITY PK7 {pk7.Ability} PK8 {pk8.Ability}");

        pk8.FixMetLocation([
            GameVersion.S, GameVersion.R, GameVersion.E, GameVersion.FR, GameVersion.LG, GameVersion.CXD,
            GameVersion.D, GameVersion.P, GameVersion.Pt, GameVersion.SS, GameVersion.HG,
            GameVersion.B, GameVersion.W, GameVersion.B2, GameVersion.W2,
            GameVersion.X, GameVersion.Y, GameVersion.OR, GameVersion.AS,
            GameVersion.SN, GameVersion.MN, GameVersion.US, GameVersion.UM,
            GameVersion.SW, GameVersion.SH, GameVersion.BD, GameVersion.SP, GameVersion.PLA,
        ]);

        pk8.FixPID(pk7.IsShiny, pk7.Form, pk7.Gender, pk7.Nature);

        // for Furfrou and Hoopa
        pk8.FormArgumentRemain = pk7.FormArgumentRemain;
        pk8.FormArgumentElapsed = pk7.FormArgumentElapsed;
        pk8.FormArgumentMaximum = pk7.FormArgumentMaximum;

        pk8.Heal();
        pk8.RefreshChecksum();

        return pk8;
    }

    public static PB7 ConvertToPB7(this PK7 pk7)
    {
        var rnd = Util.Rand;

        byte convertEVToAV(float value) => byte.Max((byte)(value / pk7.MaxEV * 200), 2);

        int convertIVOdd(int value) => (value % 2) == 0
            ? value + 1
            : value;

        var ivAtkSpa = int.Max(
            convertIVOdd(pk7.IV_ATK),
            convertIVOdd(pk7.IV_SPA)
        );
        var ivDefSpd = int.Max(
            convertIVOdd(pk7.IV_DEF),
            convertIVOdd(pk7.IV_SPD)
        );

        var pb7 = new PB7()
        {
            ResortEventStatus = 0, // Clears old Marking Value
            MarkingValue = 0, // Clears old Super Training Bag & Hits Remaining
            HyperTrainFlags = 0, // Clears old Gen4 Encounter Type byte
            FormArgument = 0, // Clears old style Form Argument
            DirtType = 0, // Clears old FormArgumentRemain byte
            DirtLocation = 0, // Clears old FormArgumentElapsed byte

            Version = GameVersion.GO,
            MetLocation = Locations.GO7,
            MetDate = pk7.MetDate ?? EncounterDate.GetDateSwitch(),
            MetLevel = pk7.CurrentLevel,

            EncryptionConstant = rnd.Rand32(),
            Species = pk7.Species,
            TID16 = pk7.TID16,
            CurrentLevel = pk7.CurrentLevel,
            EXP = pk7.EXP,
            Nature = pk7.Nature,
            PID = pk7.PID,
            Ball = pk7.Ball,

            Move1 = pk7.Move1,
            Move2 = pk7.Move2,
            Move3 = pk7.Move3,
            Move4 = pk7.Move4,
            Move1_PPUps = pk7.Move1_PPUps,
            Move2_PPUps = pk7.Move2_PPUps,
            Move3_PPUps = pk7.Move3_PPUps,
            Move4_PPUps = pk7.Move4_PPUps,
            Gender = pk7.Gender,
            IsNicknamed = pk7.IsNicknamed,
            Form = pk7.Form,

            CurrentHandler = 1,
            HandlingTrainerName = pk7.OriginalTrainerName,
            HandlingTrainerGender = pk7.OriginalTrainerGender,

            Language = pk7.Language,
            Nickname = pk7.IsNicknamed
                ? pk7.Nickname
                : SpeciesName.GetSpeciesNameGeneration(pk7.Species, pk7.Language, 7),
            OriginalTrainerName = pk7.OriginalTrainerName,
            OriginalTrainerGender = pk7.OriginalTrainerGender,
            OriginalTrainerFriendship = pk7.OriginalTrainerFriendship,
            HandlingTrainerFriendship = pk7.HandlingTrainerFriendship,
            ReceivedDate = EncounterDate.GetDateSwitch(),

            Ability = pk7.Ability,
            AbilityNumber = pk7.AbilityNumber,

            /**
             * IV rules with PB7:
             * - HP, ATK, DEF, SPA, SPD should be odd
             * - ATK = SPA
             * - DEF = SPD
             */
            IVs = [
                convertIVOdd(pk7.IV_HP),
                ivAtkSpa,
                ivDefSpd,
                pk7.IV_SPE,
                ivAtkSpa,
                ivDefSpd,
            ],

            AV_HP = convertEVToAV(pk7.EV_HP),
            AV_ATK = convertEVToAV(pk7.EV_ATK),
            AV_DEF = convertEVToAV(pk7.EV_DEF),
            AV_SPA = convertEVToAV(pk7.EV_SPA),
            AV_SPD = convertEVToAV(pk7.EV_SPD),
            AV_SPE = convertEVToAV(pk7.EV_SPE),

        };

        // pb7.FixMetLocation([
        //     // GameVersion.RD, GameVersion.GN, GameVersion.BU, GameVersion.YW,
        //     // GameVersion.GD, GameVersion.SI, GameVersion.C,
        //     GameVersion.GP, GameVersion.GE,
        //     GameVersion.GO,
        // ]);

        pb7.ResetCalculatedValues();

        pb7.Heal();
        pb7.RefreshChecksum();

        return pb7;
    }

    public static PK6 ConvertToPK6(this PK7 pk7)
    {
        return new();
    }
}
