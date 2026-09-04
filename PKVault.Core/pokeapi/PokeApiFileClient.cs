using System.Globalization;
using System.Reflection;
using System.Text;
using System.Text.Json.Serialization.Metadata;
using System.Text.RegularExpressions;
using PokeApi.Models;

public partial class PokeApiFileClient(IFileIOService fileIOService)
{
    public async Task<T?> GetAsync<T>(NamedApiResource urlResource, JsonTypeInfo<T> jsonContext)
    {
        return await GetAsyncByUrl(urlResource.Url, jsonContext);
    }

    public async Task<T?> GetAsync<T>(ApiResource urlResource, JsonTypeInfo<T> jsonContext)
    {
        return await GetAsyncByUrl(urlResource.Url, jsonContext);
    }

    public async Task<T?> GetAsync<T>(string name, JsonTypeInfo<NamedApiResourceList> jsonContextList, JsonTypeInfo<T> jsonContext)
    {
        if (name.Contains('★'))
        {
            return default;
        }

        var formattedName = PokeApiNameFromPKHexName(name);

        var results = await GetAsyncList(jsonContextList, jsonContext);

        var namedApi = results.FirstOrDefault(resource => resource.Name.Equals(formattedName, StringComparison.CurrentCultureIgnoreCase));
        if (namedApi == null)
        {
            return default;
        }

        return await GetAsync(namedApi, jsonContext);
    }

    public async Task<T?> GetAsync<T>(int apiParam, JsonTypeInfo<T> jsonContext)
    {
        string apiEndpointString = GetApiEndpointString(jsonContext.Type, list: false, apiParam.ToString());

        return await GetAsyncByUrl(apiEndpointString, jsonContext);
    }

    public async Task<ICollection<ApiResource>> GetAsyncList<T>(JsonTypeInfo<ApiResourceList> jsonContextList, JsonTypeInfo<T> jsonContext)
    {
        string url = GetApiEndpointString(jsonContext.Type, list: true);

        var page = await GetAsyncByUrl(url, jsonContextList);
        ArgumentNullException.ThrowIfNull(page);

        return page.Results;
    }

    public async Task<ICollection<NamedApiResource>> GetAsyncList<T>(JsonTypeInfo<NamedApiResourceList> jsonContextList, JsonTypeInfo<T> jsonContext)
    {
        string url = GetApiEndpointString(jsonContext.Type, list: true);

        var page = await GetAsyncByUrl(url, jsonContextList);
        ArgumentNullException.ThrowIfNull(page);

        return page.Results;
    }

    private async Task<T?> GetAsyncByUrl<T>(string url, JsonTypeInfo<T> jsonContext)
    {
        var uriParts = url
            .Split('/').ToList()
            .FindAll(part => part.Length > 0);

        var pokeapiDataDirPath = Path.Combine("..", "pokeapi", "api-data", "data");
        if (!Directory.Exists(pokeapiDataDirPath))
        {
            throw new Exception($"{pokeapiDataDirPath} doesn't exist. Did you pull pokeapi submodules ?");
        }

        if (!uriParts.Last().Contains('.'))
        {
            uriParts.Add("index.json");
        }

        var path = Path.Combine(pokeapiDataDirPath, string.Join('/', uriParts));

        var result = await fileIOService.ReadJSONFile(path, jsonContext);

        if (result == null && fileIOService.Exists(path))
        {
            throw new Exception($"Json reading error, data structure may have changed - PATH={path}");
        }

        return result;
    }

    public string GetApiEndpointString(
        // [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.NonPublicProperties)]
        System.Type jsonType,
        bool list,
        string? param = null
    )
    {
        var propertyName = list ? "FileEndpointList" : "FileEndpoint";
        
        var endpoint = jsonType.GetField(propertyName, BindingFlags.Static | BindingFlags.Public)?.GetValue(null)?.ToString();

        ArgumentException.ThrowIfNullOrWhiteSpace(endpoint, $"Endpoint missing using property {propertyName} for type {jsonType}");

        return endpoint.Replace("$id", param);
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
