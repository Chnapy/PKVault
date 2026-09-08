
namespace PKVault.Core;

public record DesktopFetchRequestInit(
    string method,
    Dictionary<string, string> headers,
    string? body = null
);

public record DesktopFetchResponse(
    string url,
    int status,
    string statusText,
    bool ok,
    Dictionary<string, string> headers,
    string? body = null
);

public enum DesktopMessageType
{
    FILE_EXPLORE,
    OPEN_FOLDER,
}

public record DesktopMessageRequest
(
    DesktopMessageType type,
    int? id = null,
    bool directoryOnly = false,
    string? basePath = null,
    string? title = null,
    bool multiselect = false
);

public record DesktopMessageResponse
(
    DesktopMessageType type,
    int id,
    bool directoryOnly = true,
    string[]? values = null
);

public interface IDesktopInvoker
{
    public Task<DesktopFetchResponse> Fetch(string url, DesktopFetchRequestInit? requestInit);
    public Task<DesktopMessageResponse?> SendMessage(DesktopMessageRequest request);
}
