using System.Diagnostics;
using System.Text.Json;
using System.Text.RegularExpressions;

public class MigrationUtil
{
    /**
     * Add EF core migration file, edited to be compatible with PublishTrimmed.
     */
    public static async Task AddMigrationTrimmedCompatible(string filename)
    {
        Console.WriteLine($"Create migration with filename={filename}");

        ArgumentException.ThrowIfNullOrWhiteSpace(filename);

        var startInfo = new ProcessStartInfo
        {
            FileName = "dotnet",
            Arguments = $"ef migrations add {filename} --no-build --json",
            WorkingDirectory = ".",
            UseShellExecute = false,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            CreateNoWindow = true
        };

        // var cancelTokenSource = new CancellationTokenSource();
        // var cancelToken = cancelTokenSource.Token;

        using var process = Process.Start(startInfo);

        Console.CancelKeyPress += delegate (object? sender, ConsoleCancelEventArgs args)
        {
            Console.WriteLine("CANCEL command received! Cleaning up. please wait...");
            args.Cancel = true;
            // cancelTokenSource.Cancel();
            process?.Kill();
        };

        var output = await process.StandardOutput.ReadToEndAsync();
        var error = await process.StandardError.ReadToEndAsync();

        await process.WaitForExitAsync();

        Console.WriteLine($"Process output:\n{output}");

        if (!string.IsNullOrWhiteSpace(error))
        {
            Console.Error.WriteLine($"Process error:\n{error}");
        }

        if (process.ExitCode != 0)
        {
            throw new Exception(error);
        }

        var jsonTxt = string.Join('\n', output
            .Split('\n', StringSplitOptions.RemoveEmptyEntries)
            .TakeLast(5));

        var json = JsonSerializer.Deserialize<Dictionary<string, string>>(jsonTxt);
        json.TryGetValue("migrationFile", out var migrationFilePath);
        ArgumentNullException.ThrowIfNull(migrationFilePath);

        var migrationContent = await File.ReadAllTextAsync(migrationFilePath);

        var migrationContentFixed = string.Join('\n', migrationContent.Split('\n')
            .Select(WithName));

        await File.WriteAllTextAsync(migrationFilePath, migrationContentFixed);

        // Console.WriteLine($"migrationContentFixed: {migrationContentFixed}");
    }

    private static string WithName(string line)
    {
        // Regex catching:
        // - column name ("ID" etc)
        // - parameters (type: "...", ...)
        var pattern = @"^\s*(\w+)\s*=\s*table\.Column<.+>\(([^)]*)\),?\s*$";

        return Regex.Replace(line, pattern, match =>
        {
            var columnName = match.Groups[1].Value;   // ex: "Id"
            var parameters = match.Groups[2].Value;   // ex: "type: "...", nullable: false"

            if (
                string.IsNullOrWhiteSpace(columnName)
                || string.IsNullOrWhiteSpace(parameters)
                || parameters.Contains("name:")
            )
            {
                return line;
            }

            if (!parameters.Contains("type:"))
            {
                throw new Exception($"Missing 'type:' with line:\n{line}");
            }

            return line.Replace("type:", $"name: \"{columnName}\", type:");
        });
    }
}
