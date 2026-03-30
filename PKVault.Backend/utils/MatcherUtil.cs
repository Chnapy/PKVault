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
            .Select(glob => glob.Trim()).ToList()
            .FindAll(glob => glob.Length > 0)];

        if (globs.Count == 0)
        {
            return [];
        }

        var testFiles = GetAllPaths == null
            ? []
            : GetAllPaths().Select(NormalizePath);

        // network globs on Windows, ex: "\\192.168.1.8\data"
        var networkGlobs = globs.FindAll(glob => glob.StartsWith(@"\\") && !glob.Contains('*'));

        // starts with / or \ or x:
        static bool isAbsolute(string glob) => glob.Length > 0 && (glob[0] == '/' || glob[0] == '\\' || (glob.Length > 2 && glob[1] == ':'));

        var absoluteGlobs = globs.FindAll(isAbsolute).FindAll(glob => glob.Length <= 1 || glob[1] != ':');
        var driveGlobs = globs.FindAll(isAbsolute).FindAll(glob => glob.Length > 1 && glob[1] == ':');
        var relativeGlobs = globs.FindAll(glob => !isAbsolute(glob));

        var absoluteMatcher = new Matcher();
        absoluteGlobs.ToList().ForEach(glob => absoluteMatcher.AddInclude(glob));
        DirectoryInfoBase absoluteDirectoryInfo = GetAllPaths == null || absoluteGlobs.Count == 0
            ? new DirectoryInfoWrapper(new DirectoryInfo("/"))
            : new InMemoryDirectoryInfo("/", testFiles);
        var absoluteMatches = absoluteMatcher.Execute(absoluteDirectoryInfo);
        var absoluteResults = absoluteMatches.Files.Select(file => Path.Combine("/", file.Path));

        // Console.WriteLine($"ABSOLUTE:\n{string.Join('\n', absoluteGlobs)}---Results:\n{string.Join('\n', absoluteResults)}");

        var driveLetters = driveGlobs.Select(glob => glob.ToUpper()[0]).Distinct().ToList();
        var driveResults = driveLetters.SelectMany(drive =>
        {
            var matcher = new Matcher();
            var filteredDriveGlobs = driveGlobs.ToList()
                .FindAll(glob => glob.StartsWith(drive));
            filteredDriveGlobs.ForEach(glob => matcher.AddInclude(glob[3..]));
            var prefix = $"{drive}:/";
            DirectoryInfoBase directoryInfo = GetAllPaths == null || filteredDriveGlobs.Count == 0
                ? new DirectoryInfoWrapper(new DirectoryInfo(prefix))
                : new InMemoryDirectoryInfo(prefix, testFiles.Select(f => f[3..]).Where(f => f.Length > 0));
            var matches = matcher.Execute(directoryInfo);
            var results = matches.Files.Select(file => Path.Combine(prefix, file.Path));

            return results;
        });

        var relativeMatcher = new Matcher();
        relativeGlobs.ToList().ForEach(glob => relativeMatcher.AddInclude(glob));
        DirectoryInfoBase relativeDirectoryInfo = GetAllPaths == null || relativeGlobs.Count == 0
            ? new DirectoryInfoWrapper(new DirectoryInfo(SettingsService.GetAppDirectory()))
            : new InMemoryDirectoryInfo(SettingsService.GetAppDirectory(), testFiles);
        var relativeMatches = relativeMatcher.Execute(relativeDirectoryInfo);
        var relativeResults = relativeMatches.Files.Select(file => Path.Combine(".", file.Path));

        string[] results = [.. absoluteResults, .. driveResults, .. relativeResults, .. networkGlobs];

        return [.. results.Select(NormalizePath)];
    }

    public static string NormalizePath(string path) => path
        .Replace('\\', '/')
        .Replace("//", @"\\")
        .Replace("/./", "/");
}
