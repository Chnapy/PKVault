
using PKHeX.Core;

public static class PK4Extensions
{
    public static PK5 ConvertToPK5Fixed(this PK4 pk4)
    {
        var pk5 = pk4.ConvertToPK5();

        pk5.FixMetLocation([
            GameVersion.S, GameVersion.R, GameVersion.E, GameVersion.FR, GameVersion.LG, GameVersion.CXD,
            GameVersion.D, GameVersion.P, GameVersion.Pt, GameVersion.SS, GameVersion.HG,
            GameVersion.B, GameVersion.W, GameVersion.B2, GameVersion.W2
        ]);

        pk5.FixPID(pk4.IsShiny, pk4.Form, pk4.Gender, pk4.Nature);

        pk5.OriginalTrainerFriendship = pk4.CurrentFriendship;
        pk5.HandlingTrainerFriendship = pk4.CurrentFriendship;

        return pk5;
    }

    public static BK4 ConvertToBK4Fixed(this PK4 pk4)
    {
        var bk4 = pk4.ConvertToBK4();

        for (var i = 0; i < pk4.MarkingCount; i++)
        {
            bk4.SetMarking(i, pk4.GetMarking(i));
        }

        bk4.FixPID(pk4.IsShiny, pk4.Form, pk4.Gender, pk4.Nature);

        return bk4;
    }

    public static RK4 ConvertToRK4Fixed(this PK4 pk4)
    {
        var rk4 = pk4.ConvertToRK4();

        for (var i = 0; i < pk4.MarkingCount; i++)
        {
            rk4.SetMarking(i, pk4.GetMarking(i));
        }

        rk4.FixPID(pk4.IsShiny, pk4.Form, pk4.Gender, pk4.Nature);

        return rk4;
    }

    public static PK3 ConvertToPK3(this PK4 pk4)
    {
        var rnd = Util.Rand;

        var pk3 = new PK3()
        {
            Version = GameVersion.S,
            MetLocation = 30001,
            MetDate = pk4.MetDate ?? EncounterDate.GetDateSwitch(),
            MetLevel = pk4.MetLevel,

            // EggLocation = Locations.LinkTrade6,
            // EggMetDate = pk7.MetDate ?? EncounterDate.GetDateSwitch(),

            EncryptionConstant = rnd.Rand32(),
            Species = pk4.Species,
            TID16 = pk4.TID16,
            SID16 = pk4.SID16,
            CurrentLevel = pk4.CurrentLevel,
            EXP = pk4.EXP,
            Nature = pk4.Nature,
            StatNature = pk4.Nature,
            PID = pk4.PID,
            Ball = pk4.Ball,

            Move1 = pk4.Move1,
            Move2 = pk4.Move2,
            Move3 = pk4.Move3,
            Move4 = pk4.Move4,
            Move1_PPUps = pk4.Move1_PPUps,
            Move2_PPUps = pk4.Move2_PPUps,
            Move3_PPUps = pk4.Move3_PPUps,
            Move4_PPUps = pk4.Move4_PPUps,
            Gender = pk4.Gender,
            IsNicknamed = pk4.IsNicknamed,
            Form = pk4.Form,

            CurrentHandler = 1,
            HandlingTrainerName = pk4.OriginalTrainerName,
            HandlingTrainerGender = pk4.OriginalTrainerGender,

            Language = pk4.Language,
            Nickname = pk4.IsNicknamed
                ? pk4.Nickname
                : SpeciesName.GetSpeciesNameGeneration(pk4.Species, pk4.Language, 3),
            OriginalTrainerName = pk4.OriginalTrainerName,
            OriginalTrainerGender = pk4.OriginalTrainerGender,
            OriginalTrainerFriendship = pk4.OriginalTrainerFriendship,
            HandlingTrainerFriendship = pk4.HandlingTrainerFriendship,

            Ability = pk4.Ability,
            AbilityNumber = pk4.AbilityNumber,

            IVs = [
                pk4.IV_HP,
                pk4.IV_ATK,
                pk4.IV_DEF,
                pk4.IV_SPE,
                pk4.IV_SPA,
                pk4.IV_SPD,
            ],

            EV_HP = pk4.EV_HP,
            EV_ATK = pk4.EV_ATK,
            EV_DEF = pk4.EV_DEF,
            EV_SPA = pk4.EV_SPA,
            EV_SPD = pk4.EV_SPD,
            EV_SPE = pk4.EV_SPE,
        };

        pk4.CopyContestStatsTo(pk3);

        pk4.CopyRibbonSetCommon3(pk3);
        pk4.CopyRibbonSetEvent3(pk3);

        pk3.PassHeldItem(pk4.HeldItem, pk4.Context, pk4.Version);

        pk3.FixAbility();

        pk3.FixMetLocation([GameVersion.S, GameVersion.R, GameVersion.E, GameVersion.FR, GameVersion.LG, GameVersion.CXD]);

        pk3.FixPID(pk4.IsShiny, pk4.Form, pk4.Gender, pk4.Nature);

        return pk3;
    }
}
