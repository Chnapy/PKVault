using System.Text.Json.Serialization;
using PKHeX.Core;

public abstract record BasePkmVersionDTO(
    string Id,
    byte Generation,

    [property: JsonIgnore] string SettingsLanguage,
    [property: JsonIgnore] ImmutablePKM Pkm
) : IWithId
{
    public GameVersion Version => Pkm.Version;
    public EntityContext Context => Pkm.Context;
    public uint PID => Pkm.PID;
    public bool IsNicknamed => Pkm.IsNicknamed;
    public string Nickname => Pkm.Nickname;
    public ushort Species => Pkm.Species;
    public byte Form => Pkm.Form;
    public bool IsEgg => Pkm.IsEgg;
    public bool IsShiny => Pkm.IsShiny;
    public bool IsAlpha => Pkm.IsAlpha;
    public bool IsNoble => Pkm.IsNoble;
    public bool CanGigantamax => Pkm.CanGigantamax;
    public int Ball => Pkm.Ball;
    public Gender Gender => Pkm.Gender;
    public List<byte> Types => Pkm.Types;
    public byte Level => Pkm.CurrentLevel;
    public uint Exp => Pkm.EXP;
    public uint ExpToLevelUp => Pkm.ExpToLevelUp;
    public double LevelUpPercent => Pkm.LevelUpPercent;
    public byte Friendship => Pkm.Friendship;
    public byte EggHatchCount => Pkm.EggHatchCount;
    public int[] IVs => Pkm.IVs;
    public int[] EVs => Pkm.EVs;
    public int[] Stats => Pkm.Stats;
    public int[] BaseStats => Pkm.BaseStats;
    public byte HiddenPowerType => Pkm.HiddenPowerType;
    public int HiddenPowerPower => Pkm.HiddenPowerPower;
    public MoveCategory HiddenPowerCategory => Pkm.HiddenPowerCategory;
    public Nature Nature => Pkm.Nature;
    public int Ability => Pkm.Ability;
    public List<ushort> Moves => Pkm.Moves;
    public ushort TID => Pkm.TID;
    public string OriginTrainerName => Pkm.OriginTrainerName;
    public Gender OriginTrainerGender => Pkm.OriginTrainerGender;
    public DateOnly? OriginMetDate => Pkm.OriginMetDate;
    public string OriginMetLocation => Pkm.GetOriginMetLocation(SettingsLanguage);
    public byte? OriginMetLevel => Pkm.OriginMetLevel;
    public int HeldItem => Pkm.HeldItem;
    public string? HeldItemPokeapiName => Pkm.HeldItemPokeapiName;
    public string DynamicChecksum => Pkm.DynamicChecksum;
    public int NicknameMaxLength => Pkm.MaxStringLengthNickname;

    public PKMLoadError? LoadError => Pkm.LoadError;
    public bool HasLoadError => Pkm.HasLoadError;
    public bool IsEnabled => Pkm.IsEnabled;

    public bool CanEdit => IsEnabled && !Pkm.IsEgg;
};

public record MoveItem(int Id);
