using Microsoft.Extensions.DependencyInjection;
using Serilog;

namespace PKVault.Core;

public class GenPokeApi
{
    public static async Task GeneratePokeAPIFiles()
    {
        Program.Initialize();

        var serviceCollection = new ServiceCollection();

        ConfigurePokeApiServices(serviceCollection);

        using var scope = serviceCollection.BuildServiceProvider().CreateScope();

        var genStaticDataService = scope.ServiceProvider.GetRequiredService<GenStaticDataService>();

        await genStaticDataService.GenerateFiles();

        Program.Dispose();
    }

    private static void ConfigurePokeApiServices(IServiceCollection services)
    {
        Program.ConfigureMinimalServices(services);

        Log.Information($"Setup services - Static data");
        services.AddSingleton<PokeApiService>();
        services.AddSingleton<GenStaticDataService>();
    }
}
