using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Primitives;

public partial class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;

    public ExceptionHandlingMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (DataActionException ex)
        {
            var data = await DataDTO.FromDataUpdateFlags(ex.flags);
            await WriteExceptionResponse(context, ex.ex, data);
        }
        catch (Exception ex)
        {
            await WriteExceptionResponse(context, ex, null);
        }
    }

    private static async Task WriteExceptionResponse(HttpContext context, Exception ex, DataDTO? data)
    {
        Console.Error.WriteLine(ex);

        if (context.Response.HasStarted)
        {
            return;
        }

        context.Response.StatusCode = GetStatusCode(ex);
        context.Response.ContentType = "application/json";

        context.Response.Headers.Append("access-control-expose-headers", new StringValues(["error-message", "error-stack"]));
        context.Response.Headers.Append("error-message", InvalidCharacterRegex().Replace(ex.Message, string.Empty));
        context.Response.Headers.Append("error-stack", InvalidCharacterRegex().Replace(ex.ToString(), string.Empty));

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
