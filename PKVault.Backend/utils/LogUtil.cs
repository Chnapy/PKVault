
using System.Diagnostics;

public class LogUtil
{
    private static readonly string stopwatchEmoji = char.ConvertFromUtf32(0x23F1) + char.ConvertFromUtf32(0xFE0F) + " ";

    public static void Initialize()
    {
        Console.OutputEncoding = System.Text.Encoding.UTF8;
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
            Console.Write(sw.Elapsed);
            Console.ResetColor();
            Console.WriteLine();

            return sw.ElapsedMilliseconds;
        };
    }
}
