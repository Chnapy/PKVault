
using System.Diagnostics;
using System.IO.Compression;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Serilog;

public class UpdatePKHeX
{
    record Release(
        int Id,
        string Tag_name, // "26.02.27"
        bool Draft,
        bool Prerelease,
        string Published_at,
        string Tarball_url,
        string Zipball_url
    );

    const string releaseListUrl = "https://api.github.com/repos/kwsch/PKHeX/releases";
    const string pkhexVersionFilepath = "../PKVault.Core/PKHeX.version";
    const string pkhexOutputPath = "../PKVault.Core";
    const string pkhexRepoFolder = "../tmp-pkhex";

    /**
     * Update PKHeX from latest release source code.
     */
    public static async Task Update()
    {
        var currentTag = File.Exists(pkhexVersionFilepath)
            ? File.ReadAllText(pkhexVersionFilepath).Trim()
            : "";

        Log.Information($"Current PKHeX tag: {currentTag}");

        using var client = new HttpClient();
        client.DefaultRequestHeaders.Add("User-Agent", "PKVault");
        using var res = await client.GetAsync(releaseListUrl);
        using var content = res.Content;
        if ((int)res.StatusCode >= 400)
            throw new Exception($"Error {res.StatusCode} {await content.ReadAsStringAsync()}");

        var releaseList = await content.ReadFromJsonAsync<Release[]>(new JsonSerializerOptions()
        {
            PropertyNameCaseInsensitive = true
        });

        var release = releaseList!
            .Where(r => !r.Draft && !r.Prerelease)
            .OrderByDescending(r => r.Published_at)
            .First();

        Log.Information($"Release PKHeX tag: {release.Tag_name}");

        if (release.Tag_name == currentTag)
        {
            Log.Information($"Already current tag, PKHeX update aborted.");
            return;
        }

        var sourcePath = await FetchAndExtractZipSource(release.Zipball_url);

        var pkhexCorePath = Path.Combine(sourcePath, "PKHeX.Core");

        var commandBase = "dotnet";
        var commandArgs = $"publish {pkhexCorePath} -o {pkhexOutputPath}";
        Console.WriteLine();
        Log.Debug($"{commandBase} {commandArgs}");

        var psi = new ProcessStartInfo
        {
            FileName = commandBase,
            Arguments = commandArgs,
            RedirectStandardError = true,
            RedirectStandardOutput = true,
        };

        using var proc = Process.Start(psi)!;
        await proc.WaitForExitAsync();

        var stderr = await proc.StandardError.ReadToEndAsync();
        var stdout = await proc.StandardOutput.ReadToEndAsync();

        Log.Debug($"stderr: {stderr}");
        Log.Debug($"stdout: {stdout}");
        Console.WriteLine();

        if (proc.ExitCode > 0) {
            Environment.Exit(proc.ExitCode);
        }

        File.WriteAllText(pkhexVersionFilepath, release.Tag_name);

        Directory.Delete(pkhexRepoFolder, true);
    }

    private static async Task<string> FetchAndExtractZipSource(string releaseZipUrl)
    {
        if (Directory.Exists(pkhexRepoFolder))
            Directory.Delete(pkhexRepoFolder, true);

        Log.Information("Fetching PKHeX compressed source");

        using var client = new HttpClient();
        client.DefaultRequestHeaders.Add("User-Agent", "PKVault");
        using var res = await client.GetAsync(releaseZipUrl);
        using var content = res.Content;
        if ((int)res.StatusCode >= 400)
            throw new Exception($"Error {res.StatusCode} {await content.ReadAsStringAsync()}");

        using var stream = content.ReadAsStream();

        Log.Information("Unzip PKHeX source");

        using var zip = await ZipArchive.CreateAsync(stream, ZipArchiveMode.Read, true, Encoding.UTF8);
        var firstEntry = zip.Entries.First();

        await zip.ExtractToDirectoryAsync(pkhexRepoFolder);

        return Path.Combine(pkhexRepoFolder, firstEntry.FullName);
    }
}
