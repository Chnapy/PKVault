
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

    public bool IsEgg
    {
        get { return Pkm.IsEgg; }
    }

    public bool IsShiny
    {
        get { return Pkm.IsShiny; }
    }

    public byte Ball
    {
        get { return Pkm.Ball; }
    }

    public byte Gender
    {
        get { return Pkm.Gender; }
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

    public int HiddenPowerType
    {
        get
        {
            HiddenPower.TryGetTypeIndex(Pkm.HPType, out var hptype);
            return hptype + 1;
        }
    }

    public int HiddenPowerPower
    {
        get { return Pkm.HPPower; }
    }

    // TODO use pokeapi nature ?
    public PKHeX.Core.Nature? Nature
    {
        get { return Pkm.Format > 2 ? Pkm.Nature : null; }
    }

    public int? Ability
    {
        get { return Pkm.Ability == -1 ? null : Pkm.Ability; }
    }

    public List<MoveItem> Moves
    {
        get
        {
            var legality = new LegalityAnalysis(Pkm);

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
                moveSourceTypesRecord.Add(type, LearnPossible.Get(Pkm, legality.EncounterOriginal, legality.Info.EvoChainsAllGens, type));
            });

            var movesStr = GameInfo.GetStrings("fr").movelist;

            var rawMoves = new List<ushort>{
                Pkm.Move1,
                Pkm.Move2,
                Pkm.Move3,
                Pkm.Move4
            };

            return [.. rawMoves.Select(id => new MoveItem
            {
                Id = id,
                Type = MoveInfo.GetType(id, Pkm.Context),
                Text = movesStr[id],
                SourceTypes = moveSourceTypes.FindAll(type => moveSourceTypesRecord[type].Count() > id && moveSourceTypesRecord[type][id]),
            })];
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

    public byte OriginTrainerGender
    {
        get { return Pkm.OriginalTrainerGender; }
    }

    public DateOnly? OriginMetDate
    {
        get { return Pkm.MetDate; }
    }

    public string OriginMetLocation
    {
        get { return GameInfo.GetStrings("fr").GetLocationName(Pkm.WasEgg, Pkm.MetLocation, Pkm.Format, Pkm.Generation, Pkm.Version); }
    }

    public byte? OriginMetLevel { get { return Pkm.MetLevel == 0 ? null : Pkm.MetLevel; } }

    public int HeldItem
    {
        get { return ItemConverter.GetItemForFormat(Pkm.HeldItem, Pkm.Context, EntityContext.Gen9); }
    }

    public int? SpriteItem
    {
        get
        {
            if (Pkm.HeldItem == 0)
            {
                return null;
            }
            return Pkm.SpriteItem;
        }
    }

    public string? HeldItemText
    {
        get
        {
            if (Pkm.HeldItem == 0)
            {
                return null;
            }
            var stringsFr = GameInfo.GetStrings("fr");
            return stringsFr.GetItemStrings(Pkm.Context, Pkm.Version)[Pkm.HeldItem];
        }
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
                moveSourceTypesRecord.Add(type, LearnPossible.Get(Pkm, legality.EncounterOriginal, legality.Info.EvoChainsAllGens, type));
            });

            var movesStr = GameInfo.GetStrings("fr").movelist;

            var availableMoves = new List<MoveItem>();

            moveComboSource.DataSource.ToList().ForEach(data =>
            {
                var types = moveSourceTypes.FindAll(type => moveSourceTypesRecord[type].Count() > data.Value && moveSourceTypesRecord[type][data.Value]);

                if (moveSource.Info.CanLearn((ushort)data.Value))
                {
                    var item = new MoveItem
                    {
                        Id = data.Value,
                        Type = MoveInfo.GetType((ushort)data.Value, Pkm.Context),
                        Text = movesStr[data.Value],
                        SourceTypes = types,
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
            return legality.Parsed && Pkm.Valid && legality.Valid;
        }
    }

    public string ValidityReport { get { return new LegalityAnalysis(Pkm).Report(); } }

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

    public async Task RefreshHasTradeEvolve()
    {
        var evolvesByTrade = await GetTradeEvolveChains();

        HasTradeEvolve = evolvesByTrade.Count > 0;
    }

    public async Task<List<ChainLink>> GetTradeEvolveChains()
    {
        var pokeapiSpeciesName = PokeApi.PokeApiNameFromPKHexName(GameInfo.Strings.Species[Species]);
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
        var heldItemPokeapiName = PokeApi.PokeApiNameFromPKHexName(heldItemName);

        return speciesChain.EvolvesTo.FindAll(chain =>
            chain.EvolutionDetails.Any(details =>
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
