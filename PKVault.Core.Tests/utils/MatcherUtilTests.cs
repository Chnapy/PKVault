using System.IO.Abstractions.TestingHelpers;
using PKVault.Core;

public class MatcherUtilTests
{
    private readonly MockFileSystem mockFileSystem;

    public MatcherUtilTests()
    {
        Program.Initialize();

        mockFileSystem = new(new Dictionary<string, MockFileData>(), Directory.GetCurrentDirectory());
    }

    [Fact]
    public void CurrentDirectoryIsAppDirectory()
    {
        Assert.Equal(
            SettingsService.AppDirectory,
            Directory.GetCurrentDirectory()
        );
    }

    [Fact]
    public async Task MockFileSystemExpectedContent()
    {
        mockFileSystem.AddFile("./foobar", "content");
        // should be no-op
        mockFileSystem.AddFile(Path.Combine(PathUtils.GetExpectedAppDirectory(), "./foobar"), "content");

        Assert.Single(
            // [
            //     "C:\\Users\\chnapy\\Projects\\pkvault\\PKVault.Core.Tests\\bin\\Debug\\net10.0\\foobar",

            // ],
            mockFileSystem.AllFiles
        );

        // OS-variable
        // Assert.Equal(
        //     // [
        //     //     "C:\\",
        //     //     "C:\\Users",
        //     //     "C:\\Users\\chnapy",
        //     //     "C:\\Users\\chnapy\\Projects",
        //     //     "C:\\Users\\chnapy\\Projects\\pkvault",
        //     //     "C:\\Users\\chnapy\\Projects\\pkvault\\PKVault.Core.Tests",
        //     //     "C:\\Users\\chnapy\\Projects\\pkvault\\PKVault.Core.Tests\\bin",
        //     //     "C:\\Users\\chnapy\\Projects\\pkvault\\PKVault.Core.Tests\\bin\\Debug",
        //     //     "C:\\Users\\chnapy\\Projects\\pkvault\\PKVault.Core.Tests\\bin\\Debug\\net10.0",
        //     //     "C:\\temp",
        //     //     "C:\\Users\\chnapy\\Projects\\pkvault\\PKVault.Core.Tests\\bin\\Debug\\net10.0\\foobar",
        //     // ],
        //     11,
        //     mockFileSystem.AllPaths.Count()
        // );

        // OS-variable
        // Assert.Equal(
        //     // [
        //     //     "C:\\temp",
        //     //     "C:\\Users\\chnapy\\Projects\\pkvault\\PKVault.Core.Tests\\bin\\Debug\\net10.0\\foobar",
        //     // ],
        //     2,
        //     mockFileSystem.AllNodes.Count()
        // );
    }

    [Fact]
    public async Task MatcherSearchResults()
    {
        var matcher = new MatcherUtil
        {
            GetAllPaths = (rootDir, globs) => [.. mockFileSystem.AllFiles]
        };

        Assert.Equal(
            [],
            matcher.SearchPaths(["folder/*.zip"])
        );

        mockFileSystem.AddFile("./folder/foobar.zip", "content");
        mockFileSystem.AddFile("./folder/toto.zip", "content");
        mockFileSystem.AddFile("/storage/emulated/0/save.srm", "content");

        Assert.Equal(3, matcher.GetAllPaths("", []).Length);

        Assert.Equal(
            [
                "./folder/foobar.zip",
                "./folder/toto.zip"
            ],
            matcher.SearchPaths(["folder/*.zip"])
        );

        Assert.Equal(
            [
                "./folder/foobar.zip",
                "./folder/toto.zip"
            ],
            matcher.SearchPaths([
                Path.Combine(Directory.GetCurrentDirectory(), "folder/*.zip")
            ])
        );

        Assert.Equal(
            [
                "./folder/foobar.zip",
                "./folder/toto.zip"
            ],
            matcher.SearchPaths([
                MatcherUtil.NormalizePath(Path.Combine(Directory.GetCurrentDirectory(), "folder/*.zip"))
            ])
        );

        Assert.Equal(
            [
                "./folder/toto.zip"
            ],
            matcher.SearchPaths(["folder/toto.zip"])
        );

        Assert.Equal(
            [
                "./folder/toto.zip"
            ],
            matcher.SearchPaths([
                Path.Combine(Directory.GetCurrentDirectory(), "folder/toto.zip")
            ])
        );

        Assert.Equal(
            [
                "/storage/emulated/0/save.srm"
            ],
            matcher.SearchPaths([
                "/storage/emulated/0/*.srm"
            ])
        );

    }
}
