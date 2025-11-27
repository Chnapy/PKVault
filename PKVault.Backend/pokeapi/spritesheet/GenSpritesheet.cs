using System.Text.Json;
using SixLabors.ImageSharp;
// using SixLabors.ImageSharp.Formats.Png;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;

public class GenSpritesheet
{
    private static readonly string SourcePath = "../pokeapi/sprites";
    private static readonly string CustomSourcePath = "./pokeapi/spritesheet";
    private static readonly string TargetPath = Path.Combine([.. StaticDataService.GetGeneratedPathParts(), "sheets"]);

    public static async Task<StaticSpritesheets> GenerateAllSpritesheets(
        Dictionary<ushort, StaticSpecies> staticSpecies,
        Dictionary<int, StaticItem> staticItems
    )
    {
        if (Directory.Exists(TargetPath))
        {
            Directory.Delete(TargetPath, true);
        }
        Directory.CreateDirectory(TargetPath);

        var species = GenerateSpeciesSpritesheet(staticSpecies);
        var items = GenerateItemsSpritesheet(staticItems);

        return new(
            Species: await species,
            Items: await items
        );
    }

    private static async Task<Dictionary<string, SpriteInfo>> GenerateSpeciesSpritesheet(Dictionary<ushort, StaticSpecies> staticSpecies)
    {
        var speciesBySpritesheet = staticSpecies.Values
            .Chunk(100);

        var spritesInfosList = await Task.WhenAll(speciesBySpritesheet.Select((speciesList, sheetIndex) => GenerateChunk(
            [
                .. sheetIndex == 0 ? new string[] { StaticDataService.GetEggSprite() } : [],
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
                    ))
                    .Distinct()
                ),
            ],
            20, // 20 cols * 96 px = 1920 px width
            SpritesheetFileClient.GetSpeciesImgFilename(sheetIndex)
        )));

        return GetSpritesheetAtlas(spritesInfosList);
    }

    private static async Task<Dictionary<string, SpriteInfo>> GenerateItemsSpritesheet(Dictionary<int, StaticItem> staticItems)
    {
        var itemsBySpritesheet = staticItems.Values
            .Select(item => item.Sprite).Distinct().ToList().FindAll(path => path.Length > 0)
            .Chunk(3600);

        var itemsInfosList = await Task.WhenAll(itemsBySpritesheet.Select((itemsList, sheetIndex) => GenerateChunk(
            itemsList.ToList(),
            64, // 64 cols * 30 px = 1920 px width
            SpritesheetFileClient.GetItemsImgFilename(sheetIndex)
        )));

        return GetSpritesheetAtlas(itemsInfosList);
    }

    private static async Task<Dictionary<string, SpriteInfo>> GenerateChunk(
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
                using var fileStream = File.OpenRead(finalUrl);
                var img = await Image.LoadAsync<Rgba32>(fileStream);
                // Resize if required
                // img.Mutate(x => x.Resize(SpriteWidth, SpriteHeight));
                images.Add(img);
            }
            catch
            {
                Console.WriteLine($"Error source file {finalUrl}");
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

        string sheetPath = Path.Combine(TargetPath, filename);
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
        Console.WriteLine($"Saved spritesheet with {images.Count} sprites to {sheetPath}");

        return allSpriteInfo;
    }

    private static Dictionary<string, SpriteInfo> GetSpritesheetAtlas(Dictionary<string, SpriteInfo>[] spritesInfosList)
    {
        return spritesInfosList
            .SelectMany(dict => dict)
            .ToDictionary(pair => pair.Key, pair => pair.Value);
    }
}
