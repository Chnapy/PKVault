using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Primitives;

public partial class ExceptionHandlingMiddleware(RequestDelegate next, DataService dataService)
{
    public async Task Invoke(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (DataActionException ex)
        {
            var data = await dataService.CreateDataFromUpdateFlags(ex.flags);
            await WriteExceptionResponse(context, ex.ex, data);
        }
        catch (Exception ex)
        {
            await WriteExceptionResponse(context, ex, null);
        }
    }

    public static void InjectResponseException(HttpResponse response, Exception ex)
    {
        if (response.HasStarted)
        {
            return;
        }

        response.StatusCode = GetStatusCode(ex);
        response.ContentType = "application/json";

        response.Headers.Append("access-control-expose-headers", new StringValues(["error-message", "error-stack"]));
        response.Headers.Append("error-message", JsonSerializer.Serialize(
            InvalidCharacterRegex().Replace(ex.Message, "\n").Replace("\n\n", "\n"),
            RouteJsonContext.Default.String
        ));
        response.Headers.Append("error-stack", JsonSerializer.Serialize(
            InvalidCharacterRegex().Replace(ex.ToString(), "\n").Replace("\n\n", "\n"),
            RouteJsonContext.Default.String
        ));
    }

    private static async Task WriteExceptionResponse(HttpContext context, Exception ex, DataDTO? data)
    {
        Console.Error.WriteLine(ex);

        InjectResponseException(context.Response, ex);

        if (data != null)
        {
            var result = JsonSerializer.Serialize(data, RouteJsonContext.Default.DataDTO);
            await context.Response.WriteAsync(result);
        }
    }

    private static int GetStatusCode(Exception ex)
    {
        return ex switch
        {
            KeyNotFoundException => StatusCodes.Status404NotFound,
            InvalidOperationException => StatusCodes.Status403Forbidden,
            ArgumentException => StatusCodes.Status400BadRequest,
            _ => StatusCodes.Status500InternalServerError,
        };
    }

    [GeneratedRegex(@"[^\x20-\x7E]")]
    private static partial Regex InvalidCharacterRegex();
}
