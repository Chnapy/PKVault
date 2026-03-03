
using PKHeX.Core;

public static class PK5Extensions
{
    public static PK6 ConvertToPK6Fixed(this PK5 pk5)
    {
        var pk6 = pk5.ConvertToPK6();

        pk6.FixMetLocation([
            GameVersion.S, GameVersion.R, GameVersion.E, GameVersion.FR, GameVersion.LG, GameVersion.CXD,
            GameVersion.D, GameVersion.P, GameVersion.Pt, GameVersion.SS, GameVersion.HG,
            GameVersion.B, GameVersion.W, GameVersion.B2, GameVersion.W2,
            GameVersion.X, GameVersion.Y, GameVersion.OR, GameVersion.AS
        ]);

        pk6.PassHeldItem(pk5.HeldItem, pk5.Context, pk5.Version);

        pk6.FixPID(pk5.IsShiny, pk5.Form, pk5.Gender, pk5.Nature);

        pk6.OriginalTrainerFriendship = pk5.CurrentFriendship;
        pk6.HandlingTrainerFriendship = pk5.CurrentFriendship;

        return pk6;
    }

    public static PK4 ConvertToPK4(this PK5 pk5)
    {
        var rnd = Util.Rand;

        var pk4 = new PK4()
        {
            Version = GameVersion.D,
            MetLocation = 30001,
            MetDate = pk5.MetDate ?? EncounterDate.GetDateSwitch(),
            MetLevel = pk5.MetLevel,

            // EggLocation = Locations.LinkTrade6,
            // EggMetDate = pk7.MetDate ?? EncounterDate.GetDateSwitch(),

            EncryptionConstant = rnd.Rand32(),
            Species = pk5.Species,
            TID16 = pk5.TID16,
            SID16 = pk5.SID16,
            CurrentLevel = pk5.CurrentLevel,
            EXP = pk5.EXP,
            Nature = pk5.Nature,
            StatNature = pk5.Nature,
            PID = pk5.PID,
            Ball = pk5.Ball,

            Move1 = pk5.Move1,
            Move2 = pk5.Move2,
            Move3 = pk5.Move3,
            Move4 = pk5.Move4,
            Move1_PPUps = pk5.Move1_PPUps,
            Move2_PPUps = pk5.Move2_PPUps,
            Move3_PPUps = pk5.Move3_PPUps,
            Move4_PPUps = pk5.Move4_PPUps,
            Gender = pk5.Gender,
            IsNicknamed = pk5.IsNicknamed,
            Form = pk5.Form,

            CurrentHandler = 1,
            HandlingTrainerName = pk5.OriginalTrainerName,
            HandlingTrainerGender = pk5.OriginalTrainerGender,

            Language = pk5.Language,
            Nickname = pk5.IsNicknamed
                ? pk5.Nickname
                : SpeciesName.GetSpeciesNameGeneration(pk5.Species, pk5.Language, 4),
            OriginalTrainerName = pk5.OriginalTrainerName,
            OriginalTrainerGender = pk5.OriginalTrainerGender,
            OriginalTrainerFriendship = pk5.OriginalTrainerFriendship,
            HandlingTrainerFriendship = pk5.HandlingTrainerFriendship,

            Ability = pk5.Ability,
            AbilityNumber = pk5.AbilityNumber,

            IVs = [
                pk5.IV_HP,
                pk5.IV_ATK,
                pk5.IV_DEF,
                pk5.IV_SPE,
                pk5.IV_SPA,
                pk5.IV_SPD,
            ],

            EV_HP = pk5.EV_HP,
            EV_ATK = pk5.EV_ATK,
            EV_DEF = pk5.EV_DEF,
            EV_SPA = pk5.EV_SPA,
            EV_SPD = pk5.EV_SPD,
            EV_SPE = pk5.EV_SPE,
        };

        pk5.CopyContestStatsTo(pk4);

        pk5.CopyRibbonSetCommon3(pk4);
        pk5.CopyRibbonSetEvent3(pk4);
        pk5.CopyRibbonSetCommon4(pk4);
        pk5.CopyRibbonSetEvent4(pk4);

        pk4.PassHeldItem(pk5.HeldItem, pk5.Context, pk5.Version);

        pk4.FixAbility();

        pk4.FixMetLocation([GameVersion.D, GameVersion.P, GameVersion.Pt, GameVersion.HG, GameVersion.SS]);

        pk4.FixPID(pk5.IsShiny, pk5.Form, pk5.Gender, pk5.Nature);

        return pk4;
    }
}
