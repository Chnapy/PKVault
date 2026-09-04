using PKHeX.Core;

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

public class GenStaticEvolves
{
    public static async Task<StaticEvolvesData> LoadData()
    {
        var data = await GenStaticEvolvesRich.LoadData();
        ArgumentNullException.ThrowIfNull(data);

        Dictionary<GameVersion, SaveFile> savesByVersion = [];

        var staticEvolves = new StaticEvolvesData();

        foreach(var entry in data)
        {
            var baseSpecies = entry.Key;

            var evolve = new StaticEvolve(
                Species: baseSpecies,
                Trade: [],
                TradeWithItem: [],
                Other: []
            );

            var allEvolves = entry.Value.Values.SelectMany(v => v.Evolves);
            var previousSpecies = entry.Value.Values.Select(v => v.PreviousSpecies).OfType<ushort>().FirstOrDefault();
            if (previousSpecies != default)
                evolve.PreviousSpecies = previousSpecies;

            foreach(var evoItem in allEvolves)
            {
                var trigger = evoItem.Triggers.FirstOrDefault(t => t.EvolutionIsPossible);
                if (trigger == null)
                    continue;

                var evolveSpecies = evoItem.EvolveSpecies;

                foreach (var version in Enum.GetValues<GameVersion>())
                {
                    var saveVersion = GenStaticOthers.GetSingleVersion(version);
                    if (saveVersion == default)
                    {
                        continue;
                    }

                    if (!savesByVersion.TryGetValue(saveVersion, out var saveFile))
                    {
                        saveFile = BlankSaveFile.Get(saveVersion);
                        savesByVersion.Add(saveVersion, saveFile);
                    }

                    var blankSave = new SaveWrapper(saveFile);
                    if (!blankSave.IsSpeciesAllowed(evolveSpecies) || !blankSave.IsSpeciesAllowed(baseSpecies))
                    {
                        // log.LogInformation($"EVOLVE TRADE NOT ALLOWED {species}->{evolveSpecies} v={version}");
                        continue;
                    }
                    
                    if (trigger.Trigger == StaticEvolveRich.Trigger.Trade && trigger.Item != null)
                    {
                        var key = trigger.Item;
                        if (!evolve.TradeWithItem.TryGetValue(key, out var versionTradeDict))
                        {
                            versionTradeDict = [];
                            evolve.TradeWithItem.Add(key, versionTradeDict);
                        }
                        versionTradeDict.TryAdd((byte)version, new(evolveSpecies, trigger.Level ?? 1));
                    }
                    else
                    {
                        evolve.Trade.TryAdd((byte)version, new(evolveSpecies, trigger.Level ?? 1));
                    }
                }
            }
                
            staticEvolves.Add(baseSpecies, evolve);
        }

        return staticEvolves;
    }
}