using System.Globalization;
using System.Reflection;
using System.Text.Json;
using System.Text.Json.Nodes;
using HttpMultipartParser;
using Microsoft.Extensions.DependencyInjection;
using NJsonSchema;
using NSwag;
using PKVault.Core.backup.routes;
using PKVault.Core.dex.routes;
using PKVault.Core.saveinfos.routes;
using PKVault.Core.settings.routes;
using PKVault.Core.storage.routes;
using PKVault.Core.warnings.routes;

namespace PKVault.Core;

public class CoreRouter(IServiceProvider sp)
{
    private static readonly Type[] ControllersTypes = [
        typeof(BackupController),
        typeof(SaveInfosController),
        typeof(StorageController),
        typeof(DexController),
        typeof(SettingsController),
        typeof(WarningsController),
        typeof(StaticDataController),
    ];

    // "GET", "api/static-data/spritesheet/{sheetName}", MethodInfo, (ParameterInfo, Kind)[], "StaticData", "GetSpritesheetImg"
    public record CoreRoute(
        string HttpMethod,
        string HttpTemplate,
        MethodInfo MethodInfo,
        IEnumerable<(ParameterInfo Param, OpenApiParameterKind Kind)> Parameters,
        string ControllerName,
        string MethodName
    );

    public readonly IEnumerable<CoreRoute> Routes = GetAllRoutes();

    // Return JSON string, only if data is serializable (not file)
    public async Task<string?> DispatchToJSON(string httpMethod, string httpPath, string queriesJson, Stream bodyStream)
    {
        var result = await Dispatch(httpMethod, httpPath, queriesJson, bodyStream);

        if (result is not CoreJSONResponse response || response.Data == null)
            return null;

        var resultValue = response.Data;

        var typeInfo = RouteJsonContext.Default.GetTypeInfo(resultValue.GetType())!;
        return JsonSerializer.Serialize(resultValue, typeInfo);
    }

    public async Task<object?> Dispatch(string httpMethod, string httpPath, string queriesJson, Stream bodyStream)
    {
        var queries = JsonNode.Parse(queriesJson)?.AsObject() ?? [];

        var match = Match(httpMethod, httpPath);
        if (!match.HasValue)
        {
            throw new KeyNotFoundException($"No route found for {httpMethod} /{httpPath} routes.length={Routes.Count()}");
        }
        var (Route, PathVariables) = match.Value;

        List<object?> parameters = [];
        foreach (var (Param, _) in Route.Parameters)
        {
            parameters.Add(await BindParameter(Param, PathVariables, queries, bodyStream));
        }

        var controllerType = Route.MethodInfo.DeclaringType!;
        using var scope = sp.CreateScope();
        object controller = scope.ServiceProvider.GetRequiredService(controllerType);

        var result = Route.MethodInfo.Invoke(controller, parameters.ToArray());
        object? resultValue = await UnwrapResultAsync(result);

        if (result == null
            // void detection may be dirty, but this way is reliable
            // use of typeof(void) doesn't work
            || result.GetType().ToString() == "System.Threading.Tasks.VoidTaskResult"
        )
            return null;

        if (resultValue is not ICoreResponse)
            return new CoreJSONResponse(
                Data: resultValue
            );

        if (resultValue is CoreFileResponse fileResponse)
        {
            resultValue = fileResponse with
            {
                ContentType = fileResponse.ContentType ?? fileResponse.File.ContentType,
            };
        }

        return resultValue;
    }

    private (CoreRoute Route, Dictionary<string, string> PathVariables)? Match(string httpMethod, string httpPath)
    {
        var pathSegments = httpPath.Trim('/').Split('/');

        foreach (var route in Routes)
        {
            if (route.HttpMethod != httpMethod)
                continue;

            var templateSegments = route.HttpTemplate.Trim('/').Split('/');
            if (templateSegments.Length != pathSegments.Length)
                continue;

            var values = new Dictionary<string, string>();
            bool isMatch = true;

            for (int i = 0; i < templateSegments.Length; i++)
            {
                var seg = templateSegments[i];
                if (seg.StartsWith('{') && seg.EndsWith('}'))
                {
                    values[seg[1..^1]] = pathSegments[i];
                }
                else if (!string.Equals(seg, pathSegments[i], StringComparison.OrdinalIgnoreCase))
                {
                    isMatch = false;
                    break;
                }
            }

            if (isMatch)
                return (route, values);
        }

        return null;
    }

    private static async Task<object?> BindParameter(ParameterInfo p, Dictionary<string, string> routeValues, JsonObject queries, Stream bodyStream)
    {
        if (p.ParameterType == typeof(CoreFile[]))
        {
            var parser = await MultipartFormDataParser.ParseAsync(bodyStream).ConfigureAwait(false);
            return parser.Files.Select((file) => new CoreFile(
                Stream: file.Data,
                ContentType: file.ContentType,
                FileName: file.FileName,
                Name: file.Name
            ));
        }

        if (p.ParameterType == typeof(CoreFile))
        {
            var parser = await MultipartFormDataParser.ParseAsync(bodyStream).ConfigureAwait(false);
            var file = parser.Files[0];
            return new CoreFile(
                Stream: file.Data,
                ContentType: file.ContentType,
                FileName: file.FileName,
                Name: file.Name
            );
        }

        if (routeValues.TryGetValue(p.Name!, out var raw))
            return ParsePrimitive(raw, p.ParameterType);

        if (queries[p.Name!] is JsonNode qNode)
            return qNode.Deserialize(p.ParameterType, RouteJsonContext.Default);

        using var reader = new StreamReader(bodyStream);
        var body = JsonNode.Parse(reader.ReadToEnd())?.AsObject() ?? [];
        return body?.Deserialize(p.ParameterType, RouteJsonContext.Default);
    }

    private static object? ParsePrimitive(string raw, Type targetType)
    {
        // Unwrap Nullable<T> or T?
        var underlyingType = Nullable.GetUnderlyingType(targetType);
        var isNullable = underlyingType is not null;
        var type = underlyingType ?? targetType;

        if (string.IsNullOrEmpty(raw))
        {
            if (isNullable || type == typeof(string))
                return null;
            throw new Exception($"Valeur manquante pour un paramètre de type {type.Name}.");
        }

        return type switch
        {
            _ when type == typeof(string) => raw,
            _ when type == typeof(Guid) => Guid.Parse(raw),
            _ when type == typeof(DateTime) => DateTime.Parse(raw, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind),
            _ when type == typeof(DateTimeOffset) => DateTimeOffset.Parse(raw, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind),
            _ when type == typeof(TimeSpan) => TimeSpan.Parse(raw, CultureInfo.InvariantCulture),
            _ when type == typeof(bool) => bool.Parse(raw),
            _ when type == typeof(int) => int.Parse(raw, CultureInfo.InvariantCulture),
            _ when type == typeof(long) => long.Parse(raw, CultureInfo.InvariantCulture),
            _ when type == typeof(short) => short.Parse(raw, CultureInfo.InvariantCulture),
            _ when type == typeof(byte) => byte.Parse(raw, CultureInfo.InvariantCulture),
            _ when type == typeof(double) => double.Parse(raw, CultureInfo.InvariantCulture),
            _ when type == typeof(float) => float.Parse(raw, CultureInfo.InvariantCulture),
            _ when type == typeof(decimal) => decimal.Parse(raw, CultureInfo.InvariantCulture),
            _ when type.IsEnum => Enum.Parse(type, raw, ignoreCase: true),

            _ => throw new Exception()
        };
    }

    private static async Task<object?> UnwrapResultAsync(object? invokeResult)
    {
        if (invokeResult is not Task task)
            return invokeResult;

        await task.ConfigureAwait(false);

        var resultProperty = task.GetType().GetProperty("Result");
        if (resultProperty is null)
            return null;

        return resultProperty.GetValue(task);
    }

    private static List<CoreRoute> GetAllRoutes()
    {
        List<CoreRoute> routes = [];

        foreach (var controllerType in ControllersTypes)
        {
            var routeAttribute = controllerType.GetCustomAttribute<RouteAttribute>();
            if (routeAttribute == null)
                continue;

            var routeName = controllerType.Name.Replace("Controller", "");
            var routeTransformedName = SlugifyParameterTransformer.TransformOutbound(routeName);
            var routeBase = routeAttribute.Template.Replace("[controller]", routeTransformedName);

            // Console.WriteLine($"Controller = {controllerType.Name} {routeAttribute.Template}");

            MethodInfo[] methodsInfos = controllerType.GetMethods();
            foreach (var methodInfo in methodsInfos)
            {
                var http = methodInfo.GetCustomAttribute<HttpAttribute>();
                if (http == null)
                    continue;

                var fullTemplate = $"{routeBase.TrimEnd('/')}/{http.Template.TrimStart('/')}";

                var parametersInfos = methodInfo.GetParameters();
                List<(ParameterInfo Param, OpenApiParameterKind Kind)> parameters = [];

                foreach (var p in parametersInfos)
                {
                    OpenApiParameterKind Kind = OpenApiParameterKind.Body;
                    if (http.Template.Contains($"{{{p.Name}}}"))
                        Kind = OpenApiParameterKind.Path;
                    else if (IsQueryCompatible(p.ParameterType))
                        Kind = OpenApiParameterKind.Query;

                    parameters.Add((Param: p, Kind));
                }

                // Console.WriteLine($"\tRoute = {methodInfo.Name} {http.Method} {fullTemplate} [{string.Join(',', parametersInfos.Select(p => $"{p.Name}"))}]");

                routes.Add(new CoreRoute(http.Method, fullTemplate, methodInfo, parameters, routeName, methodInfo.Name));
            }
        }

        return routes;
    }

    private static bool IsQueryCompatible(Type type)
    {
        HashSet<Type> primitiveTypes = [
            typeof(string),
            typeof(bool),
            typeof(int),
            typeof(uint),
            typeof(long),
            typeof(ulong),
            typeof(short),
            typeof(ushort),
            typeof(byte),
            typeof(double),
            typeof(float),
            typeof(decimal),
            typeof(Enum),
            typeof(Guid),
            typeof(DateTime),
            typeof(DateTimeOffset),
            typeof(TimeSpan),
        ];

        if (primitiveTypes.Contains(type))
            return true;

        var elementType = type.GetElementType();
        if (elementType != null && IsQueryCompatible(elementType))
            return true;

        var nullableType = Nullable.GetUnderlyingType(type);
        if (nullableType != null && IsQueryCompatible(nullableType))
            return true;

        if (type.BaseType != null && type.BaseType != typeof(object) && IsQueryCompatible(type.BaseType))
            return true;

        return false;
    }
}
