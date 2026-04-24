using Microsoft.Extensions.Logging;
using Serilog;
using Serilog.Extensions.Logging;

public class LoggerUtils
{
    public static ILogger<T> GetLogger<T>()
    {
        return new TestLogger<T>();
    }
    
    public static Microsoft.Extensions.Logging.ILogger GetLogger()
    {
        return GetLogger<object>();
    }
}

public class TestLogger<T> : ILogger<T>
{
    private readonly Microsoft.Extensions.Logging.ILogger logger = new SerilogLoggerProvider(
        new LoggerConfiguration().WriteTo.Console().CreateLogger()
    ).CreateLogger("test");

    public IDisposable? BeginScope<TState>(TState state) where TState : notnull
    {
        return logger.BeginScope(state);
    }

    public bool IsEnabled(LogLevel logLevel)
    {
        return logger.IsEnabled(logLevel);
    }

    public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter)
    {
        logger.Log(logLevel, eventId, state, exception, formatter);
    }
}
