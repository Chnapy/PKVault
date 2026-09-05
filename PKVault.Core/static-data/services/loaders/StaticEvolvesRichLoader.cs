using PKHeX.Core;

namespace PKVault.Core;

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

public class StaticEvolvesRichLoader
{
    public static string GetFilenameWithoutExtension() => "StaticEvolvesRich";

    public static async Task<StaticEvolvesRichData> LoadData()
    {
        var client = new AssemblyClient();

        var data = await client.GetAsyncJsonGz(
            [.. StaticDataLoader.GetDataPathParts(GetFilenameWithoutExtension())],
            StaticDataJsonContext.Default.StaticEvolvesRichData
        );
        ArgumentNullException.ThrowIfNull(data);

        return data;
    }
}