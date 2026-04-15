using System.Runtime.InteropServices;

public class PathUtils
{
    public static string GetExpectedAppDirectory()
    {
        if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
        {
            return Environment.GetEnvironmentVariable("XDG_DATA_HOME")
                ?? Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments) ?? "~/", "pkvault");
        }

        var exePath = System.Diagnostics.Process.GetCurrentProcess().MainModule?.FileName;
        return Path.GetDirectoryName(exePath)!;
    }
}
