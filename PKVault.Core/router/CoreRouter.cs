using System.Diagnostics;
using System.Globalization;
using System.Reflection;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using HttpMultipartParser;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Primitives;
using NSwag;
using PKVault.Core.backup.routes;
using PKVault.Core.dex.routes;
using PKVault.Core.saveinfos.routes;
using PKVault.Core.settings.routes;
using PKVault.Core.storage.routes;
using PKVault.Core.warnings.routes;
using Serilog;
using Serilog.Events;
using System.Web;
using System.Collections.Specialized;
using PKVault.Core.OpenApi;

namespace PKVault.Core;

public partial class CoreRouter
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
    public async Task<string?> DispatchToJSON(
        IServiceProvider sp,
        string httpMethod, string httpPath,
        string queriesString, Stream bodyStream)
    {
        var result = await Dispatch(sp, httpMethod, httpPath, queriesString, bodyStream);

        if (result is not CoreJSONResponse response)
            return null;

        if (response.Data == null)
            return JsonSerializer.Serialize(response.Header, new RouteJsonContext(new()
            {
                WriteIndented = true
            }).DictionaryStringStringValues);

        var resultValue = response.Data;

        var typeInfo = RouteJsonContext.Default.GetTypeInfo(resultValue.GetType())
            ?? throw new Exception($"Missing TypeInfo for type {resultValue.GetType()}");
        return JsonSerializer.Serialize(resultValue, typeInfo);
    }

    public async Task<ICoreResponse> Dispatch(
        IServiceProvider sp,
        string httpMethod, string httpPath,
        string queriesString, Stream bodyStream
    )
    {
        var sw = Stopwatch.StartNew();
        int statusCode = default;
        Exception? exception = null;

        httpMethod = httpMethod.ToUpper();
        var queries = HttpUtility.ParseQueryString(queriesString);

        try
        {
            var match = Match(httpMethod, httpPath);
            if (!match.HasValue)
            {
                throw new KeyNotFoundException($"No route found for {httpMethod} {httpPath} routes.length={Routes.Count()}");
            }
            var (Route, PathVariables) = match.Value;

            List<object?> parameters = [];
            foreach (var (Param, Kind) in Route.Parameters)
            {
                parameters.Add(await BindParameter(Param, Kind, PathVariables, queries, bodyStream));
            }

            var controllerType = Route.MethodInfo.DeclaringType!;
            object controller = sp.GetRequiredService(controllerType);

            var result = Route.MethodInfo.Invoke(controller, parameters.ToArray());
            object? resultValue = await UnwrapResultAsync(result);

            if (resultValue is not ICoreResponse response)
                response = new CoreJSONResponse(
                    Data: resultValue
                );

            if (response is CoreFileResponse fileResponse)
                response = fileResponse with
                {
                    ContentType = fileResponse.ContentType ?? fileResponse.File.ContentType,
                };

            statusCode = response is CoreJSONResponse jsonResponse && jsonResponse.Data == null
                ? 204
                : 200;

            return response;
        }
        catch (Exception ex)
        {
            if (ex is TargetInvocationException tex)
                ex = tex.GetBaseException();

            statusCode = GetStatusCode(ex);
            exception = ex;

            return new CoreJSONResponse(
                Data: null,
                StatusCode: statusCode,
                ContentType: "text/plain",
                Header: new()
                {
                    ["access-control-expose-headers"] = new StringValues(["error-message", "error-stack"]),
                    ["error-message"] = JsonSerializer.Serialize(
                        InvalidCharacterRegex().Replace(ex.Message, "\n").Replace("\n\n", "\n"),
                        RouteJsonContext.Default.String
                    ),
                    ["error-stack"] = JsonSerializer.Serialize(
                        InvalidCharacterRegex().Replace(ex.ToString(), "\n").Replace("\n\n", "\n"),
                        RouteJsonContext.Default.String
                    )
                }
            );
        }
        finally
        {
            sw.Stop();
            Log.Write(
                statusCode >= 500 ? LogEventLevel.Error :
                    statusCode >= 400 ? LogEventLevel.Warning
                        : LogEventLevel.Information,
                exception,
                $"HTTP {httpMethod} {httpPath} responded {statusCode} in {sw.ElapsedMilliseconds} ms"
            );
        }
    }

    private static int GetStatusCode(Exception ex)
    {
        return ex switch
        {
            KeyNotFoundException => 404,
            InvalidOperationException => 403,
            ArgumentException => 400,
            _ => 500,
        };
    }

    [GeneratedRegex(@"[^\x20-\x7E]")]
    private static partial Regex InvalidCharacterRegex();

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

    private static async Task<object?> BindParameter(
        ParameterInfo p, OpenApiParameterKind kind,
        Dictionary<string, string> routeValues, NameValueCollection queries, Stream bodyStream)
    {
        if (p.ParameterType == typeof(CoreFile[]))
        {
            var parser = await MultipartFormDataParser.ParseAsync(bodyStream).ConfigureAwait(false);
            return parser.Files.Select((file) => new CoreFile(
                Stream: file.Data,
                ContentType: file.ContentType,
                FileName: file.FileName,
                Name: file.Name
            )).ToArray();
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

        if (kind == OpenApiParameterKind.Path && routeValues.TryGetValue(p.Name!, out var raw))
            return ParsePrimitive(raw, p.ParameterType);

        if (kind == OpenApiParameterKind.Query)
        {
            HashSet<string> queryKeys = [..queries.Keys.OfType<string>()];

            if (!queryKeys.Contains(p.Name!))
            {
                if (p.HasDefaultValue)
                    return p.DefaultValue;
                if (Nullable.GetUnderlyingType(p.ParameterType) != null)
                    return null;
                throw new ArgumentException($"Missing required parameter: {p.Name}");
            }

            if (p.ParameterType.IsArray)
            {
                var values = queries.GetValues(p.Name!)!;
                // Console.WriteLine($"Arr {p.Name}={values}");

                var arr = Array.CreateInstanceFromArrayType(p.ParameterType, values.Length);
                for (var i = 0; i < values.Length; i++)
                {
                    arr.SetValue(
                        ParsePrimitive(values[i], p.ParameterType.GetElementType()!),
                        i
                    );
                }
                return arr;
            }

            var value = queries.Get(p.Name!)!;
            // Console.WriteLine($"Item {p.Name}={value}");

            return ParsePrimitive(value, p.ParameterType);
        }

        if (kind == OpenApiParameterKind.Body)
        {
            using var reader = new StreamReader(bodyStream);
            var body = JsonNode.Parse(reader.ReadToEnd())?.AsObject() ?? [];
            return body?.Deserialize(p.ParameterType, RouteJsonContext.Default);
        }

        throw new ArgumentException($"A {kind} parameter is missing: {p.Name} of type {p.ParameterType} {queries[p.Name!]?.GetType()}");
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
            _ when type == typeof(uint) => uint.Parse(raw, CultureInfo.InvariantCulture),
            _ when type == typeof(long) => long.Parse(raw, CultureInfo.InvariantCulture),
            _ when type == typeof(ulong) => ulong.Parse(raw, CultureInfo.InvariantCulture),
            _ when type == typeof(short) => short.Parse(raw, CultureInfo.InvariantCulture),
            _ when type == typeof(ushort) => ushort.Parse(raw, CultureInfo.InvariantCulture),
            _ when type == typeof(byte) => byte.Parse(raw, CultureInfo.InvariantCulture),
            _ when type == typeof(double) => double.Parse(raw, CultureInfo.InvariantCulture),
            _ when type == typeof(float) => float.Parse(raw, CultureInfo.InvariantCulture),
            _ when type == typeof(decimal) => decimal.Parse(raw, CultureInfo.InvariantCulture),
            _ when type.IsEnum => Enum.Parse(type, raw, ignoreCase: true),

            _ => throw new Exception($"Primitive type not handled: {type}")
        };
    }

    private static async Task<object?> UnwrapResultAsync(object? invokeResult)
    {
        if (invokeResult is not Task task)
            return invokeResult;

        await task.ConfigureAwait(false);

        var resultProperty = task.GetType().GetProperty("Result");
        if (resultProperty is null || IsTypeVoidLike(resultProperty.GetType()))
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
            var routeTransformedName = SlugifyTransformer.TransformOutbound(routeName);
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
                    AssertIsTypeJSONParsable(p.ParameterType);

                    OpenApiParameterKind Kind = OpenApiParameterKind.Body;
                    if (http.Template.Contains($"{{{p.Name}}}"))
                        Kind = OpenApiParameterKind.Path;
                    else if (IsQueryCompatible(p.ParameterType))
                        Kind = OpenApiParameterKind.Query;

                    parameters.Add((Param: p, Kind));
                }

                AssertIsTypeJSONParsable(methodInfo.ReturnType);

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

        if (type.IsEnum || primitiveTypes.Contains(type))
            return true;

        var finalType = GetFinalType(type);
        if (finalType != type && IsQueryCompatible(finalType))
            return true;

        return false;
    }

    private static void AssertIsTypeJSONParsable(Type type)
    {
        var finalType = GetFinalType(type);
        if (IsTypeVoidLike(finalType)
            || finalType == typeof(CoreFile)
            || typeof(ICoreResponse).IsAssignableFrom(finalType)
        )
            return;

        if (RouteJsonContext.Default.GetTypeInfo(finalType) is null)
            throw new InvalidOperationException($"Missing TypeInfo for type {finalType}");
    }

    private static Type GetFinalType(Type type)
    {
        type = OpenApiGenerator.UnwrapTaskType(type);

        var innerType = type.GetElementType()
            ?? Nullable.GetUnderlyingType(type);

        if (innerType != null)
            return GetFinalType(innerType);

        return type;
    }

    private static bool IsTypeVoidLike(Type type) => type == typeof(void)
        // void detection may be dirty, but this way is reliable
        // use of typeof(void) doesn't work
        || type.GetType().ToString() == "System.Threading.Tasks.VoidTaskResult";
}
