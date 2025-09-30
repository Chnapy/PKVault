namespace PKVault.Backend;

public class Startup
{
    public void Configure(IApplicationBuilder app)
    {
        Console.WriteLine($"LocalWebServer Startup - Configure app builder");

        Program.ConfigureAppBuilder(app, true);
    }

    public void ConfigureServices(IServiceCollection services)
    {
        Console.WriteLine($"LocalWebServer Startup - Configure services");

        Program.ConfigureServices(services);
    }
}
