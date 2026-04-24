using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Serilog;

public class LocalWebServer
{
    public static readonly string HOST_URL = $"http://localhost:{PKVault.Backend.Program.GetAvailablePort()}";

    private readonly IHost? webHost;

    public LocalWebServer()
    {
        try
        {
            Log.Logger.Information($"LocalWebServer build for {HOST_URL}");

            webHost = Host.CreateDefaultBuilder()
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder
                        .UseUrls(HOST_URL)
                        .UseStartup<PKVault.Backend.Startup>();
                })
                .Build();
        }
        catch (Exception err)
        {
            Log.Logger.Error(err, "");
        }
    }

    public async Task<Func<Task>?> Start(string[] args)
    {
        if (webHost == null) return null;

        Log.Logger.Information($"LocalWebServer start for {HOST_URL}");

        _ = Task.Run(() => webHost.Run());

        return await PKVault.Backend.Program.SetupData(webHost, args);
    }

    public async Task Stop()
    {
        if (webHost == null) return;

        await webHost.StopAsync();
        webHost.Dispose();
    }

    public bool HasEmptyActionList()
    {
        if (webHost == null) return true;

        return PKVault.Backend.Program.HasEmptyActionList(webHost);
    }
}
