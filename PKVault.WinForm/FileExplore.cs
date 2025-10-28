
public struct FileExploreRequest
{
    public string type { get; set; } //'file-explore';
    public int id { get; set; }
    public bool directoryOnly { get; set; }
    public string basePath { get; set; }
    public string title { get; set; }
    public bool multiselect { get; set; }
}

public struct FileExploreResponse
{
    public required string type { get; set; } //'file-explore';
    public required int id { get; set; }
    public required bool directoryOnly { get; set; }
    public required string[] values { get; set; }
}
