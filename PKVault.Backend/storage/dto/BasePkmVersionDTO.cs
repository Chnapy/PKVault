
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
            return PKHexUtils.StringsFR.Species[Pkm.Species];
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

    public string? Sprite { get; set; }

    public string? BallSprite { get; set; }

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

    public List<string> Types
    {
        get
        {
            var type1 = PKHexUtils.StringsFR.Types[Pkm.PersonalInfo.Type1];
            var type2 = PKHexUtils.StringsFR.Types[Pkm.PersonalInfo.Type2];
            return [type1, type2];
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

    public string HiddenPowerType
    {
        get
        {
            HiddenPower.TryGetTypeIndex(Pkm.HPType, out var hptype);

            var type = PKHexUtils.StringsFR.Types[hptype];

            return type;
        }
    }

    public int HiddenPowerPower
    {
        get { return Pkm.HPPower; }
    }

    public string? Nature { get; set; }

    public string? Ability
    {
        get
        {
            return Pkm.Ability == -1
                ? null
                : PKHexUtils.StringsFR.Ability[Pkm.Ability];
        }
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

            var movesStr = PKHexUtils.StringsFR.movelist;

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
        get { return PKHexUtils.StringsFR.GetLocationName(Pkm.WasEgg, Pkm.MetLocation, Pkm.Format, Pkm.Generation, Pkm.Version); }
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
            return PKHexUtils.StringsFR.GetItemStrings(Pkm.Context, Pkm.Version)[Pkm.HeldItem];
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

            var movesStr = PKHexUtils.StringsFR.movelist;

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

    // TODO perf issues
    public async Task RefreshAsyncData()
    {
        await Task.WhenAll(
            RefreshSprite(),
            RefreshBallSprite(),
            RefreshNature(),
            RefreshHasTradeEvolve()
        );
    }

    private async Task RefreshSprite()
    {
        var pkmObj = await PokeApi.GetPokemon(Species);

        Sprite = IsEgg
            ? "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/egg.png"
            : (
                IsShiny
                    ? pkmObj.Sprites.FrontShiny
                    : pkmObj.Sprites.FrontDefault
            );
    }

    private async Task RefreshBallSprite()
    {
        var ballItem = await PokeApi.GetItem(Pkm.Ball);

        BallSprite = ballItem?.Sprites.Default;
    }

    private async Task RefreshNature()
    {
        if (Pkm.Format <= 2)
        {
            Nature = null;
        }
        else
        {
            var natureName = GameInfo.Strings.natures[(int)Pkm.Nature];

            var nature = await PokeApi.GetNature(natureName);

            var natureText = nature?.Names.Find(name => name.Language.Name == "fr")?.Name;

            Nature = natureText;
        }
    }

    private async Task RefreshHasTradeEvolve()
    {
        var evolvesByTrade = await GetTradeEvolveChains();

        HasTradeEvolve = evolvesByTrade.Count > 0;
    }

    public async Task<List<ChainLink>> GetTradeEvolveChains()
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
