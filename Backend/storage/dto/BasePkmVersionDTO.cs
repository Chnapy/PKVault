
using PKHeX.Core;

public abstract class BasePkmVersionDTO : IWithId
{
    public static void FillDTO(BasePkmVersionDTO dto, PKM pkm)
    {
        Span<int> ivs = stackalloc int[6];
        pkm.GetIVs(ivs);

        Span<int> evs = stackalloc int[6];
        pkm.GetEVs(evs);

        Span<ushort> moves = stackalloc ushort[4];
        pkm.GetMoves(moves);

        var la = new LegalityAnalysis(pkm);

        dto.Generation = pkm.Generation;
        dto.PID = pkm.PID;
        // dto.Species = pkm.Species;
        dto.Nickname = pkm.IsNicknamed ? pkm.Nickname : "";
        dto.IsEgg = pkm.IsEgg;
        // dto.IsShiny = pkm.IsShiny;
        dto.Level = pkm.CurrentLevel;
        dto.Exp = pkm.EXP;
        dto.IVs = ivs.ToArray();
        dto.EVs = evs.ToArray();
        dto.Stats = pkm.GetStats(pkm.PersonalInfo);
        dto.Nature = pkm.Nature;
        dto.Ability = pkm.Ability;
        dto.Moves = moves.ToArray();
        dto.OriginTrainerName = pkm.OriginalTrainerName;
        dto.OriginMetDate = pkm.MetDate;
        dto.OriginMetLocation = pkm.MetLocation;
        dto.IsValid = pkm.Valid;
        dto.ValidityReport = la.Report();
    }

    public long Id { get; set; }

    public uint Generation { get; set; }

    public uint PID { get; set; }

    public string Nickname { get; set; }

    // public ushort Species { get; set; }

    public bool IsEgg { get; set; }

    // public bool IsShiny { get; set; }

    public byte Level { get; set; }

    public uint Exp { get; set; }

    public int[] IVs { get; set; }

    public int[] EVs { get; set; }

    public ushort[] Stats { get; set; }

    public Nature Nature { get; set; }

    public int Ability { get; set; }

    public ushort[] Moves { get; set; }

    public string OriginTrainerName { get; set; }

    public DateOnly? OriginMetDate { get; set; }

    public ushort OriginMetLocation { get; set; }

    public bool IsValid { get; set; }

    public string ValidityReport { get; set; }
}
