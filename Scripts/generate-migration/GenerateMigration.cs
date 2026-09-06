
using System.Diagnostics;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Serilog;

public partial class GenerateMigration
{
    public static async Task GenerateTrimmedCompatibleMigration(string filename)
    {
        Log.Information($"Create migration with filename={filename}");

        ArgumentException.ThrowIfNullOrWhiteSpace(filename);

        var psi = new ProcessStartInfo
        {
            FileName = "dotnet",
            Arguments = $"ef migrations add {filename} --json",
            WorkingDirectory = "../PKVault.Core",
            RedirectStandardError = true,
            RedirectStandardOutput = true,
        };

        using var proc = Process.Start(psi)!;
        await proc.WaitForExitAsync();

        var error = await proc.StandardError.ReadToEndAsync();
        var output = await proc.StandardOutput.ReadToEndAsync();

        Log.Debug($"stderr: {error}");
        Log.Debug($"stdout: {output}");
        Console.WriteLine();

        if (proc.ExitCode > 0) {
            Environment.Exit(proc.ExitCode);
        }

        var jsonTxt = string.Join('\n', output.Split('\n')
            .Where(line => line.Trim().Length > 0)
            .TakeLast(5)
        );

        var json = JsonSerializer.Deserialize<Dictionary<string, string>>(jsonTxt)!;

        if (!json.TryGetValue("migrationFile", out var migrationFilePath))
            throw new Exception("no migrationFilePath found");

        var migrationContent = await File.ReadAllTextAsync(migrationFilePath, Encoding.UTF8);

        var migrationContentFixed = string.Join('\n',
            migrationContent.Split('\n')
                .Select(WithName)
        );

        await File.WriteAllTextAsync(migrationFilePath, migrationContentFixed, Encoding.UTF8);

        Log.Debug($"migrationContentFixed: {migrationContentFixed}");
    }
    
    public static string WithName(string line)
    {
        var match = Pattern().Match(line);

        if (match.Length == 0) {
            return line;
        }

        var columnName = match.Groups[ 1 ].Value.Trim();   // ex: "Id"
        var parameters = match.Groups[ 2 ].Value.Trim();   // ex: "type: "...", nullable: false"

        if (
            columnName.Length == 0
            || parameters.Length == 0
            || parameters.Contains("name:")
        ) {
            return line;
        }

        if (!parameters.Contains("type:")) {
            throw new Exception($"Missing 'type:' with line:\n{line}");
        }

        return line.Replace("type:", $"name: \"{columnName}\", type:");
    }

    // Regex catching:
    // - column name ("ID" etc)
    // - parameters (type: "...", ...)
    [GeneratedRegex(@"^\s*(\w+)\s*=\s*table\.Column<.+>\(([^)]*)\),?\s*$")]
    private static partial Regex Pattern();
}
