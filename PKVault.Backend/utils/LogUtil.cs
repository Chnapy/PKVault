
using System.Diagnostics;

public class LogUtil
{
    public static readonly List<(string category, LogLevel level)> BuilderLoggingFilters = [
        ("Microsoft", LogLevel.Warning),
        ("Microsoft.AspNetCore", LogLevel.Warning),
        // ("Microsoft.AspNetCore.Mvc", LogLevel.Warning)
    ];
    public static readonly LogLevel DBLogLevel = LogLevel.Warning;

    private static readonly string stopwatchEmoji = char.ConvertFromUtf32(0x23F1) + char.ConvertFromUtf32(0xFE0F) + " ";
    private static StreamWriter? logWriter;

    public static void Initialize()
    {
        if (logWriter != null)
        {
            return;
        }

        Console.OutputEncoding = System.Text.Encoding.UTF8;

        var logDirectoryPath = Path.Combine(SettingsService.GetAppDirectory(), "logs");
        var logFilepath = Path.Combine(logDirectoryPath, $"pkvault-{BackupService.SerializeDateTime(DateTime.UtcNow)}.log");

        Directory.CreateDirectory(logDirectoryPath);

        logWriter = new StreamWriter(logFilepath, append: true)
        {
            AutoFlush = true
        };

        var consoleOut = Console.Out;
        var consoleErr = Console.Error;

        var dualOut = new DualWriter(consoleOut, logWriter);
        var dualErr = new DualWriter(consoleErr, logWriter);

        Console.SetOut(dualOut);
        Console.SetError(dualErr);
    }

    public static void Dispose()
    {
        Console.WriteLine("Log file gracefully disposed.");
        logWriter?.Dispose();
        logWriter = null;
    }

    public static LogTimeDisposable Time(string message)
    {
        return Time(message, (100, 500));
    }

    public static LogTimeDisposable Time(string message, (int warningMs, int errorMs) timings)
    {
        return new LogTimeDisposable($"{stopwatchEmoji} {message}", timings);
    }
}

public class LogTimeDisposable : IDisposable
{
    private readonly string message;
    private readonly (int warningMs, int errorMs) timings;

    public readonly Stopwatch sw;

    public LogTimeDisposable(string _message, (int warningMs, int errorMs) _timings)
    {
        message = _message;
        timings = _timings;

        Console.WriteLine($"{message} ...");

        sw = new();
        sw.Start();
    }

    public long Stop()
    {
        sw.Stop();

        Console.Write($"{message} done in ");

        if (sw.ElapsedMilliseconds > timings.errorMs)
        {
            Console.BackgroundColor = ConsoleColor.DarkRed;
        }
        else if (sw.ElapsedMilliseconds > timings.warningMs)
        {
            Console.BackgroundColor = ConsoleColor.DarkYellow;
        }
        else
        {
            Console.BackgroundColor = ConsoleColor.DarkGreen;
        }
        Console.Write(sw.Elapsed);
        Console.ResetColor();
        Console.WriteLine();

        return sw.ElapsedMilliseconds;
    }

    public void Dispose()
    {
        Stop();
        GC.SuppressFinalize(this);
    }
}
