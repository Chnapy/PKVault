
using System.Diagnostics;

public class LogUtil
{
    private static readonly string stopwatchEmoji = char.ConvertFromUtf32(0x23F1) + char.ConvertFromUtf32(0xFE0F) + " ";

    private static StreamWriter? logWriter;

    public static void Initialize()
    {
        if (logWriter != null)
        {
            return;
        }

        Console.OutputEncoding = System.Text.Encoding.UTF8;

        Directory.CreateDirectory("logs");

        logWriter = new StreamWriter($"logs/pkvault-{BackupService.SerializeDateTime(DateTime.UtcNow)}.log", append: true)
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

    public static Func<long> Time(string message)
    {
        return Time(message, (100, 500));
    }

    public static Func<long> Time(string message, (int warningMs, int errorMs) timings)
    {
        var (warningMs, errorMs) = timings;

        Console.WriteLine($"{stopwatchEmoji} {message} ...");

        Stopwatch sw = new();
        sw.Start();

        return () =>
        {
            sw.Stop();

            Console.Write($"{stopwatchEmoji} {message} done in ");

            if (sw.ElapsedMilliseconds > errorMs)
            {
                Console.BackgroundColor = ConsoleColor.DarkRed;
            }
            else if (sw.ElapsedMilliseconds > warningMs)
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
        };
    }
}
