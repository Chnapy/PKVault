using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Primitives;

public partial class ExceptionHandlingMiddleware(RequestDelegate next)
{
    public async Task Invoke(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            await WriteExceptionResponse(context, ex);
        }
    }

    private static async Task WriteExceptionResponse(HttpContext context, Exception ex)
    {
        Console.Error.WriteLine(ex);
        var response = context.Response;
        if (response.HasStarted)
        {
            return;
        }

        response.StatusCode = GetStatusCode(ex);
        response.ContentType = "text/plain";
        response.ContentLength = 0;

        response.Headers.Append("access-control-expose-headers", new StringValues(["error-message", "error-stack"]));
        response.Headers.Append("error-message", JsonSerializer.Serialize(
            InvalidCharacterRegex().Replace(ex.Message, "\n").Replace("\n\n", "\n"),
            RouteJsonContext.Default.String
        ));
        response.Headers.Append("error-stack", JsonSerializer.Serialize(
            InvalidCharacterRegex().Replace(ex.ToString(), "\n").Replace("\n\n", "\n"),
            RouteJsonContext.Default.String
        ));

        await response.Body.FlushAsync();
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
