public class PathUtils
{
    public static string GetExpectedAppDirectory()
    {
        var exePath = System.Diagnostics.Process.GetCurrentProcess().MainModule?.FileName;
        return Path.GetDirectoryName(exePath)!;
    }
}
