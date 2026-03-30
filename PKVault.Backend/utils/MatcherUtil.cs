using Microsoft.Extensions.FileSystemGlobbing;
using Microsoft.Extensions.FileSystemGlobbing.Abstractions;

// TODO complete refacto for testability
// Remove static unsafe usage for tests
public class MatcherUtil
{
    public static Func<string[]>? GetAllPaths = null;

    public static List<string> SearchPaths(string?[] globsNullable)
    {
        List<string> globs = [.. globsNullable
            .OfType<string>()
            .Select(glob => glob.Trim())
            .Where(glob => glob.Length > 0)];

        if (globs.Count == 0)
        {
            return [];
        }

        // network globs on Windows, ex: "\\192.168.1.8\data"
        var networkGlobs = globs.FindAll(glob => glob.StartsWith(@"\\") && !glob.Contains('*'));

        var absoluteGlobs = globs.FindAll(IsAbsolute).FindAll(glob => glob.Length <= 1 || glob[1] != ':');
        var driveGlobs = globs.FindAll(IsAbsolute).FindAll(glob => glob.Length > 1 && glob[1] == ':');
        var relativeGlobs = globs.FindAll(glob => !IsAbsolute(glob));

        var absoluteMatches = ExecuteMatcher(absoluteGlobs, "/");
        var absoluteResults = absoluteMatches.Select(path => Path.Combine("/", path));

        var driveLetters = driveGlobs.Select(glob => glob.ToUpper()[0]).Distinct();
        var driveResults = driveLetters.SelectMany(drive =>
        {
            var filteredDriveGlobs = driveGlobs
                .Where(glob => glob.StartsWith(drive));

            var prefix = $"{drive}:/";

            var matches = ExecuteMatcher(filteredDriveGlobs, prefix);
            var results = matches.Select(path => Path.Combine(prefix, path));

            return results;
        });

        var relativeMatches = ExecuteMatcher(relativeGlobs, SettingsService.GetAppDirectory());
        var relativeResults = relativeMatches.Select(path => Path.Combine(".", path));

        string[] results = [.. absoluteResults, .. driveResults, .. relativeResults, .. networkGlobs];

        return [.. results.Select(NormalizePath)];
    }

    private static string[] ExecuteMatcher(IEnumerable<string> globs, string rootDir)
    {
        rootDir = NormalizePath(rootDir);

        globs = globs
            .Select(NormalizePath)
            .Select(glob =>
            {
                if (IsAbsolute(rootDir) && glob.StartsWith(rootDir))
                {
                    return glob[rootDir.Length..];
                }

                return glob;
            })
            .Where(glob => glob.Length > 0);

        if (!globs.Any())
        {
            return [];
        }

        var matcher = new Matcher();

        foreach (var glob in globs)
        {
            matcher.AddInclude(glob);
        }

        var directoryInfo = GetMatcherDirectory(rootDir);

        var matches = matcher.Execute(directoryInfo);
        return [.. matches.Files.Select(file => file.Path)];
    }

    private static DirectoryInfoBase GetMatcherDirectory(string rootDir)
    {
        if (GetAllPaths != null)
        {
            var testFiles = GetAllPaths()
                .Select(glob => glob[rootDir.Length..])
                .Where(glob => glob.Length > 0);

            return new InMemoryDirectoryInfo(rootDir, testFiles);
        }

        return new DirectoryInfoWrapper(new DirectoryInfo(rootDir));
    }

    // starts with / or \ or x:
    private static bool IsAbsolute(string glob) => glob.Length > 0 && (glob[0] == '/' || glob[0] == '\\' || (glob.Length > 2 && glob[1] == ':'));

    public static string NormalizePath(string path) => path
        .Replace('\\', '/')
        .Replace("//", @"\\")
        .Replace("/./", "/");
}
