using System.Net;
using System.Net.Sockets;
using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.Mvc.ApplicationModels;

namespace PKVault.Backend;

public class Program
{
    public static async Task Main(string[] args)
    {
        var setupDone = await SetupData(args);

        if (setupDone)
        {
            var app = PrepareWebApp(5000);
            await app.RunAsync();
        }
    }

    public static async Task<bool> SetupData(string[] args)
    {
        LogUtil.Initialize();

        if (args.Length > 0 && args[0] == "bench-pokeapi")
        {
            var logtimePkm = LogUtil.Time("Benchmark PokeApi perfs with 10.000 sequential calls pokemon");
            for (var species = 1; species < 10_000; species++)
            {
                await PokeApi.GetPokemon((species % 900) + 1);
            }
            // expected: ~10s
            var timePkm = (double)logtimePkm();
            Console.WriteLine($"Call pokemon av. time = {timePkm / 10_000}ms");
            return false;
        }

        if (args.Length > 0 && args[0] == "bench-save-pkm")
        {
            await LocalSaveService.ReadLocalSaves();
            await StorageService.ResetDataLoader();

            var logtimeSavePkmAll = LogUtil.Time("Benchmark Save Pkms (all) perfs with 10 sequential calls");
            List<PkmSaveDTO> savePkms = [];
            for (var i = 0; i < 10; i++)
            {
                savePkms = await StorageService.GetSavePkms(3809447156);
                // savePkms.ForEach(pkm => Console.WriteLine($"{pkm.Id} - {pkm.Box}/{pkm.BoxSlot}"));
            }
            // expected: ~0.5s
            logtimeSavePkmAll();
            Console.WriteLine($"count={savePkms.Count} last_id={savePkms.Last().Id}");

            var logtimeSavePkmGet = LogUtil.Time("Benchmark Save Pkms (get) perfs with 2000 sequential calls");
            for (var i = 0; i < 2000; i++)
            {
                var result = await StorageService.memoryLoader!.loaders.saveLoadersDict[3809447156].Pkms.GetDto("G30366FC1CF2B528 17 20 21 30 600")
                    ?? throw new Exception();
            }
            // expected: ~0s
            logtimeSavePkmGet();

            return false;
        }

#if DEBUG
        if (args.Length > 0 && args[0] == "gen-pokeapi")
        {
            GenApiData.GenerateFiles();
            return false;
        }
#endif

        var initialMemoryUsedMB = System.Diagnostics.Process.GetCurrentProcess().WorkingSet64 / 1_000_000;

        await LocalSaveService.PrepareTimerAndRun();

        await StorageService.ResetDataLoader();

        await WarningsService.CheckWarnings();

        var setupedMemoryUsedMB = System.Diagnostics.Process.GetCurrentProcess().WorkingSet64 / 1_000_000;

        Console.WriteLine($"Memory checks: initial={initialMemoryUsedMB} MB setuped={setupedMemoryUsedMB} MB diff={setupedMemoryUsedMB - initialMemoryUsedMB} MB");

        return true;
    }

    public static WebApplication PrepareWebApp(int port)
    {
        var builder = WebApplication.CreateBuilder([]);

        ConfigureServices(builder.Services);

        var certificate = SettingsService.AppSettings.HTTPS_CERT_PEM_PATH != default && SettingsService.AppSettings.HTTPS_KEY_PEM_PATH != default
            ? X509Certificate2.CreateFromPem(
                File.ReadAllText(SettingsService.AppSettings.HTTPS_CERT_PEM_PATH),
                File.ReadAllText(SettingsService.AppSettings.HTTPS_KEY_PEM_PATH)
                )
            : null;

        builder.WebHost.ConfigureKestrel(serverOptions =>
        {
            serverOptions.ListenAnyIP(port, listenOptions =>
            {
                if (certificate != default)
                {
                    listenOptions.UseHttps(certificate);
                }
                else if (SettingsService.AppSettings.HTTPS_NOCERT == true)
                {
                    listenOptions.UseHttps();
                }

            });
        });

        var app = builder.Build();

        ConfigureAppBuilder(app, certificate != default || SettingsService.AppSettings.HTTPS_NOCERT == true);

        return app;
    }

    public static void ConfigureServices(IServiceCollection services)
    {
        services.AddControllers(options =>
        {
            options.Conventions.Add(new RouteTokenTransformerConvention(new SlugifyParameterTransformer()));
        });

#if DEBUG
        services.AddEndpointsApiExplorer();
        services.AddSwaggerDocument(document =>
        {
            document.PostProcess = doc =>
            {
                doc.Info.Title = "PKVault API";
            };
        });
#endif
    }

    public static void ConfigureAppBuilder(IApplicationBuilder app, bool useHttps)
    {
        if (useHttps)
        {
            app.UseHttpsRedirection();
        }

        app.UseRouting();
        app.UseCors(policy => policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());

        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
        });

#if DEBUG
        app.UseOpenApi();
        app.UseSwaggerUi();
#endif
    }

    public static int GetAvailablePort()
    {
        var listener = new TcpListener(IPAddress.Loopback, 0);
        listener.Start(); // Demande au système d’attribuer un port libre

        int port = ((IPEndPoint)listener.LocalEndpoint).Port; // Récupère le port attribué

        listener.Stop(); // Libère le port

        return port;
    }
}
