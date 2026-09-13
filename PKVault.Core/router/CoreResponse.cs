
using Microsoft.Extensions.Primitives;

namespace PKVault.Core;

public interface ICoreResponse
{
    int StatusCode { get; }
    string ContentType { get; }
    Dictionary<string, string> Header { get; }
}

public record CoreJSONResponse(
    object? Data,
    int StatusCode,
    string ContentType,
    Dictionary<string, string> Header
) : ICoreResponse;

public record CoreFileResponse(
    CoreFile File,
    int StatusCode,
    string ContentType,
    Dictionary<string, string> Header,
    DateTimeOffset? LastModified = null
) : ICoreResponse;

public record CoreFile(
    Stream Stream,
    string ContentType,
    string FileName,
    string? Name = null
);
