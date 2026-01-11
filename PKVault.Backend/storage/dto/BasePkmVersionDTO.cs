using System.Text.Json.Serialization;
using PKHeX.Core;
using PKHeX.Core.Searching;

public abstract class BasePkmVersionDTO : IWithId
{
    public string Id { get; }

    public byte Generation { get; }

    public GameVersion Version { get; }

    public EntityContext Context { get; }

    public uint PID { get; }

    public bool IsNicknamed { get; }

    public string Nickname { get; }

    public ushort Species { get; }

    public byte Form { get; }

    // public string SpeciesName
    // {
    //     get
    //     {
    //         return GameInfo.GetStrings(SettingsService.AppSettings.GetSafeLanguage()).Species[Pkm.Species];
    //     }
    // }

    public bool IsEgg { get; }

    public bool IsShiny { get; }

    public bool IsAlpha { get; }

    public bool IsNoble { get; }

    public bool CanGigantamax { get; }

    public int Ball { get; }

    public Gender Gender { get; }

    public List<byte> Types { get; }

    public byte Level { get; }

    public uint Exp { get; }

    public uint ExpToLevelUp { get; }

    public double LevelUpPercent { get; }

    public byte Friendship { get; }

    public byte EggHatchCount { get; }

    public int[] IVs { get; }

    public int[] EVs { get; }

    public int[] Stats { get; }

    public int[] BaseStats { get; }

    public byte HiddenPowerType { get; }

    public int HiddenPowerPower { get; }

    public MoveCategory HiddenPowerCategory { get; }

    public Nature Nature { get; }

    public int Ability { get; }

    public List<ushort> Moves { get; }

    public ushort TID { get; }

    public string OriginTrainerName { get; }

    public Gender OriginTrainerGender { get; }

    public DateOnly? OriginMetDate { get; }

    public string OriginMetLocation { get; }

    public byte? OriginMetLevel { get; }

    public int HeldItem { get; }

    public string? HeldItemPokeapiName { get; }

    public string DynamicChecksum { get; }

    public int NicknameMaxLength { get; }

    public bool CanEdit { get; }

    public double LoadingDuration { get; set; }

    [JsonIgnore()]
    public readonly ImmutablePKM Pkm;

    protected BasePkmVersionDTO(
        string id,
        ImmutablePKM pkm,
        byte generation
    )
    {
        Id = id;
        Pkm = pkm;

        Generation = generation;

        Version = Pkm.Version;
        Context = Pkm.Context;
        PID = Pkm.PID;
        IsNicknamed = Pkm.IsNicknamed;
        Nickname = Pkm.Nickname;
        Species = Pkm.Species;
        Form = Pkm.Form;
        IsEgg = Pkm.IsEgg;
        IsShiny = Pkm.IsShiny;
        IsAlpha = Pkm is IAlpha pka && pka.IsAlpha;
        IsNoble = Pkm is INoble pkn && pkn.IsNoble;
        CanGigantamax = Pkm is IGigantamaxReadOnly pkg && pkg.CanGigantamax;
        Ball = StaticDataService.GetBallPokeApiId((Ball)Pkm.Ball);
        Gender = (Gender)Pkm.Gender;
        Types = DexGenService.GetTypes(Generation, Pkm.PersonalInfo);
        Level = Pkm.CurrentLevel;
        Exp = Pkm.EXP;
        ExpToLevelUp = Experience.GetEXPToLevelUp(Pkm.CurrentLevel, Pkm.PersonalInfo.EXPGrowth);
        LevelUpPercent = Experience.GetEXPToLevelUpPercentage(Pkm.CurrentLevel, Pkm.EXP, Pkm.PersonalInfo.EXPGrowth);
        Friendship = Pkm.IsEgg ? (byte)0 : Pkm.CurrentFriendship;
        EggHatchCount = Pkm.IsEgg ? Pkm.CurrentFriendship : (byte)0;

        IVs = Pkm.GetIVs();
        EVs = Pkm.GetEVs();
        Stats = pkm.GetStats();
        BaseStats = Pkm.GetBaseStats();

        HiddenPower.TryGetTypeIndex(pkm.HPType, out var hptype);
        HiddenPowerType = (byte)(hptype + 1);

        HiddenPowerPower = Pkm.HPPower;

        HiddenPowerCategory = Generation <= 3
            ? (HiddenPowerType < 10 ? MoveCategory.PHYSICAL : MoveCategory.SPECIAL) // TODO duplicate with static-data
            : MoveCategory.SPECIAL;

        Nature = Pkm.GetNature();

        Ability = Pkm.Ability == -1
            ? 0
            : Pkm.Ability;

        Moves = [.. Pkm.GetMoves()];

        TID = Pkm.TID16;

        OriginTrainerName = Pkm.OriginalTrainerName;
        OriginTrainerGender = (Gender)Pkm.OriginalTrainerGender;
        OriginMetDate = Pkm.MetDate;
        OriginMetLocation = GameInfo.GetStrings(SettingsService.BaseSettings.GetSafeLanguage())
            .GetLocationName(pkm.WasEgg, pkm.MetLocation, pkm.Format, pkm.Generation, pkm.Version);
        OriginMetLevel = Pkm.MetLevel == 0 ? null : Pkm.MetLevel;

        HeldItem = ItemConverter.GetItemForFormat(pkm.HeldItem, pkm.Context, StaticDataService.LAST_ENTITY_CONTEXT);
        HeldItemPokeapiName = HeldItem > 0
            ? (HeldItem < GameInfo.Strings.Item.Count ? StaticDataService.GetPokeapiItemName(GameInfo.Strings.Item[HeldItem]) : "")
            : null;

        // Data used here is considered to be mutable over pkm lifetime
        DynamicChecksum = $"{Species}.{Form}.{Nickname}.{Level}.{Exp}.{string.Join("-", EVs)}.{string.Join("-", Moves)}.{HeldItem}";

        NicknameMaxLength = Pkm.MaxStringLengthNickname;

        CanEdit = !IsEgg;
    }

    public abstract BasePkmVersionDTO WithPKM(ImmutablePKM pkm);
}

public struct MoveItem
{
    public int Id { get; set; }
    public byte Type { get; set; }
    public string Text { get; set; }
    public List<MoveSourceType> SourceTypes { get; set; }
};
