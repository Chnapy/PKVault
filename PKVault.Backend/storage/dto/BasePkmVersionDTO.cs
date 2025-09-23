
using PKHeX.Core;
using PKHeX.Core.Searching;
using PokeApiNet;

public abstract class BasePkmVersionDTO : IWithId<string>
{
    public string Id { get { return GetPKMId(Pkm); } }

    public uint Generation { get { return GetGeneration(); } }

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

    public string SpeciesName
    {
        get
        {
            return GameInfo.GetStrings(SettingsService.AppSettings.GetSafeLanguage()).Species[Pkm.Species];
        }
    }

    public bool IsEgg
    {
        get { return Pkm.IsEgg; }
    }

    public bool IsShiny
    {
        get { return Pkm.IsShiny; }
    }

    public byte Ball { get => Pkm.Ball; }

    public GenderType? Gender
    {
        get
        {
            return Pkm.Gender switch
            {
                0 => GenderType.MALE,
                1 => GenderType.FEMALE,
                _ => null,
            };
        }
    }

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

    public PKHeX.Core.Nature Nature { get => Pkm.Nature; }

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

    public ushort TID
    {
        get { return Pkm.TID16; }
    }

    public string OriginTrainerName
    {
        get { return Pkm.OriginalTrainerName; }
    }

    public GenderType OriginTrainerGender
    {
        get
        {
            return Pkm.OriginalTrainerGender switch
            {
                0 => GenderType.MALE,
                1 => GenderType.FEMALE,
                _ => throw new Exception("Pkm.OriginalTrainerGender unexpected value"),
            };
        }
    }

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

    public string DynamicChecksum
    {
        get { return $"{Nickname}.{Level}.{Exp}.{string.Join("-", EVs)}.{string.Join("-", Moves)}.{HeldItem}"; }
    }

    public int NicknameMaxLength
    {
        get { return Pkm.MaxStringLengthNickname; }
    }

    public List<MoveItem> AvailableMoves
    {
        get
        {
            var legality = new LegalityAnalysis(Pkm);

            var moveComboSource = new LegalMoveComboSource();
            var moveSource = new LegalMoveSource<ComboItem>(moveComboSource);

            var blankSav = SaveUtil.GetBlankSAV(Pkm.Version, Pkm.OriginalTrainerName, (LanguageID)Pkm.Language);

            // TODO perf issue ? should be done once for each save type
            var filteredSources = new FilteredGameDataSource(blankSav, GameInfo.Sources);
            moveSource.ChangeMoveSource(filteredSources.Moves);
            moveSource.ReloadMoves(legality);

            var movesStr = GameInfo.GetStrings(SettingsService.AppSettings.GetSafeLanguage()).movelist;

            var availableMoves = new List<MoveItem>();

            moveComboSource.DataSource.ToList().ForEach(data =>
            {
                if (data.Value > 0 && moveSource.Info.CanLearn((ushort)data.Value))
                {
                    var item = new MoveItem
                    {
                        Id = data.Value,
                        // Type = MoveInfo.GetType((ushort)data.Value, Pkm.Context),
                        // Text = movesStr[data.Value],
                        // SourceTypes = moveSourceTypes.FindAll(type => moveSourceTypesRecord[type].Length > data.Value && moveSourceTypesRecord[type][data.Value]),
                    };
                    availableMoves.Add(item);
                }
            });

            return availableMoves;
        }
    }

    public bool IsValid
    {
        get
        {
            var legality = new LegalityAnalysis(Pkm);
            var isLegal = legality.Parsed && Pkm.Valid && legality.Valid;

            var isNotWarn = !WarningsService.GetWarningsDTO().pkmVersionWarnings.Any(warn => warn.PkmVersionId == null
            ? warn.PkmId == Id
            : warn.PkmVersionId == Id);

            return isLegal && isNotWarn;
        }
    }

    public string ValidityReport
    {
        get
        {
            List<string> reports = [new LegalityAnalysis(Pkm).Report()];

            PkmVersionWarning? warning = WarningsService.GetWarningsDTO().pkmVersionWarnings.Find(warn => warn.PkmVersionId == null
                ? warn.PkmId == Id
                : warn.PkmVersionId == Id);
            if (warning != null)
            {
                reports.Insert(0, $"Pkm not found in attached save."
                    + "\nIf expected consider detach from save."
                    + "\nOtherwise check the save integrity.");
            }

            return string.Join('\n', reports);
        }
    }

    public bool CanEdit { get => !IsEgg; }

    public abstract bool CanEvolve { get; }

    public required PKM Pkm;

    protected bool HasTradeEvolve;

    protected abstract uint GetGeneration();

    public static string GetPKMId(PKM pkm)
    {
        var hash = SearchUtil.HashByDetails(pkm);
        var id = $"G{pkm.Format}{hash}";

        return id;
    }

    // TODO perf issues
    public async Task RefreshAsyncData(SaveFile save)
    {
        await Task.WhenAll(
            RefreshHasTradeEvolve(save)
        );
    }

    private async Task RefreshHasTradeEvolve(SaveFile save)
    {
        var evolvesByTrade = await GetTradeEvolveChains(save);

        HasTradeEvolve = evolvesByTrade.Count > 0;
    }

    public async Task<List<ChainLink>> GetTradeEvolveChains(SaveFile save)
    {
        var pokeapiSpeciesName = PokeApiFileClient.PokeApiNameFromPKHexName(GameInfo.Strings.Species[Species]);
        var evolutionChain = await PokeApi.GetPokemonSpeciesEvolutionChain(
            GameInfo.Strings.Species[Species]
        );

        ChainLink? getSpeciesEvolutionChain(ChainLink currentChain)
        {
            if (currentChain.Species.Name == pokeapiSpeciesName)
            {
                return currentChain;
            }

            foreach (var chain in currentChain.EvolvesTo)
            {
                var result = getSpeciesEvolutionChain(chain);
                if (result != null)
                {
                    return result;
                }
            }

            return null;
        }

        var speciesChain = getSpeciesEvolutionChain(evolutionChain.Chain);
        if (speciesChain == null)
        {
            return [];
        }

        var heldItemName = GameInfo.Strings.Item[HeldItem];
        var heldItemPokeapiName = PokeApiFileClient.PokeApiNameFromPKHexName(heldItemName);

        bool checkSpecies(NamedApiResource<PokemonSpecies> speciesObj)
        {
            var species = int.Parse(speciesObj.Url.TrimEnd('/').Split('/')[^1]);

            return SaveInfosDTO.IsSpeciesAllowed(species, save);
        }

        return speciesChain.EvolvesTo.FindAll(chain =>
            checkSpecies(chain.Species)
            && chain.EvolutionDetails.Any(details =>
                details.Trigger.Name == "trade"
                && (details.HeldItem == null || details.HeldItem.Name == heldItemPokeapiName)

            )
        );
    }
}

public struct MoveItem
{
    public int Id { get; set; }
    public byte Type { get; set; }
    public string Text { get; set; }
    public List<MoveSourceType> SourceTypes { get; set; }
};
