
using Microsoft.Extensions.Primitives;

namespace PKVault.Core;

public interface ICoreResponse
{
    int? StatusCode { get; }
    string? ContentType { get; }
    Dictionary<string, StringValues>? Header { get; }
}

public record CoreJSONResponse(
    object? Data,
    int? StatusCode = null,
    string? ContentType = null,
    Dictionary<string, StringValues>? Header = null
) : ICoreResponse;

public record CoreFileResponse(
    CoreFile File,
    int? StatusCode = null,
    string? ContentType = null,
    DateTimeOffset? LastModified = null,
    Dictionary<string, StringValues>? Header = null
) : ICoreResponse;

public record CoreFile(
    Stream Stream,
    string ContentType,
    string FileName,
    string? Name = null
);
