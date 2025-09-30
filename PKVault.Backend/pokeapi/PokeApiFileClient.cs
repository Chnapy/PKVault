using System.Buffers;
using System.Globalization;
using System.IO.Compression;
using System.Reflection;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using PokeApiNet;

public partial class PokeApiFileClient
{
    private static readonly Assembly assembly = Assembly.GetExecutingAssembly();
    private static readonly JsonSerializerOptions jsonOptions = GetJsonOptions();

    public async Task<T?> GetAsync<T>(UrlNavigation<T> urlResource) where T : ResourceBase
    {
        return await GetAsyncByUrl<T>(urlResource.Url);
    }

    public async Task<T?> GetAsync<T>(string name) where T : NamedApiResource
    {
        if (name.Contains('★'))
        {
            return null;
        }

        var formattedName = PokeApiNameFromPKHexName(name);

        string url = GetApiEndpointString<T>();

        NamedApiResourceList<T>? page = await GetAsyncByPathname<NamedApiResourceList<T>>(url);

        var namedApi = page!.Results.Find(resource => resource.Name.Equals(formattedName, StringComparison.CurrentCultureIgnoreCase));
        if (namedApi == null)
        {
            return null;
        }

        return await GetAsync(namedApi);
    }

    public async Task<T?> GetAsync<T>(int apiParam)
    {
        string text = IsApiEndpointCaseSensitive<T>() ? apiParam.ToString() : apiParam.ToString().ToLowerInvariant();
        string apiEndpointString = GetApiEndpointString<T>();

        return await GetAsyncByPathname<T>($"{apiEndpointString}/{text}");
    }

    private static async Task<T?> GetAsyncByPathname<T>(string pathname)
    {
        return await GetAsyncByUrl<T>($"/api/v2/{pathname}");
    }

    private static async Task<T?> GetAsyncByUrl<T>(string url)
    {
        // Console.WriteLine($"POKEAPI = {url}");

        byte[] rentedBuffer = ArrayPool<byte>.Shared.Rent(jsonOptions.DefaultBufferSize);

        try
        {
            using var jsonStream = GetResourceFromAssembly(url);

            return await DeserializeResource<T>(jsonStream);
        }
        // catch
        // {
        //     Console.WriteLine($"Error with URL={url}");
        //     throw;
        // }
        finally
        {
            // return buffer to pool
            ArrayPool<byte>.Shared.Return(rentedBuffer);
        }
    }

    private static async Task<T?> DeserializeResource<T>(Stream jsonStream)
    {
        return await JsonSerializer.DeserializeAsync<T>(jsonStream, jsonOptions);
    }

    public static string GetApiEndpointString<T>()
    {
        return typeof(T).GetProperty("ApiEndpoint", BindingFlags.Static | BindingFlags.NonPublic)?.GetValue(null)?.ToString()
            ?? throw new Exception($"ApiEndpoint not found for type {nameof(T)}");
    }

    private static bool IsApiEndpointCaseSensitive<T>()
    {
        PropertyInfo? property = typeof(T).GetProperty("IsApiEndpointCaseSensitive", BindingFlags.Static | BindingFlags.NonPublic);
        if (!(property == null))
        {
            return (bool)property.GetValue(null)!;
        }

        return false;
    }

    private static GZipStream GetResourceFromAssembly(string uri)
    {
        var uriParts = uri
            .Split('/').ToList()
            .FindAll(part => part.Length > 0);

        List<string> fileParts = [
            "pokeapi", "api-data","data",
            ..uriParts,
            "index.json.gz"
        ];

        List<string> assemblyParts = [
            "PKVault.Backend",
            ..fileParts
        ];

        var assemblyName = string.Join('.', assemblyParts.Select(part =>
        {
            part = part.Replace('-', '_');

            var isInt = int.TryParse(part, out _);
            if (isInt)
            {
                part = $"_{part}";
            }

            return part;
        }));

        var stream = assembly.GetManifestResourceStream(assemblyName) ?? throw new KeyNotFoundException($"RESOURCE NOT FOUND: {assemblyName}");

        var gzipStream = new GZipStream(stream, CompressionMode.Decompress);

        return gzipStream;
    }

    private static JsonSerializerOptions GetJsonOptions()
    {
        var options = new JsonSerializerOptions()
        {
            PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
            PropertyNameCaseInsensitive = true,
            DefaultBufferSize = 16 * 1024, // buffer 16 Ko
        };

        // required for pokeapi deserialize (types are wrong sometimes)
        options.Converters.Add(
            new NumberToStringConverter()
        );

        return options;
    }

    public static string PokeApiNameFromPKHexName(string pkhexName)
    {
        static string RemoveDiacritics(string text)
        {
            if (string.IsNullOrWhiteSpace(text))
                return text;

            var normalizedString = text.Normalize(NormalizationForm.FormD);
            var stringBuilder = new StringBuilder();

            foreach (var c in normalizedString)
            {
                var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
                if (unicodeCategory != UnicodeCategory.NonSpacingMark)
                    stringBuilder.Append(c);
            }

            return stringBuilder.ToString().Normalize(NormalizationForm.FormC);
        }

        // if (pkhexName.Contains('('))
        // {
        //     return pkhexName;
        // }

        var result = PascalCaseRegex().Replace(pkhexName, "$1-$2");
        result = SpaceRegex().Replace(result, "-").ToLower();
        result = RemoveDiacritics(result);
        result = result.Replace("♀", "-f").Replace("♂", "-m");
        result = PonctuRegex().Replace(result, "");

        return result;
    }

    [GeneratedRegex("([a-z])([A-Z])")]
    private static partial Regex PascalCaseRegex();

    [GeneratedRegex(@"\s+")]
    private static partial Regex SpaceRegex();

    [GeneratedRegex(@"[\.’'`´]+")]
    private static partial Regex PonctuRegex();
}

public enum PokeApiPokedexEnum
{
    HOENN = 4,
}

