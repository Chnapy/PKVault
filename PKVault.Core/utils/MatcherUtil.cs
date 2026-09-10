using Microsoft.Extensions.FileSystemGlobbing;
using Microsoft.Extensions.FileSystemGlobbing.Abstractions;

namespace PKVault.Core;

// TODO complete refacto for testability
public class MatcherUtil
{
    public Func<string[]>? GetAllPaths = null;

    public List<string> SearchPaths(string?[] globsNullable)
    {
        List<string> globs = [.. globsNullable
            .OfType<string>()
            .Select(glob => glob.Trim())
            .Where(glob => glob.Length > 0 && glob[0] != '!')
        ];

        if (globs.Count == 0)
        {
            return [];
        }

        List<string> excludeGlobs = [.. globsNullable
            .OfType<string>()
            .Select(glob => glob.Trim())
            .Where(glob => glob.Length > 0 && glob[0] == '!')];

        // network globs on Windows, ex: "\\192.168.1.8\data"
        var networkGlobs = globs.FindAll(glob => glob.StartsWith(@"\\") && !glob.Contains('*'));

        var absoluteGlobs = globs.FindAll(IsAbsolute).FindAll(glob => glob.Length <= 1 || glob[1] != ':');
        var absoluteMatches = ExecuteMatcher(absoluteGlobs, excludeGlobs, "/");
        var absoluteResults = absoluteMatches.Select(path => Path.Combine("/", path));

        var driveGlobs = globs.FindAll(IsAbsolute).FindAll(glob => glob.Length > 1 && glob[1] == ':');
        var driveLetters = driveGlobs.Select(glob => glob.ToUpper()[0]).Distinct();
        var driveResults = driveLetters.SelectMany(drive =>
        {
            var filteredDriveGlobs = driveGlobs
                .Where(glob => glob.StartsWith(drive));

            var prefix = $"{drive}:/";

            var matches = ExecuteMatcher(filteredDriveGlobs, excludeGlobs, prefix);
            var results = matches.Select(path => path.StartsWith(NormalizePath(Directory.GetCurrentDirectory()))
                ? path
                : NormalizePath(Path.Combine(prefix, path)));

            return results;
        });

        var relativeGlobs = globs.FindAll(glob => !IsAbsolute(glob));
        var relativeMatches = ExecuteMatcher(relativeGlobs, excludeGlobs,
            Directory.GetCurrentDirectory().TrimEnd(['/', '\\']) + '/'
        );
        var relativeResults = relativeMatches.Select(path => path.StartsWith(NormalizePath(Directory.GetCurrentDirectory()))
            ? path
            : NormalizePath(Path.Combine(".", path)));

        string[] results = [.. absoluteResults, .. driveResults, .. relativeResults, .. networkGlobs];
        return results
            .Select(NormalizePath)
            .Select(path => path.StartsWith(NormalizePath(Directory.GetCurrentDirectory()))
                ? NormalizePath(Path.Combine(".", path[(Directory.GetCurrentDirectory().Length + 1)..]))
                : path)
            .ToList();
    }

    private string[] ExecuteMatcher(IEnumerable<string> globs, IEnumerable<string> excludeGlobs, string rootDir)
    {
        if (!globs.Any() && !excludeGlobs.Any())
            return [];

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

        excludeGlobs = excludeGlobs
            .Select(glob => glob[0] == '!' ? glob[1..] : glob)
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

        var matcher = new Matcher();

        foreach (var glob in globs)
        {
            matcher.AddInclude(glob);
        }

        foreach (var glob in excludeGlobs)
        {
            matcher.AddExclude(glob);
        }

        var directoryInfo = GetMatcherDirectory(rootDir);

        var matches = matcher.Execute(directoryInfo);
        return [.. matches.Files.Select(file => NormalizePath(file.Path))];
    }

    private DirectoryInfoBase GetMatcherDirectory(string rootDir)
    {
        if (GetAllPaths != null)
        {
            var testFiles = GetAllPaths()
                .Select(NormalizePath)
                .Select(glob =>
                {
                    if (IsAbsolute(rootDir) && glob.StartsWith(rootDir) && glob.Length > rootDir.Length)
                    {
                        return NormalizePath(Path.Combine(".", glob[rootDir.Length..]));
                    }

                    return glob;
                })
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
