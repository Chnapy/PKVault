
using Microsoft.Extensions.FileSystemGlobbing;
using Microsoft.Extensions.FileSystemGlobbing.Abstractions;

public class MatcherUtil
{
    public static List<string> SearchPaths(string?[] globsNullable)
    {
        List<string> globs = [.. globsNullable
            .OfType<string>()
            .Select(glob => glob.Trim()).ToList()
            .FindAll(glob => glob.Length > 0)];

        if (globs.Count == 0)
        {
            return [];
        }

        // starts with / or \ or x:
        static bool isAbsolute(string glob) => glob.Length > 0 && (glob[0] == '/' || glob[0] == '\\' || (glob.Length > 2 && glob[1] == ':'));

        var absoluteGlobs = globs.FindAll(isAbsolute).Select(glob => glob.Length > 2 && glob[1] == ':' ? glob[2..] : glob);
        var relativeGlobs = globs.FindAll(glob => !isAbsolute(glob));

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

        if (results.Length > 200)
        {
            throw new ArgumentException($"Too much results ({results.Length}) for given globs");
        }

        return [.. results.Select(path => path.Replace('\\', '/'))];
    }
}
