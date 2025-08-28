using System.Text;
using System.Text.Json;

public class GenApiData
{
    public static void GenerateFiles()
    {
        Console.WriteLine("-- Generate pokeapi files --");

        Directory.CreateDirectory("pokeapi/api-data/data/api/v2");

        Process(
            "../pokeapi/api-data/data/api/v2",
            "pokeapi/api-data/data/api/v2"
        );
    }

    private static void Process(string sourceDir, string targetDir)
    {
        var files = Directory.GetFiles(sourceDir).Select(NormalizePath).ToList();
        var directories = Directory.GetDirectories(sourceDir).Select(NormalizePath).ToList();

        files.ForEach(sourcePath =>
        {
            if (!sourcePath.EndsWith(".json"))
            {
                return;
            }

            if (
                !PokeApi.endpointNames.Any(name => sourcePath.Contains($"v2/{name}/"))
            )
            {
                return;
            }

            var filename = Path.GetFileName(sourcePath);
            var targetPath = NormalizePath(Path.Combine(targetDir, filename));

            Directory.CreateDirectory(targetDir);

            var sourceData = File.ReadAllText(sourcePath);
            var minified = JsonSerializer.Serialize(
                JsonSerializer.Deserialize<object>(sourceData)
            );
            // Console.WriteLine(targetPath);
            File.WriteAllText(targetPath, minified, Encoding.UTF8);
        });

        directories.ForEach(sourcePath =>
        {
            var dirname = Path.GetFileName(sourcePath)!;
            var targetPath = NormalizePath(Path.Combine(targetDir, dirname));

            if (
                !PokeApi.endpointNames.Any(name => sourcePath.Contains($"v2/{name}"))
            )
            {
                return;
            }

            // Console.WriteLine(targetPath);
            Process(sourcePath, targetPath);
        });
    }

    private static string NormalizePath(string path)
    {
        return path.Replace('\\', '/');
    }
}
