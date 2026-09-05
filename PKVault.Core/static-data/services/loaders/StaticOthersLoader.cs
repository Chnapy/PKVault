using PKHeX.Core;

namespace PKVault.Core;

public record StaticVersion(
    byte Id,
    string Name,
    EntityContext Context,
    bool IsGameVersion,
    IEnumerable<GameVersion> Children,
    byte Generation,
    string[] Region,
    string[] Pokedexes,
    int MaxSpeciesId,
    int MaxIV,
    int MaxEV
);

public record StaticStat(
    int Id,
    string Name
);

public record StaticType(
    int Id,
    string Name
);

public record StaticMove(
    int Id,
    string Name,
    StaticMoveGeneration[] DataUntilGeneration
);

public record StaticMoveGeneration(
    byte UntilGeneration,
    int Type,
    MoveCategory Category,
    int? Power,
    int? Accuracy
);

public record StaticNature(
    int Id,
    string Name,
    int? IncreasedStatIndex,
    int? DecreasedStatIndex
);

public record StaticAbility(
    int Id,
    string Name
);

public record StaticItem(
    string Id,
    string Name,
    string Sprite
);

public record StaticVersionsItems(
    List<byte> Versions,
    // item value => item key
    Dictionary<int, string> ComboItems
);

public record StaticItemsData(
    List<StaticVersionsItems> VersionItems,
    Dictionary<string, StaticItem> Items
);

public record StaticGeneration(
    int Id,
    string[] Regions
);

public record StaticPokedex(
    string Key,
    string Name,
    byte Order,
    Dictionary<ushort, int> PokemonIndexes
);

public record StaticRibbon(
    string Key,
    string SpriteKey,
    string Name
);

public enum MoveCategory
{
    PHYSICAL,
    SPECIAL,
    STATUS
}

public record StaticOthersData(
    Dictionary<byte, StaticVersion> Versions,
    Dictionary<int, StaticStat> Stats,
    Dictionary<int, StaticType> Types,
    Dictionary<int, StaticMove> Moves,
    Dictionary<int, StaticNature> Natures,
    Dictionary<int, StaticAbility> Abilities,
    StaticItemsData Items,
    Dictionary<byte, StaticGeneration> Generations,
    Dictionary<string, StaticPokedex> Pokedexes,
    Dictionary<string, StaticRibbon> Ribbons,
    Dictionary<byte, string> Languages,
    string EggSprite
);

public class StaticOthersLoader
{
    public static string GetFilenameWithoutExtension(string lang) => $"StaticOthers_{lang}";

    public static async Task<StaticOthersData> LoadData(string lang)
    {
        var client = new AssemblyClient();

        try
        {
            var data = await client.GetAsyncJsonGz(
                [.. StaticDataLoader.GetDataPathParts(GetFilenameWithoutExtension(lang))],
                StaticDataJsonContext.Default.StaticOthersData
            );
            ArgumentNullException.ThrowIfNull(data);

            return data;
        }
        catch (KeyNotFoundException ex)
        {
            Serilog.Log.Error(ex, $"StaticOthers file not found for lang={lang}");

            if (lang != SettingsService.DefaultLanguage)
            {
                return await LoadData(SettingsService.DefaultLanguage);
            }

            throw;
        }
    }
}