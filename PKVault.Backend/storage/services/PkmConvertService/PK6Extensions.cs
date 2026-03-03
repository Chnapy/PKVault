
using PKHeX.Core;

public static class PK6Extensions
{
    public static PK7 ConvertToPK7Fixed(this PK6 pk6)
    {
        var pk7 = pk6.ConvertToPK7();

        pk7.FixMetLocation([
            GameVersion.S, GameVersion.R, GameVersion.E, GameVersion.FR, GameVersion.LG, GameVersion.CXD,
            GameVersion.D, GameVersion.P, GameVersion.Pt, GameVersion.SS, GameVersion.HG,
            GameVersion.B, GameVersion.W, GameVersion.B2, GameVersion.W2,
            GameVersion.X, GameVersion.Y, GameVersion.OR, GameVersion.AS,
            GameVersion.SN, GameVersion.MN, GameVersion.US, GameVersion.UM,
        ]);

        pk7.FixPID(pk6.IsShiny, pk6.Form, pk6.Gender, pk6.Nature);

        return pk7;
    }

    public static PK5 ConvertToPK5(this PK6 pk6)
    {
        var rnd = Util.Rand;

        var pk5 = new PK5()
        {
            Version = GameVersion.B,
            MetLocation = 30001,
            MetDate = pk6.MetDate ?? EncounterDate.GetDateSwitch(),
            MetLevel = pk6.MetLevel,

            // EggLocation = Locations.LinkTrade6,
            // EggMetDate = pk7.MetDate ?? EncounterDate.GetDateSwitch(),

            EncryptionConstant = rnd.Rand32(),
            Species = pk6.Species,
            TID16 = pk6.TID16,
            SID16 = pk6.SID16,
            CurrentLevel = pk6.CurrentLevel,
            EXP = pk6.EXP,
            Nature = pk6.Nature,
            StatNature = pk6.Nature,
            PID = pk6.PID,
            Ball = pk6.Ball,

            Move1 = pk6.Move1,
            Move2 = pk6.Move2,
            Move3 = pk6.Move3,
            Move4 = pk6.Move4,
            Move1_PPUps = pk6.Move1_PPUps,
            Move2_PPUps = pk6.Move2_PPUps,
            Move3_PPUps = pk6.Move3_PPUps,
            Move4_PPUps = pk6.Move4_PPUps,
            Gender = pk6.Gender,
            IsNicknamed = pk6.IsNicknamed,
            Form = pk6.Form,

            CurrentHandler = 1,
            HandlingTrainerName = pk6.OriginalTrainerName,
            HandlingTrainerGender = pk6.OriginalTrainerGender,

            Language = pk6.Language,
            Nickname = pk6.IsNicknamed
                ? pk6.Nickname
                : SpeciesName.GetSpeciesNameGeneration(pk6.Species, pk6.Language, 5),
            OriginalTrainerName = pk6.OriginalTrainerName,
            OriginalTrainerGender = pk6.OriginalTrainerGender,
            OriginalTrainerFriendship = pk6.OriginalTrainerFriendship,
            HandlingTrainerFriendship = pk6.HandlingTrainerFriendship,

            Ability = pk6.Ability,
            AbilityNumber = pk6.AbilityNumber,

            IVs = [
                pk6.IV_HP,
                pk6.IV_ATK,
                pk6.IV_DEF,
                pk6.IV_SPE,
                pk6.IV_SPA,
                pk6.IV_SPD,
            ],

            EV_HP = pk6.EV_HP,
            EV_ATK = pk6.EV_ATK,
            EV_DEF = pk6.EV_DEF,
            EV_SPA = pk6.EV_SPA,
            EV_SPD = pk6.EV_SPD,
            EV_SPE = pk6.EV_SPE,
        };

        pk6.CopyContestStatsTo(pk5);

        pk6.CopyRibbonSetCommon3(pk5);
        pk6.CopyRibbonSetEvent3(pk5);
        pk6.CopyRibbonSetCommon4(pk5);
        pk6.CopyRibbonSetEvent4(pk5);

        pk5.PassHeldItem(pk6.HeldItem, pk6.Context, pk6.Version);

        pk5.FixAbility();

        pk5.FixMetLocation([GameVersion.B, GameVersion.W, GameVersion.B2, GameVersion.W2]);

        pk5.FixPID(pk6.IsShiny, pk6.Form, pk6.Gender, pk6.Nature);

        return pk5;
    }
}
