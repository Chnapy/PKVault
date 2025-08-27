using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;

public class LocalWebServer
{
    public static readonly string HOST_URL = $"https://localhost:{PKVault.Backend.Program.GetAvailablePort()}";

    private readonly IHost? webHost;

    public LocalWebServer()
    {
        try
        {
            Console.WriteLine($"LocalWebServer build for {HOST_URL}");

            webHost = Host.CreateDefaultBuilder()
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseUrls(HOST_URL);
                    webBuilder.UseStartup<PKVault.Backend.Startup>();
                })
                .Build();
        }
        catch (Exception err)
        {
            Console.WriteLine(err);
        }
    }

    public void Start()
    {
        if (webHost == null) return;

        Console.WriteLine($"LocalWebServer start for {HOST_URL}");

        Task.Run(() => webHost.Run());

        // TODO
        PKVault.Backend.Program.SetupData();
    }

    public async Task Stop()
    {
        if (webHost == null) return;

        await webHost.StopAsync();
        webHost.Dispose();
    }
}
