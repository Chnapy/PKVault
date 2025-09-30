
using Microsoft.Extensions.FileSystemGlobbing;
using Microsoft.Extensions.FileSystemGlobbing.Abstractions;

public class MatcherUtil
{
    public static List<string> SearchPaths(string[] globs)
    {
        if (globs.Length == 0)
        {
            return [];
        }

        var isAbsolute = globs[0][0] == '/';
        var rootDir = isAbsolute ? "/" : ".";

        var matcher = new Matcher();
        globs.ToList().ForEach(glob => matcher.AddInclude(glob));
        var matches = matcher.Execute(new DirectoryInfoWrapper(new DirectoryInfo(rootDir)));

        return [.. matches.Files.Select(file => Path.Combine(rootDir, file.Path))];
    }
}
