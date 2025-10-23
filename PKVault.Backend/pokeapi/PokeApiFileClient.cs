using System.Globalization;
using System.Reflection;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using PokeApiNet;

public partial class PokeApiFileClient
{
    private static readonly AssemblyClient assemblyClient = new(GetJsonOptions());

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

        var results = await GetAsyncList<T>();

        var namedApi = results.Find(resource => resource.Name.Equals(formattedName, StringComparison.CurrentCultureIgnoreCase));
        if (namedApi == null)
        {
            return null;
        }

        return await GetAsync(namedApi);
    }

    public async Task<List<NamedApiResource<T>>> GetAsyncList<T>() where T : NamedApiResource
    {
        string url = GetApiEndpointString<T>();

        NamedApiResourceList<T>? page = await GetAsyncByPathname<NamedApiResourceList<T>>(url);

        return page!.Results;
    }

    public async Task<List<ApiResource<T>>> GetAsyncUrlList<T>() where T : ApiResource
    {
        string url = GetApiEndpointString<T>();

        ApiResourceList<T>? page = await GetAsyncByPathname<ApiResourceList<T>>(url);

        return page!.Results;
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
        var uriParts = url
            .Split('/').ToList()
            .FindAll(part => part.Length > 0);

        List<string> fileParts = [
            "pokeapi", "api-data","data",
            ..uriParts,
            "index.json.gz"
        ];

        return await assemblyClient.GetAsyncJsonGz<T>(fileParts);
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

