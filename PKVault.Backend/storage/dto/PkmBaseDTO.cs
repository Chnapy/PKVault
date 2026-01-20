using System.Text.Json.Serialization;
using PKHeX.Core;

public abstract record PkmBaseDTO(
    string Id,
    byte Generation,

    int BoxId,
    int BoxSlot,

    bool IsDuplicate,

    [property: JsonIgnore] string SettingsLanguage,
    [property: JsonIgnore] ImmutablePKM Pkm,
    [property: JsonIgnore] Dictionary<ushort, StaticEvolve> Evolves
) : IWithId
{
    public string IdBase => Pkm.GetPKMIdBase(Evolves);
    public string BoxKey => PkmVersionLoader.GetEntityByBoxKey(BoxId, BoxSlot);

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

    public bool IsShadow => Pkm.IsShadow;

    public virtual bool CanMove => true;
    public virtual bool CanDelete => true;
    public virtual bool CanMoveToSave => IsEnabled && Pkm.Version > 0 && Pkm.Generation > 0 && CanMove;

    public bool CanEdit => IsEnabled && !IsEgg;
    public bool CanEvolve
    {
        get
        {
            if (!IsEnabled || IsEgg || IsShadow)
                return false;

            if (!Evolves.TryGetValue(Species, out var staticEvolves))
            {
                return false;
            }

            if (staticEvolves.Trade.TryGetValue((byte)Version, out var tradeEvolveSpecies))
            {
                return Level >= tradeEvolveSpecies.MinLevel;
            }

            if (!staticEvolves.TradeWithItem.TryGetValue(HeldItemPokeapiName ?? "", out var tradeWithItemEvolveSpecies))
            {
                return false;
            }

            if (!tradeWithItemEvolveSpecies.TryGetValue((byte)Version, out var evolveSpecies))
            {
                return false;
            }

            return Level >= evolveSpecies.MinLevel;
        }
    }

    public PKMLoadError? LoadError => Pkm.LoadError;
    public bool HasLoadError => Pkm.HasLoadError;
    public bool IsEnabled => Pkm.IsEnabled;
};

public record MoveItem(int Id);
