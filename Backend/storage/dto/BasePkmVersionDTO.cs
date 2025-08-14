
using PKHeX.Core;

public abstract class BasePkmVersionDTO : IWithId<string>
{
    public static void FillDTO(BasePkmVersionDTO dto, PKM pkm)
    {
        int[] ivs = [
            pkm.IV_HP,
            pkm.IV_ATK,
            pkm.IV_DEF,
            pkm.IV_SPA,
            pkm.IV_SPD,
            pkm.IV_SPE,
        ];

        int[] evs = [
            pkm.EV_HP,
            pkm.EV_ATK,
            pkm.EV_DEF,
            pkm.EV_SPA,
            pkm.EV_SPD,
            pkm.EV_SPE,
        ];

        pkm.SetStats(pkm.GetStats(pkm.PersonalInfo));
        int[] stats = [
            pkm.Stat_HPMax,
            pkm.Stat_ATK,
            pkm.Stat_DEF,
            pkm.Stat_SPA,
            pkm.Stat_SPD,
            pkm.Stat_SPE,
        ];

        ushort[] moves = [
            pkm.Move1,
            pkm.Move2,
            pkm.Move3,
            pkm.Move4
        ];

        var la = new LegalityAnalysis(pkm);

        HiddenPower.TryGetTypeIndex(pkm.HPType, out var hptype);

        if (pkm.HeldItem != 0)
        {
            var stringsFr = GameInfo.GetStrings("fr");
            var heldItemText = stringsFr.GetItemStrings(pkm.Context, pkm.Version)[pkm.HeldItem];

            // var bar = GameInfo.Sources.GetItemDataSource(pkm.Version, pkm.Context, [], true);
            // var item = bar.Find(item => item.Value == pkm.HeldItem);

            // Console.WriteLine($"Item {pkm.Nickname} {pkm.Version} {pkm.Context} {pkm.HeldItem} {pkm.SpriteItem} {heldItemText}");

            dto.HeldItem = pkm.HeldItem;
            dto.SpriteItem = pkm.SpriteItem;
            dto.HeldItemText = heldItemText;
        }

        dto.Version = pkm.Version;
        dto.PID = pkm.PID;
        dto.Species = pkm.Species;
        dto.Nickname = pkm.Nickname;
        dto.IsEgg = pkm.IsEgg;
        dto.IsShiny = pkm.IsShiny;
        dto.Ball = pkm.Ball;
        dto.Gender = pkm.Gender;
        dto.Level = pkm.CurrentLevel;
        dto.Exp = pkm.EXP;
        dto.IVs = ivs;
        dto.EVs = evs;
        dto.Stats = stats;//pkm.GetStats(pkm.PersonalInfo); ;
        dto.HiddenPowerType = hptype + 1;
        dto.HiddenPowerPower = pkm.HPPower;
        dto.Nature = pkm.Generation > 2 ? pkm.Nature : null;
        dto.Ability = pkm.Ability == -1 ? null : pkm.Ability;
        dto.Moves = moves;
        dto.TID = pkm.TID16;
        dto.OriginTrainerName = pkm.OriginalTrainerName;
        dto.OriginTrainerGender = pkm.OriginalTrainerGender;
        dto.OriginMetDate = pkm.MetDate;
        dto.OriginMetLocation = GameInfo.GetStrings("fr").GetLocationName(pkm.WasEgg, pkm.MetLocation, pkm.Format, pkm.Generation, pkm.Version);
        dto.OriginMetLevel = pkm.MetLevel == 0 ? null : pkm.MetLevel;
        dto.PkmData = pkm.Data;
        dto.IsValid = la.Parsed && pkm.Valid;
        dto.ValidityReport = la.Report();
    }

    public string Id { get; set; }

    public uint Generation { get; set; }

    public GameVersion Version { get; set; }

    public uint PID { get; set; }

    public string Nickname { get; set; }

    public ushort Species { get; set; }

    public bool IsEgg { get; set; }

    public bool IsShiny { get; set; }

    public byte Ball { get; set; }

    public byte Gender { get; set; }

    public byte Level { get; set; }

    public uint Exp { get; set; }

    public int[] IVs { get; set; }

    public int[] EVs { get; set; }

    public int[] Stats { get; set; }

    public int HiddenPowerType { get; set; }

    public int HiddenPowerPower { get; set; }

    public Nature? Nature { get; set; }

    public int? Ability { get; set; }

    public ushort[] Moves { get; set; }

    public ushort TID { get; set; }

    public string OriginTrainerName { get; set; }

    public byte OriginTrainerGender { get; set; }

    public DateOnly? OriginMetDate { get; set; }

    public string OriginMetLocation { get; set; }

    public byte? OriginMetLevel { get; set; }

    public int? HeldItem { get; set; }

    public int? SpriteItem { get; set; }

    public string? HeldItemText { get; set; }

    public byte[] PkmData { get; set; }

    public bool IsValid { get; set; }

    public string ValidityReport { get; set; }
}
