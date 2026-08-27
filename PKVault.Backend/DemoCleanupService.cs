using Serilog;

public class DemoCleanupService(ISessionService sessionService) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        Log.Logger.Information("Demo cleanup background service started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);

                Log.Logger.Information("Demo cleanup background run action.");
                await RunAction(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                Log.Logger.Error(ex, "Demo cleanup background service error (non-blocking).");
            }
        }

        Log.Logger.Information("Demo cleanup background service stopped.");
    }

    private async Task RunAction(CancellationToken ct)
    {
        if (!sessionService.HasEmptyActionList())
            await sessionService.StartNewSession(false, null);
    }
}
