using System.Globalization;
using System.Reflection;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using PokeApiNet;

public partial class PokeApiFileClient
{
    public async Task<T> GetAsync<T>(UrlNavigation<T> urlResource) where T : ResourceBase
    {
        return await GetAsyncByUrl<T>(urlResource.Url);
    }

    public async Task<T?> GetAsync<T>(string name) where T : NamedApiResource
    {
        var formattedName = PokeApiNameFromPKHexName(name).ToLower();

        string url = GetApiEndpointString<T>();

        NamedApiResourceList<T> page = await GetAsyncByPathname<NamedApiResourceList<T>>(url);

        var namedApi = page?.Results.Find(resource => resource.Name.ToLower() == formattedName);
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

        var jsonContent = GetResourceFromAssembly(url);

        return DeserializeResource<T>(jsonContent);
    }

    private static T? DeserializeResource<T>(string jsonContent)
    {
        return JsonSerializer.Deserialize<T>(jsonContent, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
        });
    }

    public static string? GetApiEndpointString<T>()
    {
        return typeof(T).GetProperty("ApiEndpoint", BindingFlags.Static | BindingFlags.NonPublic)?.GetValue(null)?.ToString();
    }

    private static bool IsApiEndpointCaseSensitive<T>()
    {
        PropertyInfo property = typeof(T).GetProperty("IsApiEndpointCaseSensitive", BindingFlags.Static | BindingFlags.NonPublic);
        if (!(property == null))
        {
            return (bool)property.GetValue(null);
        }

        return false;
    }

    private static string GetResourceFromAssembly(string uri)
    {
        var uriParts = uri
            .Split('/').ToList()
            .FindAll(part => part.Length > 0);

        List<string> fileParts = [
            "pokeapi", "api-data","data",
            ..uriParts,
            "index.json"
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

        var assembly = Assembly.GetExecutingAssembly();

        var stream = assembly.GetManifestResourceStream(assemblyName) ?? throw new Exception($"RESOURCE NOT FOUND: {assemblyName}");
        using StreamReader reader = new(stream);
        string jsonContent = reader.ReadToEnd();

        return jsonContent;
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

        if (pkhexName.Contains('('))
        {
            return pkhexName;
            // throw new Exception($"PKHex string not handled: {pkhexName}");
        }

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

