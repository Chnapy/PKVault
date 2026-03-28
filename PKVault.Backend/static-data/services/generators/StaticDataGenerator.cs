using System.IO.Compression;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Serialization.Metadata;
using DiffPlex.Renderer;
using PKHeX.Core;

public abstract class StaticDataGenerator<D>(
    JsonTypeInfo<D> jsonTypeInfo, JsonTypeInfo<D> jsonTypeInfoIndented, IFileIOService fileIOService
)
{
    public static readonly EntityContext LAST_ENTITY_CONTEXT = EntityContext.Gen9a;

    public static List<string> GetGeneratedPathParts() => ["pokeapi", "generated"];

    protected static JsonSerializerOptions JsonIndentedOptions => new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = true,
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
    };

    public async Task<D> GenerateFiles()
    {
        var filename = GetFilenameWithoutExtension();

        var time = LogUtil.Time($"{filename} process");

        var data = await GetData();

        time.Dispose();

        var oldDataString = await GetOldDataString();

        var dataPath = Path.Combine(GetDataPathParts(filename));

        time = LogUtil.Time($"Write {filename} to {dataPath}");

        await fileIOService.WriteJSONGZipFile(dataPath, jsonTypeInfo, data);

        var newDataString = JsonSerializer.Serialize(data, jsonTypeInfoIndented);

        var diffFilename = Path.Combine(GetDataDiffPathParts(filename));

        string unidiff = $"--- This file displays changes of {filename} compressed file from previous changes\n\n"
            + UnidiffRenderer.GenerateUnidiff(
                oldText: oldDataString,
                newText: newDataString,
                oldFileName: diffFilename,
                newFileName: diffFilename
            );

        await fileIOService.WriteBytes(diffFilename, Encoding.UTF8.GetBytes(unidiff));

        time.Dispose();

        return data;
    }

    protected abstract Task<D> GetData();

    private async Task<string> GetOldDataString()
    {
        var filename = GetFilenameWithoutExtension();
        var path = Path.Combine([.. GetDataPathParts(filename)]);
        if (!File.Exists(path))
        {
            return "";
        }

        using var fileStream = File.OpenRead(path);
        using var gzipStream = new GZipStream(fileStream, CompressionMode.Decompress);

        var oldData = await JsonSerializer.DeserializeAsync<Dictionary<string, object>>(gzipStream);

        return JsonSerializer.Serialize(oldData, JsonIndentedOptions);
    }

    protected abstract string GetFilenameWithoutExtension();

    private const string GH_PREFIX = "https://raw.githubusercontent.com/PokeAPI/sprites/master/";

    protected static string GetPokeapiRelativePath(string url)
    {
        if (url.Length < GH_PREFIX.Length)
        {
            return "";
        }

        return url[GH_PREFIX.Length..];
    }

    protected static string[] GetDataPathParts(string filename) => [
        ..GetGeneratedPathParts(), "api-data", $"{filename}.json.gz"
    ];

    protected static string[] GetDataDiffPathParts(string filename) => [
        ..GetGeneratedPathParts(), "diff-data", $"{filename}.diff"
    ];
}