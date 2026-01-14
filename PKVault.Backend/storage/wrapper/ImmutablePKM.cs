using PKHeX.Core;
using PKHeX.Core.Searching;

/**
 * Immutable PKM wrapper, giving control and limit side-effects.
 */
public class ImmutablePKM(PKM Pkm, PKMLoadError? loadError = null)
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

    public string Extension => Pkm.Extension;
    public PersonalInfo PersonalInfo => Pkm.PersonalInfo;

    // public ReadOnlySpan<byte> Data => Pkm.Data;

    public byte[] EncryptedPartyData => Pkm.EncryptedPartyData;
    public byte[] EncryptedBoxData => Pkm.EncryptedBoxData;
    public byte[] DecryptedPartyData => Pkm.DecryptedPartyData;
    public byte[] DecryptedBoxData => Pkm.DecryptedBoxData;

    // Trash Bytes
    // public ReadOnlySpan<byte> NicknameTrash => Pkm.NicknameTrash;
    // public ReadOnlySpan<byte> OriginalTrainerTrash => Pkm.OriginalTrainerTrash;
    // public ReadOnlySpan<byte> HandlingTrainerTrash => Pkm.HandlingTrainerTrash;

    public EntityContext Context => Pkm.Context;
    public byte Format => Pkm.Format;

    // Surface Properties
    public ushort Species => Pkm.Species;
    public string Nickname => Pkm.Nickname;
    // public int HeldItem => Pkm.HeldItem;
    public Gender Gender => (Gender)Pkm.Gender;
    // public Nature Nature => Pkm.Nature;
    public Nature StatNature => Pkm.StatNature;
    // public int Ability => Pkm.Ability;
    public byte CurrentFriendship => Pkm.CurrentFriendship;
    public byte Form => GetForm(Pkm);
    public bool IsEgg => Pkm.IsEgg;
    public bool IsNicknamed => Pkm.IsNicknamed;
    public uint EXP => Pkm.EXP;
    public ushort TID16 => Pkm.TID16;
    public ushort SID16 => Pkm.SID16;
    public string OriginalTrainerName => Pkm.OriginalTrainerName;
    public byte OriginalTrainerGender => Pkm.OriginalTrainerGender;
    public byte Ball => Pkm.Ball;
    public byte MetLevel => Pkm.MetLevel;

    // Aliases of ID32
    public uint TrainerTID7 => Pkm.TrainerTID7;
    public uint TrainerSID7 => Pkm.TrainerSID7;
    public uint DisplayTID => Pkm.DisplayTID;
    public uint DisplaySID => Pkm.DisplaySID;

    // Battle
    public ushort Move1 => Pkm.Move1;
    public ushort Move2 => Pkm.Move2;
    public ushort Move3 => Pkm.Move3;
    public ushort Move4 => Pkm.Move4;
    public int Move1_PP => Pkm.Move1_PP;
    public int Move2_PP => Pkm.Move2_PP;
    public int Move3_PP => Pkm.Move3_PP;
    public int Move4_PP => Pkm.Move4_PP;
    public int Move1_PPUps => Pkm.Move1_PPUps;
    public int Move2_PPUps => Pkm.Move2_PPUps;
    public int Move3_PPUps => Pkm.Move3_PPUps;
    public int Move4_PPUps => Pkm.Move4_PPUps;
    public int EV_HP => Pkm.EV_HP;
    public int EV_ATK => Pkm.EV_ATK;
    public int EV_DEF => Pkm.EV_DEF;
    public int EV_SPE => Pkm.EV_SPE;
    public int EV_SPA => Pkm.EV_SPA;
    public int EV_SPD => Pkm.EV_SPD;
    public int IV_HP => Pkm.IV_HP;
    public int IV_ATK => Pkm.IV_ATK;
    public int IV_DEF => Pkm.IV_DEF;
    public int IV_SPE => Pkm.IV_SPE;
    public int IV_SPA => Pkm.IV_SPA;
    public int IV_SPD => Pkm.IV_SPD;
    public int Status_Condition => Pkm.Status_Condition;
    public byte Stat_Level => Pkm.Stat_Level;
    public int Stat_HPMax => Pkm.Stat_HPMax;
    public int Stat_HPCurrent => Pkm.Stat_HPCurrent;
    public int Stat_ATK => Pkm.Stat_ATK;
    public int Stat_DEF => Pkm.Stat_DEF;
    public int Stat_SPE => Pkm.Stat_SPE;
    public int Stat_SPA => Pkm.Stat_SPA;
    public int Stat_SPD => Pkm.Stat_SPD;

    // Hidden Properties
    public GameVersion Version => Pkm.Version;
    public uint ID32 => Pkm.ID32;
    public int PokerusStrain => Pkm.PokerusStrain;
    public int PokerusDays => Pkm.PokerusDays;

    public uint EncryptionConstant => Pkm.EncryptionConstant;
    public uint PID => Pkm.PID;

    // Misc Properties
    public int Language => Pkm.Language;
    public bool FatefulEncounter => Pkm.FatefulEncounter;
    public uint TSV => Pkm.TSV;
    public uint PSV => Pkm.PSV;
    public int Characteristic => Pkm.Characteristic;
    public ushort MetLocation => Pkm.MetLocation;
    public ushort EggLocation => Pkm.EggLocation;
    public byte OriginalTrainerFriendship => Pkm.OriginalTrainerFriendship;
    public bool Japanese => Pkm.Japanese;
    public bool Korean => Pkm.Korean;

    // Future Properties
    public DateOnly? MetDate => Pkm.MetDate;
    public byte MetYear => Pkm.MetYear;
    public byte MetMonth => Pkm.MetMonth;
    public byte MetDay => Pkm.MetDay;
    public string HandlingTrainerName => Pkm.HandlingTrainerName;
    public byte HandlingTrainerGender => Pkm.HandlingTrainerGender;
    public byte HandlingTrainerFriendship => Pkm.HandlingTrainerFriendship;
    public int AbilityNumber => Pkm.AbilityNumber;

    public int HPPower => Pkm.HPPower;
    public int HPType => Pkm.HPType;

    // Misc Egg Facts
    public bool WasEgg => Pkm.WasEgg;

    // Maximums
    public ushort MaxMoveID => Pkm.MaxMoveID;
    public ushort MaxSpeciesID => Pkm.MaxSpeciesID;
    public int MaxItemID => Pkm.MaxItemID;
    public int MaxAbilityID => Pkm.MaxAbilityID;
    public int MaxBallID => Pkm.MaxBallID;
    public GameVersion MaxGameID => Pkm.MaxGameID;
    public GameVersion MinGameID => Pkm.MinGameID;
    public int MaxIV => Pkm.MaxIV;
    public int MaxEV => Pkm.MaxEV;

    public int MaxStringLengthNickname => Pkm.MaxStringLengthNickname;

    public bool IsShiny => Pkm.IsShiny;

    public byte Generation => Pkm.Generation;

    public byte CurrentLevel => Pkm.CurrentLevel;

    public bool IsShadow => Pkm is IShadowCapture pkmShadow && pkmShadow.IsShadow;
    public bool IsAlpha => Pkm is IAlpha pka && pka.IsAlpha;
    public bool IsNoble => Pkm is INoble pkn && pkn.IsNoble;
    public bool CanGigantamax => Pkm is IGigantamaxReadOnly pkg && pkg.CanGigantamax;
    public List<byte> Types => DexGenService.GetTypes(Format, Pkm.PersonalInfo);
    public uint ExpToLevelUp => Experience.GetEXPToLevelUp(Pkm.CurrentLevel, Pkm.PersonalInfo.EXPGrowth);
    public double LevelUpPercent => Experience.GetEXPToLevelUpPercentage(Pkm.CurrentLevel, Pkm.EXP, Pkm.PersonalInfo.EXPGrowth);
    public byte Friendship => Pkm.IsEgg ? (byte)0 : Pkm.CurrentFriendship;
    public byte EggHatchCount => Pkm.IsEgg ? Pkm.CurrentFriendship : (byte)0;

    public int[] IVs => GetIVs();
    public int[] EVs => GetEVs();
    public int[] Stats => GetStats();
    public int[] BaseStats => GetBaseStats();

    public byte HiddenPowerType => HiddenPower.TryGetTypeIndex(Pkm.HPType, out var hptype)
        ? (byte)(hptype + 1)
        : (byte)0;

    public int HiddenPowerPower => Pkm.HPPower;

    public MoveCategory HiddenPowerCategory => Generation <= 3
        ? (HiddenPowerType < 10 ? MoveCategory.PHYSICAL : MoveCategory.SPECIAL) // TODO duplicate with static-data
        : MoveCategory.SPECIAL;

    public Nature Nature => GetNature();

    public int Ability => Pkm.Ability == -1
        ? 0
        : Pkm.Ability;

    public List<ushort> Moves => [.. GetMoves()];

    public ushort TID => Pkm.TID16;

    public string OriginTrainerName => Pkm.OriginalTrainerName;
    public Gender OriginTrainerGender => (Gender)Pkm.OriginalTrainerGender;
    public DateOnly? OriginMetDate => Pkm.MetDate;
    public byte? OriginMetLevel => Pkm.MetLevel == 0 ? null : Pkm.MetLevel;

    public string GetOriginMetLocation(string language) => GameInfo.GetStrings(language)
        .GetLocationName(Pkm.WasEgg, Pkm.MetLocation, Pkm.Format, Pkm.Generation, Pkm.Version);

    public int HeldItem => ItemConverter.GetItemForFormat(Pkm.HeldItem, Pkm.Context, StaticDataService.LAST_ENTITY_CONTEXT);
    public string? HeldItemPokeapiName => HeldItem > 0
        ? (HeldItem < GameInfo.Strings.Item.Count ? StaticDataService.GetPokeapiItemName(GameInfo.Strings.Item[HeldItem]) : "")
        : null;

    // Data used here is considered to be mutable over pkm lifetime
    public string DynamicChecksum => $"{Species}.{Form}.{Nickname}.{CurrentLevel}.{EXP}.{string.Join("-", EVs)}.{string.Join("-", Moves)}.{HeldItem}";

    public bool IsSpeciesValid => Species > 0 && Species < GameInfo.Strings.Species.Count;

    public PKMLoadError? LoadError => loadError;

    public bool HasLoadError => loadError != null;

    public bool IsEnabled => !HasLoadError && IsSpeciesValid;

    /**
     * Generate ID similar to PKHeX one.
     * Note that Species & Form can change over time (evolve),
     * so only first species of evolution group is used.
     */
    public string GetPKMIdBase()
    {
        static ushort GetBaseSpecies(ushort species)
        {
            if (species == 0)
            {
                return 0;
            }

            var previousSpecies = StaticDataService.GetDefinedStaticDataDTO().Evolves[species].PreviousSpecies;
            if (previousSpecies != null)
            {
                return GetBaseSpecies((ushort)previousSpecies);
            }
            return species;
        }

        var clone = Update(clone =>
        {
            clone.Species = GetBaseSpecies(Pkm.Species);
            clone.Form = 0;
            if (GetMutablePkm() is GBPKM gbpkm && clone is GBPKM gbclone)
            {
                gbclone.DV16 = gbpkm.DV16;
            }
            else
            {
                clone.PID = Pkm.PID;
                Span<int> ivs = [
                    Pkm.IV_HP,
                    Pkm.IV_ATK,
                    Pkm.IV_DEF,
                    Pkm.IV_SPE,
                    Pkm.IV_SPA,
                    Pkm.IV_SPD,
                ];
                clone.SetIVs(ivs);
            }
        });
        var hash = SearchUtil.HashByDetails(clone.GetMutablePkm());
        var id = $"G{clone.Format}_{hash}_{clone.TID16}";   // note: SID not stored by pk files

        return id;
    }

    public Span<ushort> GetMoves()
    {
        Span<ushort> moves = new ushort[4];
        Pkm.GetMoves(moves);
        return moves;
    }

    public int[] GetBaseStats()
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

    public int[] GetStats()
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

    public int[] GetIVs()
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

    public int[] GetEVs()
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

        return [
            Pkm.EV_HP,
                Pkm.EV_ATK,
                Pkm.EV_DEF,
                Pkm.EV_SPA,
                Pkm.EV_SPD,
                Pkm.EV_SPE,
            ];
    }

    public Nature GetNature() => Pkm is GBPKM gbpkm ? Experience.GetNatureVC(gbpkm.EXP) : Pkm.Nature;

    public PKM GetMutablePkm() => Pkm;

    /**
     * Create a PKM clone and mutate it with given mutator function.
     * Return new ImmutablePKM.
     */
    public ImmutablePKM Update(Action<PKM> mutator)
    {
        var clone = Pkm.Clone();

        mutator(clone);

        return new(clone, LoadError);
    }
}

public enum PKMLoadError
{
    UNKNOWN,
    NOT_FOUND,
    TOO_SMALL,
    TOO_BIG,
    UNAUTHORIZED
}
