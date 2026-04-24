using Serilog;

namespace PKVault.Backend;

public class Startup
{
    public void Configure(IApplicationBuilder app)
    {
        Log.Logger.Information($"LocalWebServer Startup - Configure app builder");

        Program.ConfigureAppBuilder(app, false);
    }

    public void ConfigureServices(IServiceCollection services)
    {
        Log.Logger.Information($"LocalWebServer Startup - Configure services");

        Program.ConfigureServices(services);
    }
}
