namespace PKVault.Core;

public class StaticSpeciesData : Dictionary<ushort, StaticSpecies>;

public record StaticSpecies(
    ushort Id,
    byte Generation,
    PKHeX.Core.Gender[] Genders,
    // key is EntityContext
    Dictionary<byte, StaticSpeciesForm[]> Forms,
    Dictionary<string, int> PokedexIndexes
);

public record StaticSpeciesForm(
    int Id,
    string Name,
    string SpriteDefault,
    string? SpriteFemale,
    string SpriteShiny,
    string? SpriteShinyFemale,
    string? SpriteShadow,
    bool HasGenderDifferences,
    bool IsBattleOnly,
    bool IsMega
);

public class StaticSpeciesLoader
{
    public static string GetFilenameWithoutExtension(string lang) => $"StaticSpecies_{lang}";

    public static async Task<StaticSpeciesData> LoadData(string lang)
    {
        var client = new AssemblyClient();

        try
        {
            var data = await client.GetAsyncJsonGz(
                [.. StaticDataLoader.GetDataPathParts(GetFilenameWithoutExtension(lang))],
                StaticDataJsonContext.Default.StaticSpeciesData
            );
            ArgumentNullException.ThrowIfNull(data);

            return data;
        }
        catch (KeyNotFoundException ex)
        {
            Serilog.Log.Error(ex, $"StaticSpecies file not found for lang={lang}");

            if (lang != SettingsService.DefaultLanguage)
            {
                return await LoadData(SettingsService.DefaultLanguage);
            }

            throw;
        }
    }
}