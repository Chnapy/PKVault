using Serilog;
using Serilog.Events;
using Serilog.Core;
using Serilog.Context;
using System.Diagnostics;


public class LogUtil
{
    public static readonly LogLevel DBLogLevel = LogLevel.Warning;

    public static void Initialize()
    {
        var logDirectoryPath = Path.Combine(SettingsService.GetAppDirectory(), "logs");
        var logFilepath = Path.Combine(logDirectoryPath, $"pkvault-.log");

        Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Debug()
            .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
            .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
            // .MinimumLevel.Override("Microsoft.AspNetCore.Mvc", LogEventLevel.Warning)
            .Enrich.FromLogContext()
            // .Enrich.WithMachineName()
            // .Enrich.WithThreadId()
            // .Enrich.WithThreadName()
            .WriteTo.Console(
                restrictedToMinimumLevel: LogEventLevel.Verbose
                // outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}"
            )
            .WriteTo.File(logFilepath,
                rollingInterval: RollingInterval.Day,
                rollOnFileSizeLimit: true,
                retainedFileCountLimit: 10,
                fileSizeLimitBytes: 10_485_760, // 10MB
                flushToDiskInterval: TimeSpan.FromSeconds(5)
                // outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}"
            )
            .CreateLogger();
    }

    public static void Dispose()
    {
        Log.Logger.Information("Log file gracefully disposed.");
        Log.CloseAndFlush();
    }
}

public static class LoggerExtension
{
    [MessageTemplateFormatMethod("messageTemplate")]
    public static IDisposable Time(this Serilog.ILogger logger, string messageTemplate, params object[] args)
    {
        return new Operation(
            log: (logLevel, message, args) => logger.Write((LogEventLevel)logLevel, message, args),
            messageTemplate, 
            args, 
            LogLevel.Information
        ).Begin();
    }
    
    [MessageTemplateFormatMethod("messageTemplate")]
    public static IDisposable Time(this Microsoft.Extensions.Logging.ILogger logger, string messageTemplate, params object[] args)
    {
        return new Operation(
            log: (logLevel, message, args) => logger.Log(logLevel, message, args),
            messageTemplate, 
            args, 
            LogLevel.Information
        ).Begin();
    }
}

public class Operation(
    Action<LogLevel, string, object[]> log,
     string messageTemplate, object[] args,
    LogLevel completionLevel, TimeSpan? warningThreshold = null
) : IDisposable
{
    private static readonly string stopwatchEmoji = char.ConvertFromUtf32(0x23F1) + char.ConvertFromUtf32(0xFE0F) + " ";
    public static string GetBeginMessage(string messageTemplate) => $"{stopwatchEmoji} {messageTemplate} {{{"started"}}}";
    public static string GetEndMessage(string messageTemplate) => $"{stopwatchEmoji} {messageTemplate}";

    public enum Properties
    {
        Elapsed,
        Outcome,
        OperationId
    };

    const string OutcomeCompleted = "completed";
    static readonly double StopwatchToTimeSpanTicks = (double)Stopwatch.Frequency / TimeSpan.TicksPerSecond;

    readonly long start = GetTimestamp();
    long? _stop;

    readonly IDisposable _popContext = LogContext.PushProperty(nameof(Properties.OperationId), Guid.NewGuid());

    static long GetTimestamp()
    {
        return unchecked((long)(Stopwatch.GetTimestamp() / StopwatchToTimeSpanTicks));
    }

    public TimeSpan Elapsed
    {
        get
        {
            var stop = _stop ?? GetTimestamp();
            var elapsedTicks = stop - start;

            if (elapsedTicks < 0)
            {
                return TimeSpan.Zero;
            }

            return TimeSpan.FromTicks(elapsedTicks);
        }
    }

    public Operation Begin()
    {
        log(
            completionLevel,
            GetBeginMessage(messageTemplate), 
            args
        );
        return this;
    }

    public void Dispose()
    {
        Write(completionLevel);

        PopLogContext();
    }

    void StopTiming()
    {
        _stop ??= GetTimestamp();
    }

    void PopLogContext()
    {
        _popContext.Dispose();
    }

    void Write(LogLevel level)
    {
        var outcome = OutcomeCompleted;
        StopTiming();

        var elapsed = Elapsed.TotalMilliseconds;

        level = elapsed > warningThreshold?.TotalMilliseconds && level < LogLevel.Warning
            ? LogLevel.Warning
            : level;

        log(
            level,
            $"{GetEndMessage(messageTemplate)} {{{nameof(Properties.Outcome)}}} in {{{nameof(Properties.Elapsed)}:0.0}} ms", 
            [.. args, outcome, elapsed]
        );

        PopLogContext();
    }
}
