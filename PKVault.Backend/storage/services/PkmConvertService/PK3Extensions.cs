
using PKHeX.Core;

public static class PK3Extensions
{
    public static PK4 ConvertToPK4Fixed(this PK3 pk3)
    {
        var pk4 = pk3.ConvertToPK4();

        pk4.FixMetLocation([
            GameVersion.S, GameVersion.R, GameVersion.E, GameVersion.FR, GameVersion.LG, GameVersion.CXD,
            GameVersion.D, GameVersion.P, GameVersion.Pt, GameVersion.SS, GameVersion.HG
        ]);

        pk4.FixPID(pk3.IsShiny, pk3.Form, pk3.Gender, pk3.Nature);

        pk4.PassMoves(pk3);

        pk4.OriginalTrainerFriendship = pk3.CurrentFriendship;
        pk4.HandlingTrainerFriendship = pk3.CurrentFriendship;

        return pk4;
    }

    public static XK3 ConvertToXK3Fixed(this PK3 pk3)
    {
        var pk = pk3.ConvertToXK3();

        for (var i = 0; i < pk3.MarkingCount; i++)
        {
            pk.SetMarking(i, pk3.GetMarking(i));
        }

        pk.FixPID(pk3.IsShiny, pk3.Form, pk3.Gender, pk3.Nature);

        pk.PassMoves(pk3);

        return pk;
    }

    public static CK3 ConvertToCK3Fixed(this PK3 pk3)
    {
        var pk = pk3.ConvertToCK3();

        for (var i = 0; i < pk3.MarkingCount; i++)
        {
            pk.SetMarking(i, pk3.GetMarking(i));
        }

        pk.FixPID(pk3.IsShiny, pk3.Form, pk3.Gender, pk3.Nature);

        pk.PassMoves(pk3);

        return pk;
    }

    public static PK2 ConvertToPK2(this PK3 pk3)
    {
        var rnd = Util.Rand;

        var pk2 = new PK2()
        {
            Version = GameVersion.C,
            EncryptionConstant = rnd.Rand32(),
            Species = pk3.Species,
            TID16 = pk3.TID16,
            CurrentLevel = pk3.CurrentLevel,
            EXP = pk3.EXP,
            Nature = Experience.GetNatureVC(pk3.EXP),
            PID = rnd.Rand32(),
            Ball = 4,

            MetLocation = 0,
            MetDate = pk3.MetDate,
            MetLevel = 0,

            Gender = pk3.Gender,
            IsNicknamed = pk3.IsNicknamed,
            Form = pk3.Form,

            Language = pk3.Language,
            Nickname = pk3.IsNicknamed
                ? pk3.Nickname
                : SpeciesName.GetSpeciesNameGeneration(pk3.Species, pk3.Language, 2),

            CurrentHandler = 1,
            OriginalTrainerName = pk3.OriginalTrainerName,
            OriginalTrainerGender = pk3.OriginalTrainerGender,
            OriginalTrainerFriendship = pk3.CurrentFriendship,
            HandlingTrainerName = pk3.OriginalTrainerName,
            HandlingTrainerGender = pk3.OriginalTrainerGender,
            HandlingTrainerFriendship = pk3.CurrentFriendship,
        };

        pk2.PassHeldItemByString(pk3.HeldItem, pk3.Context, pk3.Version);

        pk2.FixMetLocation([GameVersion.GD, GameVersion.SI, GameVersion.C]);

        Span<int> ivs = [
            ConvertIVG3ToG2(pk3.IV_HP),
            ConvertIVG3ToG2(pk3.IV_ATK),
            ConvertIVG3ToG2(pk3.IV_DEF),
            ConvertIVG3ToG2(pk3.IV_SPE),
            ConvertIVG3ToG2(pk3.IV_SPA),
            ConvertIVG3ToG2(pk3.IV_SPD),
        ];
        pk2.SetIVs(ivs);

        Span<int> evs = [
            ConvertEVG3ToG2(pk3.EV_HP),
            ConvertEVG3ToG2(pk3.EV_ATK),
            ConvertEVG3ToG2(pk3.EV_DEF),
            ConvertEVG3ToG2(pk3.EV_SPE),
            ConvertEVG3ToG2(pk3.EV_SPA),
            ConvertEVG3ToG2(pk3.EV_SPD),
        ];
        // var totalEvs = evs.ToArray().Sum();
        // if (totalEvs > EffortValues.Max510)
        // {
        //     for (var i = 0; i < evs.Length; i++)
        //     {
        //         evs[i] = (int)(evs[i] * ((decimal)EffortValues.Max510 / totalEvs));
        //     }
        // }
        pk2.SetEVs(evs);

        pk2.FixPID(pk3.IsShiny, pk3.Form, pk3.Gender, pk2.Nature);

        pk2.PassMoves(pk3);

        return pk2;
    }

    private static int ConvertEVG3ToG2(float evValue)
    {
        return (int)(evValue * ushort.MaxValue / EffortValues.Max255);
    }

    private static int ConvertIVG3ToG2(int ivValue)
    {
        return ivValue / 2;
    }
}
