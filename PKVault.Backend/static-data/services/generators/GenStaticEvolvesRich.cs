using System.Text.Json;
using System.Text.Json.Serialization;
using PKHeX.Core;
using PokeApi.Models;

public class StaticEvolvesRichData : Dictionary<ushort, Dictionary<int, StaticEvolveRich>>;

public record StaticEvolveRich(
    ushort Species,
    int Form,
    List<StaticEvolveRich.StaticEvolveRichItem> Evolves
)
{
    public record StaticEvolveRichItem(
        ushort EvolveSpecies,
        int EvolveForm,
        List<TriggerData> Triggers
    );

    public record TriggerData(
        Trigger Trigger,
        byte? Level,
        string? Item,
        int? MinItemCount,
        byte? Friendship,
        PKHeX.Core.Gender? Gender,
        int? Move,
        byte? MoveType,
        StyleMove? StyleMove,
        int? MinMoveCount,
        int? MinDamageTaken,
        byte? MinBeauty,
        int? MinSteps,
        ushort? PartySpecies,
        byte? PartyType,
        string? Region,
        RelativePhysicalStats? RelativePhysicalStats,
        ushort? TradeSpecies,
        bool Shed,
        bool NearSpecialRock,
        bool NeedsMultiplayer,
        bool NeedsOverworldRain,
        bool TurnUpsideDown,
        bool ThreeDefeatedBisharp,
        bool GimmighoulCoins,
        TimeOfDay? TimeOfDay,
        // GameVersion? Version,
        List<EntityContext> Contexts
    ) : IEquatable<TriggerData>
    {
        public bool EvolutionIsPossible => Trigger == Trigger.Trade
            || NeedsMultiplayer
            || TurnUpsideDown
            // Meltan#808
            || MinItemCount != null;

        public virtual bool Equals(TriggerData? other)
        {
            if (other is null) return false;
            if (ReferenceEquals(this, other)) return true;

            return Trigger == other.Trigger
                && Level == other.Level
                && Item == other.Item
                && MinItemCount == other.MinItemCount
                && Friendship == other.Friendship
                && Gender == other.Gender
                && Move == other.Move
                && MoveType == other.MoveType
                && StyleMove == other.StyleMove
                && MinMoveCount == other.MinMoveCount
                && MinDamageTaken == other.MinDamageTaken
                && MinBeauty == other.MinBeauty
                && MinSteps == other.MinSteps
                && PartySpecies == other.PartySpecies
                && PartyType == other.PartyType
                && Region == other.Region
                && RelativePhysicalStats == other.RelativePhysicalStats
                && TradeSpecies == other.TradeSpecies
                && Shed == other.Shed
                && NearSpecialRock == other.NearSpecialRock
                && NeedsMultiplayer == other.NeedsMultiplayer
                && NeedsOverworldRain == other.NeedsOverworldRain
                && TurnUpsideDown == other.TurnUpsideDown
                && ThreeDefeatedBisharp == other.ThreeDefeatedBisharp
                && GimmighoulCoins == other.GimmighoulCoins
                && TimeOfDay == other.TimeOfDay
                && Contexts.SequenceEqual(other.Contexts);
        }

        public override int GetHashCode()
        {
            var hash = new HashCode();

            hash.Add(Trigger);
            hash.Add(Level);
            hash.Add(Item);
            hash.Add(MinItemCount);
            hash.Add(Friendship);
            hash.Add(Gender);
            hash.Add(Move);
            hash.Add(MoveType);
            hash.Add(StyleMove);
            hash.Add(MinMoveCount);
            hash.Add(MinDamageTaken);
            hash.Add(MinBeauty);
            hash.Add(MinSteps);
            hash.Add(PartySpecies);
            hash.Add(PartyType);
            hash.Add(Region);
            hash.Add(RelativePhysicalStats);
            hash.Add(TradeSpecies);
            hash.Add(Shed);
            hash.Add(NearSpecialRock);
            hash.Add(NeedsMultiplayer);
            hash.Add(NeedsOverworldRain);
            hash.Add(TurnUpsideDown);
            hash.Add(ThreeDefeatedBisharp);
            hash.Add(GimmighoulCoins);
            hash.Add(TimeOfDay);

            foreach (var context in Contexts)
            {
                hash.Add(context);
            }

            return hash.ToHashCode();
        }
    };

    public enum Trigger
    {
        LevelUp, Trade, UseItem, UseMove, Spin,
        TowerDarkness, TowerWaters, ThreeCrits, TakeDamages, RecoilDamages
    }

    public enum RelativePhysicalStats
    {
        AttackMoreDefense, AttackLessDefense, AttackEqualDefense
    }

    public enum TimeOfDay
    {
        Day, Night, Dusk, FullMoon
    }

    public enum StyleMove
    {
        Strong, Agile
    }

    public ushort? PreviousSpecies { get; set; }
}

public class GenStaticEvolvesRich(
    ILogger log,
    PokeApiService pokeApiService, IFileIOService fileIOService
    ) : StaticDataGenerator<StaticEvolvesRichData>(
    log,
    jsonTypeInfo: StaticDataJsonContext.Default.StaticEvolvesRichData,
    jsonTypeInfoIndented: new StaticDataJsonContext(JsonIndentedOptions).StaticEvolvesRichData,
    fileIOService
)
{
    private static readonly string Filename = $"StaticEvolvesRich";
    public static async Task<StaticEvolvesRichData> LoadData()
    {
        var client = new AssemblyClient();

        var data = await client.GetAsyncJsonGz(
            [.. GetDataPathParts(Filename)],
            StaticDataJsonContext.Default.StaticEvolvesRichData
        );
        ArgumentNullException.ThrowIfNull(data);

        return data;
    }

    protected override async Task<StaticEvolvesRichData> GetData()
    {
        var staticEvolves = new StaticEvolvesRichData();

        // List<string> tmp = [];

        async Task<EvolutionChainEvolvesTo> GetFixedChain(EvolutionChainEvolvesTo chain)
        {
            var species = (ushort)PokeApiService.GetIdFromUrl(chain.Species.Url);

            if (species == 808)
            {
                if (chain.EvolvesTo.Count > 0)
                    throw new Exception($"Expect #808 to have evolves missing, but array is not empty, maybe remove this code");

                var melmetalPokemon = await pokeApiService.GetPokemon(809);
                ArgumentNullException.ThrowIfNull(melmetalPokemon);

                return new()
                {
                    Species = chain.Species,
                    IsBaby = chain.IsBaby,
                    EvolutionDetails = [],
                    EvolvesTo = [
                        new()
                        {
                            Species = melmetalPokemon.Species,
                            IsBaby = false,
                            EvolutionDetails = [
                                new()
                                {
                                    Trigger = new()
                                    {
                                        Name = "use-item",
                                    },
                                    Item = new()
                                    {
                                        Name = "meltan-candy",
                                    },
                                    AdditionalProperties = {
                                        {"item-count", 400}
                                    },
                                }
                            ],
                            EvolvesTo = [],
                            AdditionalProperties = new Dictionary<string, object>()
                        }
                    ],
                    AdditionalProperties = chain.AdditionalProperties
                };
            }

            return chain;
        }

        async Task<int> GetFormId(NamedApiResource? resource, int defaultForm)
        {
            if (resource == null)
                return defaultForm;

            var pkm = await pokeApiService.GetPokemon(resource);
            var formUrl = pkm?.Forms.First().Url;
            return formUrl == null
                ? defaultForm
                : PokeApiService.GetIdFromUrl(formUrl);
        }

        StaticEvolveRich.RelativePhysicalStats? GetRelativePhysicalStats(int? value) => value switch
        {
            -1 => StaticEvolveRich.RelativePhysicalStats.AttackLessDefense,
            0 => StaticEvolveRich.RelativePhysicalStats.AttackEqualDefense,
            1 => StaticEvolveRich.RelativePhysicalStats.AttackMoreDefense,
            _ => null,
        };

        StaticEvolveRich.TimeOfDay? GetTimeOfDay(string? value) => value switch
        {
            "day" => StaticEvolveRich.TimeOfDay.Day,
            "night" => StaticEvolveRich.TimeOfDay.Night,
            "dusk" => StaticEvolveRich.TimeOfDay.Dusk,
            "full-moon" => StaticEvolveRich.TimeOfDay.FullMoon,
            _ => null,
        };

        async Task actChain(EvolutionChainEvolvesTo chain)
        {
            chain = await GetFixedChain(chain);

            var species = (ushort)PokeApiService.GetIdFromUrl(chain.Species.Url);

            if (!staticEvolves.TryGetValue(species, out var speciesEvolveByFormId))
            {
                speciesEvolveByFormId = new(){
                    {species, new(
                        Species: species,
                        Form: species,
                        Evolves: []
                    )}
                };
                staticEvolves.Add(species, speciesEvolveByFormId);
            }

            foreach (var evolveTo in chain.EvolvesTo)
            {
                var evolveSpecies = ushort.Parse(evolveTo.Species.Url.TrimEnd('/').Split('/')[^1]);

                foreach (var details in evolveTo.EvolutionDetails)
                {
                    var baseForm = await GetFormId(details.BaseForm, species);
                    var evolveForm = await GetFormId(details.EvolvedForm, evolveSpecies);

                    speciesEvolveByFormId.TryGetValue(baseForm, out var speciesEvolve);
                    if (speciesEvolve == null)
                    {
                        speciesEvolve = new(
                            Species: species,
                            Form: baseForm,
                            Evolves: []
                        );
                        speciesEvolveByFormId.Add(baseForm, speciesEvolve);
                    }

                    PKHeX.Core.Gender? gender = details.Gender == 1
                        ? PKHeX.Core.Gender.Female
                        : details.Gender == 2
                            ? PKHeX.Core.Gender.Male
                            : null;

                    var item = details.Item?.Name ?? details.HeldItem?.Name;

                    var moveUrl = details.KnownMove?.Url ?? details.UsedMove?.Url;
                    int? move = moveUrl == null ? null : PokeApiService.GetIdFromUrl(moveUrl);
                    byte? moveType = details.KnownMoveType == null ? null
                        : (byte)PokeApiService.GetIdFromUrl(details.KnownMoveType.Url);

                    var minSteps = details.MinSteps;
                    ushort? partySpecies = details.PartySpecies == null ? null
                        : (ushort)PokeApiService.GetIdFromUrl(details.PartySpecies.Url);
                    byte? partyType = details.PartyType == null ? null
                        : (byte)PokeApiService.GetIdFromUrl(details.PartyType.Url);

                    ushort? tradeSpecies = details.TradeSpecies == null ? null
                        : (ushort)PokeApiService.GetIdFromUrl(details.TradeSpecies.Url);

                    var evolve = speciesEvolve.Evolves.Find(e =>
                        e.EvolveSpecies == evolveSpecies
                        && e.EvolveForm == evolveForm
                    );

                    if (evolve == null)
                    {
                        evolve = new(
                            EvolveSpecies: evolveSpecies,
                            EvolveForm: evolveForm,
                            Triggers: []
                        );
                        speciesEvolve.Evolves.Add(evolve);
                    }

                    if (!staticEvolves.TryGetValue(evolveSpecies, out var existingSpecies))
                    {
                        existingSpecies = [];
                        staticEvolves.Add(evolveSpecies, existingSpecies);
                    }

                    if (!existingSpecies.ContainsKey(evolveForm))
                    {
                        existingSpecies.Add(evolveForm, new(
                            Species: evolveSpecies,
                            Form: evolveForm,
                            Evolves: []
                        ));
                    }

                    var version = VersionGroupToVersion.GetVersion(details.VersionGroup);
                    var context = version?.Context;

                    var triggerObj = new StaticEvolveRich.TriggerData(
                        Trigger: StaticEvolveRich.Trigger.LevelUp,
                        Level: (byte?)details.MinLevel,
                        Item: item,
                        MinItemCount: null,
                        Friendship: (byte?)details.MinAffection ?? (byte?)details.MinHappiness,
                        Gender: gender,
                        Move: move,
                        MoveType: moveType,
                        StyleMove: null,
                        MinMoveCount: details.MinMoveCount,
                        MinDamageTaken: details.MinDamageTaken,
                        MinBeauty: (byte?)details.MinBeauty,
                        MinSteps: minSteps,
                        PartySpecies: partySpecies,
                        PartyType: partyType,
                        Region: details.Region?.Name,
                        RelativePhysicalStats: GetRelativePhysicalStats(details.RelativePhysicalStats),
                        TradeSpecies: tradeSpecies,
                        Shed: false,
                        NearSpecialRock: details.NearSpecialRock,
                        NeedsMultiplayer: details.NeedsMultiplayer,
                        NeedsOverworldRain: details.NeedsOverworldRain,
                        TurnUpsideDown: details.TurnUpsideDown,
                        ThreeDefeatedBisharp: false,
                        GimmighoulCoins: false,
                        TimeOfDay: GetTimeOfDay(details.TimeOfDay),
                        // Version: version,
                        Contexts: context == null ? [] : [(EntityContext)context]
                    );

                    triggerObj = details.Trigger.Name switch
                    {
                        "level-up" => triggerObj with
                        {
                            Trigger = StaticEvolveRich.Trigger.LevelUp
                        },
                        "trade" => triggerObj with
                        {
                            Trigger = StaticEvolveRich.Trigger.Trade
                        },
                        "use-item" => triggerObj with
                        {
                            Trigger = StaticEvolveRich.Trigger.UseItem,
                            MinItemCount = details.AdditionalProperties.TryGetValue("item-count", out var count)
                                ? (int?)count
                                : null
                        },
                        "use-move" => triggerObj with
                        {
                            Trigger = StaticEvolveRich.Trigger.UseMove
                        },
                        "shed" => triggerObj with
                        {
                            Trigger = StaticEvolveRich.Trigger.LevelUp,
                            Shed = true
                        },
                        "spin" => triggerObj with
                        {
                            Trigger = StaticEvolveRich.Trigger.Spin
                        },
                        "tower-of-darkness" => triggerObj with
                        {
                            Trigger = StaticEvolveRich.Trigger.TowerDarkness
                        },
                        "tower-of-waters" => triggerObj with
                        {
                            Trigger = StaticEvolveRich.Trigger.TowerWaters
                        },
                        "three-critical-hits" => triggerObj with
                        {
                            Trigger = StaticEvolveRich.Trigger.ThreeCrits
                        },
                        "take-damage" => triggerObj with
                        {
                            Trigger = StaticEvolveRich.Trigger.TakeDamages
                        },
                        "recoil-damage" => triggerObj with
                        {
                            Trigger = StaticEvolveRich.Trigger.RecoilDamages
                        },
                        "strong-style-move" => triggerObj with
                        {
                            Trigger = StaticEvolveRich.Trigger.UseMove,
                            StyleMove = StaticEvolveRich.StyleMove.Strong
                        },
                        "agile-style-move" => triggerObj with
                        {
                            Trigger = StaticEvolveRich.Trigger.UseMove,
                            StyleMove = StaticEvolveRich.StyleMove.Agile
                        },
                        "three-defeated-bisharp" => triggerObj with
                        {
                            Trigger = StaticEvolveRich.Trigger.LevelUp,
                            ThreeDefeatedBisharp = true
                        },
                        "gimmighoul-coins" => triggerObj with
                        {
                            Trigger = StaticEvolveRich.Trigger.LevelUp,
                            GimmighoulCoins = true
                        },
                        "other" => triggerObj with
                        {
                            Trigger = StaticEvolveRich.Trigger.LevelUp
                        },
                        _ => throw new Exception($"Evolution trigger name not handled: {details.Trigger.Name}"),
                    };

                    var existingTriggerObj = evolve.Triggers.FirstOrDefault(t =>
                        t with { Contexts = [] } == triggerObj with { Contexts = [] });

                    if (existingTriggerObj != null)
                    {
                        if (context != null && !existingTriggerObj.Contexts.Contains((EntityContext)context))
                        {
                            EntityContext[] newContexts = [.. existingTriggerObj.Contexts, (EntityContext)context];

                            existingTriggerObj.Contexts.Clear();
                            existingTriggerObj.Contexts.AddRange(newContexts.Order());
                        }

                        continue;
                    }

                    evolve.Triggers.Add(triggerObj);
                }

                await actChain(evolveTo);
            }
        }

        var evolutionChains = await pokeApiService.GetEvolutionChains();

        foreach (var evolutionChain in evolutionChains)
        {
            await actChain(new EvolutionChainEvolvesTo()
            {
                Species = evolutionChain.Chain.Species,
                IsBaby = evolutionChain.Chain.IsBaby,
                EvolutionDetails = [.. evolutionChain.Chain.EvolutionDetails.OfType<EvolutionChainEvolutionDetails>()],
                EvolvesTo = evolutionChain.Chain.EvolvesTo,
                AdditionalProperties = evolutionChain.Chain.AdditionalProperties
            });
        }

        foreach (var staticEvolve in staticEvolves.Values.SelectMany(v => v.Values))
        {
            var previousSpecies = staticEvolves.Values.SelectMany(v => v.Values).ToList().Find(evolve =>
            {
                return evolve.Evolves.Any(e => e.EvolveSpecies == staticEvolve.Species);
            })?.Species;

            staticEvolve.PreviousSpecies = previousSpecies;
        }

        List<ushort> missingSpecies = [];
        for (ushort species = 1; species < 1020; species++)
        {
            if (!staticEvolves.TryGetValue(species, out var forms) || !forms.TryGetValue(species, out var defaultForm))
                missingSpecies.Add(species);
        }

        if (missingSpecies.Count > 0)
            throw new Exception($"Missing species: {string.Join(' ', missingSpecies)}");

        // File.WriteAllText("foo.txt", string.Join("\n\n", tmp));
        return staticEvolves;
    }

    protected override string GetFilenameWithoutExtension() => Filename;
}