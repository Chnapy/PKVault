using System.IO.Compression;
using System.Text;
using System.Text.Json;

public class GenPokeapiService(StaticDataService staticDataService)
{
    public async Task GenerateFiles()
    {
        var time = LogUtil.Time("-- Generate PokeApi static-data & spritesheets");

        var spritesheetsTask = Task.Run(async () =>
        {
            var species = staticDataService.GetStaticSpecies("en");
            var items = staticDataService.GetStaticItems("en");

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

    public async Task GenerateStaticData(string lang, Task<StaticSpritesheets> spritesheets)
    {
        var time = LogUtil.Time($"static-data {lang} process");

        var versions = staticDataService.GetStaticVersions(lang);
        var species = staticDataService.GetStaticSpecies(lang);
        var stats = staticDataService.GetStaticStats(lang);
        var types = staticDataService.GetStaticTypes(lang);
        var moves = staticDataService.GetStaticMoves(lang);
        var natures = staticDataService.GetStaticNatures(lang);
        var abilities = staticDataService.GetStaticAbilities(lang);
        var items = staticDataService.GetStaticItems(lang);
        var evolves = staticDataService.GetStaticEvolves();
        var generations = staticDataService.GetStaticGenerations(lang);

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
            Generations = await generations,
            Spritesheets = await spritesheets,
            EggSprite = StaticDataService.GetEggSprite()
        };

        time();

        var staticDataPath = Path.Combine([.. staticDataService.GetStaticDataPathParts(lang)]);
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
