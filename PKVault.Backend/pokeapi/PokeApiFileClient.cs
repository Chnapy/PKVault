using System.Diagnostics.CodeAnalysis;
using System.Globalization;
using System.Reflection;
using System.Text;
using System.Text.Json.Serialization.Metadata;
using System.Text.RegularExpressions;
using PokeApiNet;

public partial class PokeApiFileClient(IFileIOService fileIOService)
{
    public async Task<T?> GetAsync<T>(UrlNavigation<T> urlResource, JsonTypeInfo<T> jsonContext) where T : ResourceBase
    {
        return await GetAsyncByUrl(urlResource.Url, jsonContext);
    }

    public async Task<T?> GetAsync<T>(string name, JsonTypeInfo<NamedApiResourceList<T>> jsonContextList, JsonTypeInfo<T> jsonContext) where T : NamedApiResource
    {
        if (name.Contains('★'))
        {
            return null;
        }

        var formattedName = PokeApiNameFromPKHexName(name);

        var results = await GetAsyncList(jsonContextList, jsonContext);

        var namedApi = results.Find(resource => resource.Name.Equals(formattedName, StringComparison.CurrentCultureIgnoreCase));
        if (namedApi == null)
        {
            return null;
        }

        return await GetAsync(namedApi, jsonContext);
    }

    public async Task<List<NamedApiResource<T>>> GetAsyncList<T>(JsonTypeInfo<NamedApiResourceList<T>> jsonContextList, JsonTypeInfo<T> jsonContext) where T : NamedApiResource
    {
        string url = GetApiEndpointString(jsonContext.Type);

        NamedApiResourceList<T>? page = await GetAsyncByPathname(url, jsonContextList);

        return page!.Results;
    }

    public async Task<List<ApiResource<T>>> GetAsyncUrlList<T>(JsonTypeInfo<ApiResourceList<T>> jsonContextList, JsonTypeInfo<T> jsonContext) where T : ApiResource
    {
        string url = GetApiEndpointString(jsonContext.Type);

        ApiResourceList<T>? page = await GetAsyncByPathname(url, jsonContextList);

        return page!.Results;
    }

    public async Task<T?> GetAsync<T>(int apiParam, JsonTypeInfo<T> jsonContext)
    {
        string text = IsApiEndpointCaseSensitive(jsonContext.Type) ? apiParam.ToString() : apiParam.ToString().ToLowerInvariant();
        string apiEndpointString = GetApiEndpointString(jsonContext.Type);

        return await GetAsyncByPathname($"{apiEndpointString}/{text}", jsonContext);
    }

    private async Task<T?> GetAsyncByPathname<T>(string pathname, JsonTypeInfo<T> jsonContext)
    {
        return await GetAsyncByUrl($"/api/v2/{pathname}", jsonContext);
    }

    private async Task<T?> GetAsyncByUrl<T>(string url, JsonTypeInfo<T> jsonContext)
    {
        var uriParts = url
            .Split('/').ToList()
            .FindAll(part => part.Length > 0);

        List<string> fileParts = [
            "..", "pokeapi", "api-data","data",
            ..uriParts,
            "index.json"
        ];

        return await fileIOService.ReadJSONFile(string.Join('/', fileParts), jsonContext);
    }

    public string GetApiEndpointString(
        [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.NonPublicProperties)]
        System.Type jsonType)
    {
        return jsonType?.GetProperty("ApiEndpoint", BindingFlags.Static | BindingFlags.NonPublic)?.GetValue(null)?.ToString()
            ?? throw new Exception($"ApiEndpoint not found for type {jsonType}");
    }

    private bool IsApiEndpointCaseSensitive(
        [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.NonPublicProperties)]
        System.Type jsonType)
    {
        PropertyInfo? property = jsonType.GetProperty("IsApiEndpointCaseSensitive", BindingFlags.Static | BindingFlags.NonPublic);
        if (!(property == null))
        {
            return (bool)property.GetValue(null)!;
        }

        return false;
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

