
public record DesktopRequestMessage
(
    string type
);

public record FileExploreRequestMessage
(
    string type, //'file-explore'
    int id,
    bool directoryOnly,
    string basePath,
    string title,
    bool multiselect
)
{
    public const string TYPE = "file-explore";
}

public record FileExploreResponseMessage
(
    string type, //'file-explore';
    int id,
    bool directoryOnly,
    string[] values
)
{
    public const string TYPE = "file-explore";
};

public record OpenFolderRequestMessage
(
    string type, //'open-folder'
    string id,
    string path,
    bool isDirectory
)
{
    public const string TYPE = "open-folder";
}

public record OpenFolderResponseMessage
(
    string type, //'open-folder';
    string id
)
{
    public const string TYPE = "open-folder";
};
