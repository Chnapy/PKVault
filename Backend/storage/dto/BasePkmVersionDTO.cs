
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

        HiddenPower.TryGetTypeIndex(pkm.HPType, out var hptype);

        if (pkm.HeldItem != 0)
        {
            // if (pkm.Nickname == "RAGEUX")
            // {
            //     Console.WriteLine($"TOTO");
            //     Console.WriteLine($"TOTO {pkm.Context.Generation()} {pkm.Version} {pkm.HeldItem}");
            //     Console.WriteLine($"TOTO");
            // }

            var stringsFr = GameInfo.GetStrings("fr");
            var heldItemText = stringsFr.GetItemStrings(pkm.Context, pkm.Version)[pkm.HeldItem];

            // var bar = GameInfo.Sources.GetItemDataSource(pkm.Version, pkm.Context, [], true);
            // var item = bar.Find(item => item.Value == pkm.HeldItem);

            // Console.WriteLine($"Item {pkm.Nickname} {pkm.Version} {pkm.Context} {pkm.HeldItem} {pkm.SpriteItem} {heldItemText}");

            dto.HeldItem = pkm.HeldItem;
            dto.SpriteItem = pkm.SpriteItem;
            dto.HeldItemText = heldItemText;
        }

        var legality = new LegalityAnalysis(pkm);

        var moveComboSource = new LegalMoveComboSource();
        var moveSource = new LegalMoveSource<ComboItem>(moveComboSource);

        moveSource.ChangeMoveSource(GameInfo.MoveDataSource);
        moveSource.ReloadMoves(legality);

        List<MoveSourceType> moveSourceTypes = [
            MoveSourceType.LevelUp,
            MoveSourceType.RelearnMoves,
            MoveSourceType.Machine,
            MoveSourceType.TypeTutor,
            MoveSourceType.SpecialTutor,
            MoveSourceType.EnhancedTutor,
            MoveSourceType.SharedEggMove,
            MoveSourceType.TechnicalRecord,
            MoveSourceType.Evolve,
        ];

        var moveSourceTypesRecord = new Dictionary<MoveSourceType, bool[]>();
        moveSourceTypes.ForEach(type =>
        {
            moveSourceTypesRecord.Add(type, LearnPossible.Get(pkm, legality.EncounterOriginal, legality.Info.EvoChainsAllGens, type));
        });

        var movesStr = GameInfo.GetStrings("fr").movelist;

        var rawMoves = new List<ushort>(){
            pkm.Move1,
            pkm.Move2,
            pkm.Move3,
            pkm.Move4
        };
        var moves = rawMoves.Select(id => new MoveItem
        {
            Id = id,
            Type = MoveInfo.GetType(id, pkm.Context),
            Text = movesStr[id],
            SourceTypes = moveSourceTypes.FindAll(type => moveSourceTypesRecord[type].Count() > id && moveSourceTypesRecord[type][id]),
        }).ToList();

        var availableMoves = new List<MoveItem>();

        moveComboSource.DataSource.ToList().ForEach(data =>
        {
            var types = moveSourceTypes.FindAll(type => moveSourceTypesRecord[type].Count() > data.Value && moveSourceTypesRecord[type][data.Value]);

            if (moveSource.Info.CanLearn((ushort)data.Value))
            {
                var item = new MoveItem
                {
                    Id = data.Value,
                    Type = MoveInfo.GetType((ushort)data.Value, pkm.Context),
                    Text = movesStr[data.Value],
                    SourceTypes = types,
                };
                availableMoves.Add(item);

                // Console.WriteLine($"{data.Value} - {data.Text} / {movesStr[data.Value]} - {eggMoves.ToList().FindAll(v => v).Count()} - {string.Join(',', types)}");
            }
        });

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
        dto.NicknameMaxLength = pkm.MaxStringLengthNickname;
        dto.AvailableMoves = availableMoves;
        dto.IsValid = legality.Parsed && pkm.Valid;
        dto.ValidityReport = legality.Report();
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

    public List<MoveItem> Moves { get; set; }

    public ushort TID { get; set; }

    public string OriginTrainerName { get; set; }

    public byte OriginTrainerGender { get; set; }

    public DateOnly? OriginMetDate { get; set; }

    public string OriginMetLocation { get; set; }

    public byte? OriginMetLevel { get; set; }

    public int? HeldItem { get; set; }

    public int? SpriteItem { get; set; }

    public string? HeldItemText { get; set; }

    public string DynamicChecksum
    {
        get
        {
            return $"{Nickname}.{Level}.{Exp}.{string.Join("-", EVs)}.{string.Join("-", Moves)}.{HeldItem}";
        }
    }

    public int NicknameMaxLength { get; set; }

    public List<MoveItem> AvailableMoves { get; set; }

    public bool IsValid { get; set; }

    public string ValidityReport { get; set; }
}

public struct MoveItem
{
    public int Id { get; set; }
    public byte Type { get; set; }
    public string Text { get; set; }
    public List<MoveSourceType> SourceTypes { get; set; }
};
