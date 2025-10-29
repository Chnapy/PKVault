using System.IO.Compression;
using System.Text;
using System.Text.Json;

public class GenPokeapi
{
    public static async Task GenerateFiles()
    {
        var time = LogUtil.Time("-- Generate PokeApi static-data & spritesheets");

        var spritesheetsTask = Task.Run(async () =>
        {
            var species = StaticDataService.GetStaticSpecies("en");
            var items = StaticDataService.GetStaticItems("en");

            return await GenSpritesheet.GenerateAllSpritesheets(
                await species,
                await items
            );
        });

        await Task.WhenAll(SettingsDTO.AllowedLanguages.Select(lang =>
            GenerateStaticData(lang, spritesheetsTask)
        ));

        time();
    }

    public static async Task GenerateStaticData(string lang, Task<StaticSpritesheets> spritesheets)
    {
        var time = LogUtil.Time($"static-data {lang} process");

        var versions = StaticDataService.GetStaticVersions(lang);
        var species = StaticDataService.GetStaticSpecies(lang);
        var stats = StaticDataService.GetStaticStats(lang);
        var types = StaticDataService.GetStaticTypes(lang);
        var moves = StaticDataService.GetStaticMoves(lang);
        var natures = StaticDataService.GetStaticNatures(lang);
        var abilities = StaticDataService.GetStaticAbilities(lang);
        var items = StaticDataService.GetStaticItems(lang);
        var evolves = StaticDataService.GetStaticEvolves();

        var dto = new StaticDataDTO
        {
            Versions = await versions,
            Species = await species,
            Stats = await stats,
            Types = types,
            Moves = await moves,
            Natures = await natures,
            Abilities = abilities,
            Items = await items,
            Evolves = await evolves,
            Spritesheets = await spritesheets,
            EggSprite = StaticDataService.GetEggSprite()
        };

        time();

        var staticDataPath = Path.Combine([.. StaticDataService.GetStaticDataPathParts(lang)]);
        var parentPath = Path.GetDirectoryName(staticDataPath)!;

        time = LogUtil.Time($"Write static-data {lang} to {staticDataPath}");

        var jsonContent = JsonSerializer.Serialize(dto, StaticDataJsonContext.Default.StaticDataDTO);

        if (!Directory.Exists(parentPath))
        {
            Directory.CreateDirectory(parentPath);
        }

        using var originalFileStream = new MemoryStream(Encoding.UTF8.GetBytes(jsonContent));
        using var compressedFileStream = File.Create(staticDataPath);
        using var compressionStream = new GZipStream(compressedFileStream, CompressionLevel.Optimal);

        originalFileStream.CopyTo(compressionStream);

        time();
    }
}
