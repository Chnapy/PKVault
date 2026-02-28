
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

        if (pk9.IsShiny)
        {
            pa9.SetIsShiny(true);
        }
        else
        {
            pa9.SetPIDGender(pk9.Gender);
        }

        pa9.Heal();
        pa9.RefreshChecksum();

        return pa9;
    }

    public static PK8 ConvertToPK8(this PK9 pk9)
    {
        return new();
    }
}
