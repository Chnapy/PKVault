using System.Text.Json;

public partial class SpritesheetFileClient
{
    private static readonly AssemblyClient assemblyClient = new(GetJsonOptions());

    public static async Task<Dictionary<string, SpriteInfo>> GetAsyncJson(string filename)
    {
        List<string> fileParts = [
            "pokeapi", "spritesheet","sheets", filename
        ];

        return await assemblyClient.GetAsyncJson<Dictionary<string, SpriteInfo>>(fileParts);
    }

    public static async Task<Stream> GetAsyncString(string filename)
    {
        List<string> fileParts = [
            "pokeapi", "spritesheet","sheets", filename
        ];

        return await assemblyClient.GetAsync(fileParts);
    }

    public static string GetSpeciesJsonFilename() => "spritesheet_species.json";
    public static string GetSpeciesImgFilename(int sheetIndex) => $"spritesheet_species_{sheetIndex}.webp";

    public static string GetItemsJsonFilename() => "spritesheet_items.json";
    public static string GetItemsImgFilename(int sheetIndex) => $"spritesheet_items_{sheetIndex}.webp";

    private static JsonSerializerOptions GetJsonOptions()
    {
        return new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            PropertyNameCaseInsensitive = true,
            DefaultBufferSize = 16 * 1024, // buffer 16 Ko
        };
    }
}
