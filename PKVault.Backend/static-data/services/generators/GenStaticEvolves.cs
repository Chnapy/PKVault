using PKHeX.Core;
using PokeApi.Models;

public class StaticEvolvesData : Dictionary<ushort, StaticEvolve>;

public record StaticEvolve(
    ushort Species,
    // version -> (evolved species, min-level)
    Dictionary<byte, StaticEvolve.StaticEvolveItem> Trade,
    // item -> version -> (evolved species, min-level)
    Dictionary<string, Dictionary<byte, StaticEvolve.StaticEvolveItem>> TradeWithItem,
    Dictionary<byte, HashSet<StaticEvolve.StaticEvolveItem>> Other
)
{
    public record StaticEvolveItem(ushort EvolveSpecies, int MinLevel);

    public ushort? PreviousSpecies { get; set; }
}

public class GenStaticEvolves(
    ILogger log,
    PokeApiService pokeApiService, IFileIOService fileIOService
    ) : StaticDataGenerator<StaticEvolvesData>(
    log,
    jsonTypeInfo: StaticDataJsonContext.Default.StaticEvolvesData,
    jsonTypeInfoIndented: new StaticDataJsonContext(JsonIndentedOptions).StaticEvolvesData,
    fileIOService
)
{
    private static readonly string Filename = $"StaticEvolves";
    public static async Task<StaticEvolvesData> LoadData()
    {
        var client = new AssemblyClient();

        var data = await client.GetAsyncJsonGz(
            [.. GetDataPathParts(Filename)],
            StaticDataJsonContext.Default.StaticEvolvesData
        );
        ArgumentNullException.ThrowIfNull(data);

        return data;
    }

    protected override async Task<StaticEvolvesData> GetData()
    {
        var staticEvolves = new StaticEvolvesData();

        void actChain(EvolutionChainEvolvesTo chain)
        {
            var species = ushort.Parse(chain.Species.Url.TrimEnd('/').Split('/')[^1]);

            var speciesEvolve = new StaticEvolve(
                Species: species,
                Trade: [],
                TradeWithItem: [],
                Other: []
            );

            chain.EvolvesTo.ToList().ForEach(evolveTo =>
            {
                var evolveSpecies = ushort.Parse(evolveTo.Species.Url.TrimEnd('/').Split('/')[^1]);

                evolveTo.EvolutionDetails.ToList().ForEach(details =>
                {
                    foreach (var version in Enum.GetValues<GameVersion>())
                    {
                        var saveVersion = GenStaticOthers.GetSingleVersion(version);
                        if (saveVersion == default)
                        {
                            continue;
                        }

                        var blankSave = new SaveWrapper(BlankSaveFile.Get(saveVersion));
                        if (!blankSave.IsSpeciesAllowed(evolveSpecies) || !blankSave.IsSpeciesAllowed(species))
                        {
                            // log.LogInformation($"EVOLVE TRADE NOT ALLOWED {species}->{evolveSpecies} v={version}");
                            continue;
                        }
                        
                        // Needs multiplayer, but no trade (currently: Finizen (#963))
                        if (details.NeedsMultiplayer)
                        {
                            speciesEvolve.Trade.Add((byte)version, new(evolveSpecies, details.MinLevel ?? 1));
                            continue;
                        }

                        if (details.Trigger.Name != "trade")
                        {
                            if (!speciesEvolve.Other.TryGetValue((byte)version, out var otherValue))
                            {
                                otherValue = [];
                                speciesEvolve.Other.Add((byte)version, otherValue);
                            }
                            otherValue.Add(new(evolveSpecies, details.MinLevel ?? 1));
                            continue;
                        }

                        if (details.HeldItem == null)
                        {
                            if (speciesEvolve.Trade.TryGetValue((byte)version, out var existing)
                                && existing.EvolveSpecies == evolveSpecies
                                && existing.MinLevel == (details.MinLevel ?? 1)
                            )
                            {
                                continue;
                            }

                            speciesEvolve.Trade.Add((byte)version, new(evolveSpecies, details.MinLevel ?? 1));
                        }
                        else
                        {
                            var key = details.HeldItem.Name;
                            if (!speciesEvolve.TradeWithItem.TryGetValue(key, out var versionTradeDict))
                            {
                                versionTradeDict = [];
                                speciesEvolve.TradeWithItem.Add(key, versionTradeDict);
                            }
                            versionTradeDict.Add((byte)version, new(evolveSpecies, details.MinLevel ?? 1));
                            // log.LogInformation($"EVOLVE TRADE {species}->{evolveSpecies} item={details.HeldItem.Name} v={version}");
                        }
                    }
                });

                actChain(evolveTo);
            });

            /**
             * Meltan#808 special case:
             * - evolve only in GO with consumables
             * - pokeapi evolve chain empty
             */
            if (species == (ushort)Species.Meltan)
            {
                var evolveSpecies = (ushort)Species.Melmetal;

                foreach (var version in Enum.GetValues<GameVersion>())
                {
                    var saveVersion = GenStaticOthers.GetSingleVersion(version);
                    if (saveVersion == default)
                    {
                        continue;
                    }

                    var blankSave = new SaveWrapper(BlankSaveFile.Get(saveVersion));
                    if (!blankSave.IsSpeciesAllowed(evolveSpecies) || !blankSave.IsSpeciesAllowed(species))
                    {
                        continue;
                    }

                    speciesEvolve.Trade.Add((byte)version, new(evolveSpecies, 1));
                }
            }

            staticEvolves.Add(species, speciesEvolve);
        }

        var evolutionChains = await pokeApiService.GetEvolutionChains();

        evolutionChains.ForEach(evolutionChain => actChain(new EvolutionChainEvolvesTo()
        {
            Species = evolutionChain.Chain.Species,
            IsBaby = evolutionChain.Chain.IsBaby,
            EvolutionDetails = [.. evolutionChain.Chain.EvolutionDetails.OfType<EvolutionChainEvolutionDetails>()],
            EvolvesTo = evolutionChain.Chain.EvolvesTo,
            AdditionalProperties = evolutionChain.Chain.AdditionalProperties
        }));

        foreach (var staticEvolve in staticEvolves.Values)
        {
            var previousSpecies = staticEvolves.Values.ToList().Find(evolve =>
            {
                HashSet<ushort> evolveSpecies = [
                    ..evolve.Other.Values.SelectMany(val => val).Select(val => val.EvolveSpecies),
                    ..evolve.Trade.Values.Select(val => val.EvolveSpecies),
                    ..evolve.TradeWithItem.Values.SelectMany(val => val.Values).Select(val => val.EvolveSpecies),
                ];
                return evolveSpecies.Contains(staticEvolve.Species);
            })?.Species;

            staticEvolve.PreviousSpecies = previousSpecies;
        }

        // Clear heavy Other dict which is not used outside this function
        foreach (var staticEvolve in staticEvolves.Values)
        {
            staticEvolve.Other.Clear();
        }

        // var heldItemPokeapiName = GetPokeapiItemName(heldItemName);

        return staticEvolves;
    }

    protected override string GetFilenameWithoutExtension() => Filename;
}