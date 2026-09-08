
public record DesktopRequestMessage
(
    string type, //'file-explore' | 'open-folder'
    int? id = null,
    bool directoryOnly = false,
    string? basePath = null,
    string? title = null,
    bool multiselect = false
)
{
    public const string FILE_EXPLORE_TYPE = "file-explore";
    public const string OPEN_FOLDER_TYPE = "open-folder";
};

public record DesktopResponseMessage
(
    string type, //'file-explore'
    int id,
    bool directoryOnly = false,
    string[]? values = null
);
