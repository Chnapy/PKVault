
using PKHeX.Core;

public class PK3Converter(PKMConverterUtils utils)
{
    public PK4 ConvertToPK4Fixed(PK3 pk3, PKMRndValues? rndValues)
    {
        var pk4 = pk3.ConvertToPK4();

        utils.FixMetLocation(pk4, [
            GameVersion.S, GameVersion.R, GameVersion.E, GameVersion.FR, GameVersion.LG, GameVersion.CXD,
            GameVersion.D, GameVersion.P, GameVersion.Pt, GameVersion.SS, GameVersion.HG
        ]);

        if (rndValues == null)
            utils.FixPID(pk4, pk3.IsShiny, pk3.Form, pk3.Gender, pk3.Nature);

        utils.CopyMovesFrom(pk4, pk3);

        pk4.OriginalTrainerFriendship = pk3.CurrentFriendship;
        pk4.HandlingTrainerFriendship = pk3.CurrentFriendship;

        return pk4;
    }

    public XK3 ConvertToXK3Fixed(PK3 pk3, PKMRndValues? rndValues)
    {
        var pk = pk3.ConvertToXK3();

        for (var i = 0; i < pk3.MarkingCount; i++)
        {
            pk.SetMarking(i, pk3.GetMarking(i));
        }

        if (rndValues == null)
            utils.FixPID(pk, pk3.IsShiny, pk3.Form, pk3.Gender, pk3.Nature);

        utils.CopyMovesFrom(pk, pk3);

        return pk;
    }

    public CK3 ConvertToCK3Fixed(PK3 pk3, PKMRndValues? rndValues)
    {
        var pk = pk3.ConvertToCK3();

        for (var i = 0; i < pk3.MarkingCount; i++)
        {
            pk.SetMarking(i, pk3.GetMarking(i));
        }

        if (rndValues == null)
            utils.FixPID(pk, pk3.IsShiny, pk3.Form, pk3.Gender, pk3.Nature);

        utils.CopyMovesFrom(pk, pk3);

        return pk;
    }

    public PK2 ConvertToPK2(PK3 pk3, PKMRndValues? rndValues)
    {
        var pk2 = new PK2()
        {
            Version = GameVersion.C,
            EncryptionConstant = rndValues?.EncryptionConstant ?? Util.Rand.Rand32(),
            Species = pk3.Species,
            TID16 = pk3.TID16,
            CurrentLevel = pk3.CurrentLevel,
            EXP = pk3.EXP,
            Nature = Experience.GetNatureVC(pk3.EXP),
            PID = rndValues?.PID ?? Util.Rand.Rand32(),
            Ball = 4,

            MetLocation = 0,
            MetDate = pk3.MetDate,
            MetLevel = 0,

            Gender = pk3.Gender,
            Form = pk3.Form,

            Language = pk3.Language,

            CurrentHandler = 1,
            OriginalTrainerName = pk3.OriginalTrainerName,
            OriginalTrainerGender = pk3.OriginalTrainerGender,
            OriginalTrainerFriendship = pk3.CurrentFriendship,
            HandlingTrainerName = pk3.OriginalTrainerName,
            HandlingTrainerGender = pk3.OriginalTrainerGender,
            HandlingTrainerFriendship = pk3.CurrentFriendship,

            PokerusState = pk3.PokerusState,
        };

        pk2.SetNickname(pk3.IsNicknamed ? pk3.Nickname : "");

        utils.CopyHeldItemByStringFrom(pk2, pk3.HeldItem, pk3.Context, pk3.Version);

        utils.FixMetLocation(pk2, [GameVersion.GD, GameVersion.SI, GameVersion.C]);

        pk2.SetIVs(ConvertIVsToG2(utils.GetAllIVs(pk3)));

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

        if (rndValues == null)
            utils.FixPID(pk2, pk3.IsShiny, pk3.Form, pk3.Gender, pk2.Nature);

        utils.CopyMovesFrom(pk2, pk3);

        return pk2;
    }

    public int[] ConvertIVsToG2(int[] ivs)
    {
        return [.. ivs.Select(ConvertIVG3ToG2)];
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
