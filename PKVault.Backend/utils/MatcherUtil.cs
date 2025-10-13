
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

        // starts with / or \
        static bool isAbsolute(string glob) => glob.Length > 0 && (glob[0] == '/' || glob[0] == '\\');

        var absoluteGlobs = globs.ToList().FindAll(isAbsolute);
        var relativeGlobs = globs.ToList().FindAll(glob => !isAbsolute(glob));

        var absoluteMatcher = new Matcher();
        absoluteGlobs.ToList().ForEach(glob => absoluteMatcher.AddInclude(glob));
        var absoluteMatches = absoluteMatcher.Execute(new DirectoryInfoWrapper(new DirectoryInfo("/")));
        var absoluteResults = absoluteMatches.Files.Select(file => Path.Combine("/", file.Path));

        // Console.WriteLine($"ABSOLUTE:\n{string.Join('\n', absoluteGlobs)}---Results:\n{string.Join('\n', absoluteResults)}");

        var relativeMatcher = new Matcher();
        relativeGlobs.ToList().ForEach(glob => relativeMatcher.AddInclude(glob));
        var relativeMatches = relativeMatcher.Execute(new DirectoryInfoWrapper(new DirectoryInfo(".")));
        var relativeResults = relativeMatches.Files.Select(file => Path.Combine(".", file.Path));

        string[] results = [.. absoluteResults, .. relativeResults];

        return [.. results.Select(path => path.Replace('\\', '/'))];
    }
}
