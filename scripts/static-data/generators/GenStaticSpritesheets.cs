using Microsoft.Extensions.Logging;
using PKVault.Core;
using Serilog;
using SixLabors.ImageSharp;
// using SixLabors.ImageSharp.Formats.Png;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;

// public record StaticSpritesheetsData(
//     Dictionary<string, SpriteInfo> Species,
//     Dictionary<string, SpriteInfo> Items
// );

// public record SpriteInfo(string SheetName, int X, int Y, int Width, int Height);

/**
 * Generator not used during classic run.
 * 
 * Generates species and items spritesheets.
 */
public class GenStaticSpritesheets(
    IFileIOService fileIOService,
    StaticSpeciesData staticSpecies, StaticItem[] staticItems
) : StaticDataGenerator<StaticSpritesheetsData>(
   jsonTypeInfo: StaticDataJsonContext.Default.StaticSpritesheetsData,
   jsonTypeInfoIndented: new StaticDataJsonContext(JsonIndentedOptions).StaticSpritesheetsData,
   fileIOService
)
{
    private const string SourcePath = "../pokeapi/sprites";
    private const string CustomSourcePath = "./static-data/generators";

    private static readonly string Filename = $"StaticSpritesheets";

    protected override async Task<StaticSpritesheetsData> GetData(string[] rootParts)
    {
        return await GenerateAllSpritesheets(rootParts, staticSpecies, staticItems);
    }

    protected override string GetFilenameWithoutExtension() => Filename;

    private async Task<StaticSpritesheetsData> GenerateAllSpritesheets(
        string[] rootParts,
        StaticSpeciesData staticSpecies,
        StaticItem[] staticItems
    )
    {
        var targetPath = Path.Combine([.. rootParts, "sheets"]);

        fileIOService.Delete(targetPath);
        fileIOService.CreateDirectory(targetPath);

        var species = GenerateSpeciesSpritesheet(targetPath, staticSpecies);
        var items = GenerateItemsSpritesheet(targetPath, staticItems);

        return new(
            Species: await species,
            Items: await items
        );
    }

    private async Task<Dictionary<string, SpriteInfo>> GenerateSpeciesSpritesheet(string targetPath, StaticSpeciesData staticSpecies)
    {
        var speciesBySpritesheet = staticSpecies.Values
            .Chunk(100);

        var spritesInfosList = await Task.WhenAll(speciesBySpritesheet.Select((speciesList, sheetIndex) => GenerateChunk(
            targetPath,
            [
                .. sheetIndex == 0 ? new string[] { GenStaticOthers.GetEggSprite() } : [],
                .. speciesList.SelectMany(staticSp =>
                    staticSp.Forms.Values.SelectMany(gen => gen.SelectMany(form =>
                        new List<string?>() {
                            form.SpriteDefault,
                            form.SpriteFemale,
                            form.SpriteShiny,
                            form.SpriteShinyFemale,
                            form.SpriteShadow,
                        }
                        .OfType<string>()
                        .Where(v => v.Length > 0)
                    ))
                    .Distinct()
                ),
            ],
            20, // 20 cols * 96 px = 1920 px width
            SpritesheetFileClient.GetSpeciesImgFilename(sheetIndex)
        )));

        return GetSpritesheetAtlas(spritesInfosList);
    }

    private async Task<Dictionary<string, SpriteInfo>> GenerateItemsSpritesheet(string targetPath, StaticItem[] staticItems)
    {
        var itemsBySpritesheet = staticItems
            .Select(item => item.Sprite).Distinct().ToList().FindAll(path => path.Length > 0)
            .Chunk(3600);

        var itemsInfosList = await Task.WhenAll(itemsBySpritesheet.Select((itemsList, sheetIndex) => GenerateChunk(
            targetPath,
            itemsList.ToList(),
            64, // 64 cols * 30 px = 1920 px width
            SpritesheetFileClient.GetItemsImgFilename(sheetIndex)
        )));

        return GetSpritesheetAtlas(itemsInfosList);
    }

    private async Task<Dictionary<string, SpriteInfo>> GenerateChunk(
        string targetPath,
        List<string> urls, int columns, string filename
    )
    {
        var allSpriteInfo = new Dictionary<string, SpriteInfo>();
        var images = new List<Image<Rgba32>>();

        // Download sprites
        foreach (var url in urls)
        {
            var finalUrl = url.StartsWith("custom-sprites")
                ? Path.Combine(CustomSourcePath, url)
                : Path.Combine(SourcePath, url);
            try
            {
                var img = await ReadImage(finalUrl);
                // Resize if required
                // img.Mutate(x => x.Resize(SpriteWidth, SpriteHeight));
                images.Add(img);
            }
            catch
            {
                Log.Logger.Error($"Error source file {finalUrl}");
                throw;
            }
        }

        int slotWidth = images.Select(image => image.Width).Max();
        int slotHeight = images.Select(image => image.Height).Max();

        int rows = (int)Math.Ceiling(images.Count / (double)columns);
        using var sheetImage = new Image<Rgba32>(slotWidth * columns, slotHeight * rows);

        for (int i = 0; i < images.Count; i++)
        {
            int width = images[i].Width;
            int height = images[i].Height;
            int col = i % columns;
            int row = i / columns;
            int x = col * slotWidth;
            int y = row * slotHeight;
            sheetImage.Mutate(ctx => ctx.DrawImage(images[i], new Point(x, y), 1f));

            allSpriteInfo.Add(urls[i], new SpriteInfo(
                filename,
                x,
                y,
                width,
                height));
        }

        string sheetPath = Path.Combine(targetPath, filename);
        await sheetImage.SaveAsWebpAsync(sheetPath,
            new WebpEncoder
            {
                FileFormat = WebpFileFormatType.Lossless,
                Quality = 100,
                SkipMetadata = true,
            }

            // new PngEncoder()
            // {
            //     CompressionLevel = PngCompressionLevel.BestCompression,
            //     FilterMethod = PngFilterMethod.Adaptive,
            //     SkipMetadata = true,
            // }
        );
        Log.Logger.Information($"Saved spritesheet with {images.Count} sprites to {sheetPath}");

        return allSpriteInfo;
    }

    private static Dictionary<string, SpriteInfo> GetSpritesheetAtlas(Dictionary<string, SpriteInfo>[] spritesInfosList)
    {
        return spritesInfosList
            .SelectMany(dict => dict)
            .ToDictionary(pair => pair.Key, pair => pair.Value);
    }

    private async Task<Image<Rgba32>> ReadImage(string path)
    {
        path = FileIOService.NormalizePath(path);

        using var fileStream = File.OpenRead(path);
        return await Image.LoadAsync<Rgba32>(fileStream);
    }
}
