using System.Text.Json.Serialization;
using PKHeX.Core;
using PKHeX.Core.Searching;

public abstract class BasePkmVersionDTO : IWithId
{
    public static byte GetForm(PKM pkm)
    {
        if (pkm.Species == (ushort)PKHeX.Core.Species.Alcremie)
        {
            if (pkm is PK8 pk8)
            {
                return (byte)(pkm.Form * 7 + pk8.FormArgument);
            }
            else if (pkm is PK9 pk9)
            {
                return (byte)(pkm.Form * 7 + pk9.FormArgument);
            }
        }
        return pkm.Form;
    }

    /**
     * Generate ID similar to PKHeX one.
     * Note that Species & Form can change over time (evolve),
     * so only first species of evolution group is used.
     */
    public static string GetPKMIdBase(PKM pkm)
    {
        static ushort GetBaseSpecies(ushort species)
        {
            var previousSpecies = StaticDataService.staticData.Evolves[species].PreviousSpecies;
            if (previousSpecies != null)
            {
                return GetBaseSpecies((ushort)previousSpecies);
            }
            return species;
        }

        var clone = pkm.Clone();
        clone.Species = GetBaseSpecies(pkm.Species);
        clone.Form = 0;
        if (pkm is GBPKM gbpkm && clone is GBPKM gbclone)
        {
            gbclone.DV16 = gbpkm.DV16;
        }
        else
        {
            clone.PID = pkm.PID;
            Span<int> ivs = [
                pkm.IV_HP,
                pkm.IV_ATK,
                pkm.IV_DEF,
                pkm.IV_SPE,
                pkm.IV_SPA,
                pkm.IV_SPD,
            ];
            clone.SetIVs(ivs);
        }
        var hash = SearchUtil.HashByDetails(clone);
        var id = $"G{clone.Format}_{hash}_{clone.TID16}";   // note: SID not stored by pk files

        return id;
    }

    // public static string GetOldPKMIdBase(PKM pkm)
    // {
    //     var hash = SearchUtil.HashByDetails(pkm);
    //     var id = $"G{pkm.Format}{hash}";

    //     return id;
    // }

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
    public readonly PKM Pkm;

    protected BasePkmVersionDTO(
        string id,
        PKM pkm,
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
        Form = GetForm(Pkm);
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
        IVs = [
            Pkm.IV_HP,
            Pkm.IV_ATK,
            Pkm.IV_DEF,
            Pkm.IV_SPA,
            Pkm.IV_SPD,
            Pkm.IV_SPE,
        ];

        if (Pkm is PB7 pb7)
        {
            EVs = [
                pb7.AV_HP,
                pb7.AV_ATK,
                pb7.AV_DEF,
                pb7.AV_SPA,
                pb7.AV_SPD,
                pb7.AV_SPE,
            ];
        }
        else
        {
            EVs = [
                Pkm.EV_HP,
                Pkm.EV_ATK,
                Pkm.EV_DEF,
                Pkm.EV_SPA,
                Pkm.EV_SPD,
                Pkm.EV_SPE,
            ];
        }

        pkm.SetStats(pkm.GetStats(pkm.PersonalInfo));
        Stats = [
            pkm.Stat_HPMax,
            pkm.Stat_ATK,
            pkm.Stat_DEF,
            pkm.Stat_SPA,
            pkm.Stat_SPD,
            pkm.Stat_SPE,
        ];

        BaseStats = [
            pkm.PersonalInfo.GetBaseStatValue(0),
            pkm.PersonalInfo.GetBaseStatValue(1),
            pkm.PersonalInfo.GetBaseStatValue(2),
            pkm.PersonalInfo.GetBaseStatValue(4),
            pkm.PersonalInfo.GetBaseStatValue(5),
            pkm.PersonalInfo.GetBaseStatValue(3),
        ];

        HiddenPower.TryGetTypeIndex(pkm.HPType, out var hptype);
        HiddenPowerType = (byte)(hptype + 1);

        HiddenPowerPower = Pkm.HPPower;

        HiddenPowerCategory = Generation <= 3
            ? (HiddenPowerType < 10 ? MoveCategory.PHYSICAL : MoveCategory.SPECIAL) // TODO duplicate with static-data
            : MoveCategory.SPECIAL;

        Nature = Pkm is GBPKM gbpkm ? Experience.GetNatureVC(gbpkm.EXP) : Pkm.Nature;

        Ability = Pkm.Ability == -1
            ? 0
            : Pkm.Ability;

        Moves = [
            Pkm.Move1,
            Pkm.Move2,
            Pkm.Move3,
            Pkm.Move4
        ];

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
}

public struct MoveItem
{
    public int Id { get; set; }
    public byte Type { get; set; }
    public string Text { get; set; }
    public List<MoveSourceType> SourceTypes { get; set; }
};
