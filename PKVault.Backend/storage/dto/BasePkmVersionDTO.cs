
using System.Text.Json.Serialization;
using PKHeX.Core;
using PKHeX.Core.Searching;

public abstract class BasePkmVersionDTO : IWithId
{
    public string Id { get { return GetPKMIdBase(Pkm); } }

    public byte Generation { get { return GetGeneration(); } }

    public GameVersion Version
    {
        get { return Pkm.Version; }
    }

    public EntityContext Context
    {
        get { return Pkm.Context; }
    }

    public uint PID
    {
        get { return Pkm.PID; }
    }

    public bool IsNicknamed { get => Pkm.IsNicknamed; }

    public string Nickname
    {
        get { return Pkm.Nickname; }
    }

    public ushort Species
    {
        get { return Pkm.Species; }
    }

    public byte Form
    {
        get => GetForm(Pkm);
    }

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

    // public string SpeciesName
    // {
    //     get
    //     {
    //         return GameInfo.GetStrings(SettingsService.AppSettings.GetSafeLanguage()).Species[Pkm.Species];
    //     }
    // }

    public bool IsEgg
    {
        get { return Pkm.IsEgg; }
    }

    public bool IsShiny
    {
        get { return Pkm.IsShiny; }
    }

    public bool IsAlpha
    {
        get => Pkm is IAlpha pka && pka.IsAlpha;
    }

    public bool IsNoble
    {
        get => Pkm is INoble pkn && pkn.IsNoble;
    }

    public bool CanGigantamax
    {
        get => Pkm is IGigantamaxReadOnly pkg && pkg.CanGigantamax;
    }

    public int Ball => StaticDataService.GetBallPokeApiId((Ball)Pkm.Ball);

    public PKHeX.Core.Gender Gender { get => (PKHeX.Core.Gender)Pkm.Gender; }

    public List<byte> Types
    {
        get
        {
            var type1 = Generation <= 2
                ? Dex123Service.GetG12Type(Pkm.PersonalInfo.Type1)
                : Pkm.PersonalInfo.Type1;
            var type2 = Generation <= 2
                ? Dex123Service.GetG12Type(Pkm.PersonalInfo.Type2)
                : Pkm.PersonalInfo.Type2;
            return [.. new List<byte>() { (byte)(type1 + 1), (byte)(type2 + 1) }.Distinct()];
        }
    }

    public byte Level
    {
        get { return Pkm.CurrentLevel; }
    }

    public uint Exp
    {
        get { return Pkm.EXP; }
    }

    public uint ExpToLevelUp => Experience.GetEXPToLevelUp(Pkm.CurrentLevel, Pkm.PersonalInfo.EXPGrowth);

    public double LevelUpPercent => Experience.GetEXPToLevelUpPercentage(Pkm.CurrentLevel, Pkm.EXP, Pkm.PersonalInfo.EXPGrowth);

    public byte Friendship => Pkm.IsEgg ? (byte)0 : Pkm.CurrentFriendship;

    public byte EggHatchCount => Pkm.IsEgg ? Pkm.CurrentFriendship : (byte)0;

    public int[] IVs
    {
        get
        {
            return [
                Pkm.IV_HP,
                Pkm.IV_ATK,
                Pkm.IV_DEF,
                Pkm.IV_SPA,
                Pkm.IV_SPD,
                Pkm.IV_SPE,
            ];
        }
    }

    public int[] EVs
    {
        get
        {
            if (Pkm is PB7 pb7)
            {
                return [
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
                return [
                    Pkm.EV_HP,
                    Pkm.EV_ATK,
                    Pkm.EV_DEF,
                    Pkm.EV_SPA,
                    Pkm.EV_SPD,
                    Pkm.EV_SPE,
                ];
            }
        }
    }

    public int[] Stats
    {
        get
        {
            Pkm.SetStats(Pkm.GetStats(Pkm.PersonalInfo));

            return [
                Pkm.Stat_HPMax,
                Pkm.Stat_ATK,
                Pkm.Stat_DEF,
                Pkm.Stat_SPA,
                Pkm.Stat_SPD,
                Pkm.Stat_SPE,
            ];
        }
    }

    public int[] BaseStats
    {
        get
        {
            return [
                Pkm.PersonalInfo.GetBaseStatValue(0),
                Pkm.PersonalInfo.GetBaseStatValue(1),
                Pkm.PersonalInfo.GetBaseStatValue(2),
                Pkm.PersonalInfo.GetBaseStatValue(4),
                Pkm.PersonalInfo.GetBaseStatValue(5),
                Pkm.PersonalInfo.GetBaseStatValue(3),
            ];
        }
    }

    public byte HiddenPowerType
    {
        get
        {
            HiddenPower.TryGetTypeIndex(Pkm.HPType, out var hptype);

            return (byte)(hptype + 1);
        }
    }

    public int HiddenPowerPower
    {
        get { return Pkm.HPPower; }
    }

    public MoveCategory HiddenPowerCategory
    {
        get => Generation <= 3
            ? (HiddenPowerType < 10 ? MoveCategory.PHYSICAL : MoveCategory.SPECIAL) // TODO duplicate with static-data
            : MoveCategory.SPECIAL;
    }

    public PKHeX.Core.Nature Nature { get => Pkm is GBPKM gbpkm ? Experience.GetNatureVC(gbpkm.EXP) : Pkm.Nature; }

    public int Ability
    {
        get
        {
            return Pkm.Ability == -1
                ? 0
                : Pkm.Ability;
        }
    }

    public List<ushort> Moves
    {
        get
        {
            return [
                Pkm.Move1,
                Pkm.Move2,
                Pkm.Move3,
                Pkm.Move4
            ];
        }
    }

    public List<bool> MovesLegality
    {
        get
        {
            var la = GetLegalitySafe(Pkm);

            return [.. la.Info.Moves.Select(r => r.Valid)];
        }
    }

    public ushort TID
    {
        get { return Pkm.TID16; }
    }

    public string OriginTrainerName
    {
        get { return Pkm.OriginalTrainerName; }
    }

    public PKHeX.Core.Gender OriginTrainerGender { get => (PKHeX.Core.Gender)Pkm.OriginalTrainerGender; }

    public DateOnly? OriginMetDate
    {
        get { return Pkm.MetDate; }
    }

    public string OriginMetLocation
    {
        get
        {
            return GameInfo.GetStrings(SettingsService.AppSettings.GetSafeLanguage())
        .GetLocationName(Pkm.WasEgg, Pkm.MetLocation, Pkm.Format, Pkm.Generation, Pkm.Version);
        }
    }

    public byte? OriginMetLevel { get { return Pkm.MetLevel == 0 ? null : Pkm.MetLevel; } }

    public int HeldItem
    {
        get { return ItemConverter.GetItemForFormat(Pkm.HeldItem, Pkm.Context, EntityContext.Gen9); }
    }

    public string? HeldItemPokeapiName
    {
        get => HeldItem > 0
        ? (HeldItem < GameInfo.Strings.Item.Count ? StaticDataService.GetPokeapiItemName(GameInfo.Strings.Item[HeldItem]) : "")
        : null;
    }

    public string DynamicChecksum
    {
        // Data used here is considered to be mutable over time
        get => $"{Species}.{Form}.{Nickname}.{Level}.{Exp}.{string.Join("-", EVs)}.{string.Join("-", Moves)}.{HeldItem}";
    }

    public int NicknameMaxLength
    {
        get { return Pkm.MaxStringLengthNickname; }
    }

    public bool IsValid
    {
        get
        {
            var legality = GetLegalitySafe(Pkm);
            // if (Id == "G91020AC14A4E820 20 20 20 20 2000")
            // {
            //     Console.WriteLine($"TEST {Species} parsed={legality.Parsed} pkmValid={Pkm.Valid} legality={legality.Valid}");
            // }
            return legality.Parsed && legality.Valid;
        }
    }

    public string ValidityReport
    {
        get
        {
            var la = GetLegalitySafe(Pkm);

            try
            {
                return la.Report(
                    SettingsService.AppSettings.GetSafeLanguage()
                );
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine(ex);
                return ex.ToString();
            }
        }
    }

    public bool CanEdit { get => !IsEgg; }

    /**
     * Check legality with correct global settings.
     * Required to expect same result as in PKHeX.
     *
     * If no save passed, some checks won't be done.
     */
    public static LegalityAnalysis GetLegalitySafe(PKM pkm, SaveFile? save = null, StorageSlotType slotType = StorageSlotType.None)
    {
        if (save != null)
        {
            ParseSettings.InitFromSaveFileData(save);
        }
        else
        {
            ParseSettings.ClearActiveTrainer();
        }

        var la = save != null && pkm.GetType() == save.PKMType // quick sanity check
            ? new LegalityAnalysis(pkm, save.Personal, slotType)
            : new LegalityAnalysis(pkm, pkm.PersonalInfo, slotType);

        ParseSettings.ClearActiveTrainer();

        return la;
    }

    [JsonIgnore()]
    public required PKM Pkm;

    protected bool HasTradeEvolve;

    protected abstract byte GetGeneration();

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
}

public struct MoveItem
{
    public int Id { get; set; }
    public byte Type { get; set; }
    public string Text { get; set; }
    public List<MoveSourceType> SourceTypes { get; set; }
};
