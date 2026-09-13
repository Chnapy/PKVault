using Microsoft.Extensions.FileSystemGlobbing;
using Microsoft.Extensions.FileSystemGlobbing.Abstractions;

namespace PKVault.Core;

// TODO complete refacto for testability
public class MatcherUtil
{
    public Func<string, string[], string[]?> GetAllPaths = (rootDir, globs) => null;

    public List<string> SearchPaths(string?[] globsNullable)
    {
        List<string> globs = [.. globsNullable
            .OfType<string>()
            .Select(glob => NormalizePath(glob.Trim()))
            .Where(glob => glob.Length > 0 && glob[0] != '!')
            .Select(glob => glob.StartsWith(NormalizePath(Directory.GetCurrentDirectory()))
                ? NormalizePath(Path.Combine(".", glob[(Directory.GetCurrentDirectory().Length + 1)..]))
                : glob)
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

        var relativeGlobs = globs
            .Where(glob => !driveGlobs.Contains(glob))
            .Select(glob =>
            {
                if (!IsAbsolute(glob))
                    return (Base: NormalizePath(Directory.GetCurrentDirectory()), RelativeGlob: glob);

                var globParts = glob.Split('/');
                var baseStr = "/";
                for (var i = 0; i < globParts.Length - 1; i++)
                {
                    var part = globParts[i];
                    if (part.Contains('*'))
                        break;

                    baseStr = Path.Combine(baseStr, part);
                }
                baseStr = NormalizePath(baseStr);
                glob = glob[(baseStr.Length + 1)..];

                return (Base: baseStr, RelativeGlob: glob);
            })
            .GroupBy(e => e.Base);

        var relativeResults = relativeGlobs.SelectMany(globsGroup =>
        {
            var globBase = globsGroup.First().Base;
            var globs = globsGroup.Select(g => g.RelativeGlob);

            var relativeMatches = ExecuteMatcher(globs, excludeGlobs,
                globBase.TrimEnd(['/', '\\']) + '/'
            );

            return relativeMatches.Select(path => path.StartsWith(globBase)
                ? path
                : NormalizePath(Path.Combine(
                    globBase == NormalizePath(Directory.GetCurrentDirectory())
                        ? "."
                        : globBase,
                    path
                )));
        });

        string[] results = [.. driveResults, .. relativeResults, .. networkGlobs];
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

        var directoryInfo = GetMatcherDirectory(rootDir, globs.ToArray());

        var matches = matcher.Execute(directoryInfo);
        return [.. matches.Files.Select(file => NormalizePath(file.Path))];
    }

    private DirectoryInfoBase GetMatcherDirectory(string rootDir, string[] globs)
    {
        var testFiles = GetAllPaths(rootDir, globs)?
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

        if (testFiles != null)
            return new InMemoryDirectoryInfo(rootDir, testFiles);

        return new DirectoryInfoWrapper(new DirectoryInfo(rootDir));
    }

    // starts with / or \ or x:
    private static bool IsAbsolute(string glob) => glob.Length > 0 && (glob[0] == '/' || glob[0] == '\\' || (glob.Length > 2 && glob[1] == ':'));

    public static string NormalizePath(string path) => path
        .Replace('\\', '/')
        .Replace("//", @"\\")
        .Replace("/./", "/");
}
