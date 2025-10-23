using System.Text.Json;
using SixLabors.ImageSharp;
// using SixLabors.ImageSharp.Formats.Png;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;

public class GenSpritesheet
{
    private static readonly string FolderPath = "./pokeapi/spritesheet/sheets";
    private static readonly HttpClient client = new();

    public static async Task GenerateAllSpritesheets()
    {
        if (Directory.Exists(FolderPath))
        {
            Directory.Delete(FolderPath, true);
        }
        Directory.CreateDirectory(FolderPath);

        await Task.WhenAll([
            GenerateSpeciesSpritesheet(),
            GenerateItemsSpritesheet(),
        ]);
    }

    private static async Task GenerateSpeciesSpritesheet()
    {
        var staticSpecies = await StaticDataService.GetStaticSpecies();

        var speciesBySpritesheet = staticSpecies.Values
            .Chunk(100);

        var spritesInfosList = await Task.WhenAll(speciesBySpritesheet.Select((speciesList, sheetIndex) => GenerateChunk(
            speciesList.SelectMany(staticSp =>
                staticSp.Forms.Values.SelectMany(gen => gen.SelectMany(form =>
                    new List<string?>() {
                        form.SpriteDefault,
                        form.SpriteFemale,
                        form.SpriteShiny,
                        form.SpriteShinyFemale
                    }
                    .OfType<string>()
                ))
                .Distinct()
            ).ToList(),
            20, // 20 cols * 96 px = 1920 px width
            SpritesheetFileClient.GetSpeciesImgFilename(sheetIndex)
        )));

        await GenerateSpritesheetJson(spritesInfosList, SpritesheetFileClient.GetSpeciesJsonFilename());
    }

    private static async Task GenerateItemsSpritesheet()
    {
        var staticItems = await StaticDataService.GetStaticItems();

        var itemsBySpritesheet = staticItems.Values
            .Select(item => item.Sprite).Distinct().ToList().FindAll(path => path.Length > 0)
            .Chunk(3600);

        var itemsInfosList = await Task.WhenAll(itemsBySpritesheet.Select((itemsList, sheetIndex) => GenerateChunk(
            itemsList.ToList(),
            64, // 64 cols * 30 px = 1920 px width
            SpritesheetFileClient.GetItemsImgFilename(sheetIndex)
        )));

        await GenerateSpritesheetJson(itemsInfosList, SpritesheetFileClient.GetItemsJsonFilename());
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
            var finalUrl = StaticDataService.GetGHUrl(url);
            try
            {
                using var response = await client.GetAsync(finalUrl);
                response.EnsureSuccessStatusCode();
                await using var stream = await response.Content.ReadAsStreamAsync();
                var img = await Image.LoadAsync<Rgba32>(stream);
                // Resize if required
                // img.Mutate(x => x.Resize(SpriteWidth, SpriteHeight));
                images.Add(img);
            }
            catch
            {
                Console.WriteLine($"Error download {finalUrl}");
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

        string sheetPath = Path.Combine(FolderPath, filename);
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

    private static async Task GenerateSpritesheetJson(Dictionary<string, SpriteInfo>[] spritesInfosList, string filename)
    {
        var allSpritesInfos = spritesInfosList
            .SelectMany(dict => dict)
            .ToDictionary(pair => pair.Key, pair => pair.Value);

        string jsonPath = Path.Combine(FolderPath, filename);
        await File.WriteAllTextAsync(jsonPath, JsonSerializer.Serialize(allSpritesInfos, StaticDataService.JsonOptions));
        Console.WriteLine($"Saved index JSON to {jsonPath}");
    }
}
