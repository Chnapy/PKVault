namespace PKVault.Core;

public record StaticSpritesheetsData(
    Dictionary<string, SpriteInfo> Species,
    Dictionary<string, SpriteInfo> Items
);

public record SpriteInfo(string SheetName, int X, int Y, int Width, int Height);

/**
 * Generator not used during classic run.
 * 
 * Generates species and items spritesheets.
 */
public class StaticSpritesheetsLoader
{
    public static string GetFilenameWithoutExtension() => "StaticSpritesheets";

    public static async Task<StaticSpritesheetsData> LoadData()
    {
        var client = new AssemblyClient();

        var data = await client.GetAsyncJsonGz(
            [.. StaticDataLoader.GetDataPathParts(GetFilenameWithoutExtension())],
            StaticDataJsonContext.Default.StaticSpritesheetsData
        );
        ArgumentNullException.ThrowIfNull(data);

        return data;
    }
}
