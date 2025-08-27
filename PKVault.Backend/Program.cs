using System.Net;
using System.Net.Sockets;
using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.Mvc.ApplicationModels;

namespace PKVault.Backend;

public class Program
{
    public static async Task Main(string[] _)
    {
        await SetupData();
        var app = PrepareWebApp(5000);
        await app.RunAsync();
    }

    public static async Task SetupData()
    {
        // TestService.Test();

        // BackupService.CreateBackup();

        // LocalSaveService.ReadLocalSaves(null);

        // var pkm = new DataFileLoader().loaders.getSaveLoaders(3809447156).Pkms.GetDto("G30366F877008013 18 15 30 25 2500").Pkm;

        var initialMemoryUsedMB = System.Diagnostics.Process.GetCurrentProcess().WorkingSet64 / 1_000_000;

        await LocalSaveService.PrepareTimerAndRun();

        // Console.WriteLine($"Save loaded by ID:\n{string.Join('\n', LocalSaveService.SaveById.Keys)}");
        // Console.WriteLine($"Save loaded by path:\n{string.Join('\n', LocalSaveService.SaveByPath.Keys)}");

        // if (1 == 1)
        // {
        //     return;
        // }

        await StorageService.Initialize();

        // StorageService.CleanMainStorageFiles();

        var setupedMemoryUsedMB = System.Diagnostics.Process.GetCurrentProcess().WorkingSet64 / 1_000_000;

        Console.WriteLine($"Memory checks: initial={initialMemoryUsedMB} MB setuped={setupedMemoryUsedMB} MB diff={setupedMemoryUsedMB - initialMemoryUsedMB} MB");

        // var saveId = 3809447156;
        // var pkmId = "G30366F877008013 18 15 30 25 2500";

        // await StorageService.EvolvePkm(saveId, pkmId);

        // var name = "gorebyss";

        // var mainBoxes = StorageService.GetMainBoxes();
        // var mainPkms = StorageService.GetMainPkms();
        // var mainPkmVersions = StorageService.GetMainPkmVersions();
        // var xdBoxes = StorageService.GetSaveBoxes(3344585478);
        // var xdPkms = StorageService.GetSavePkms(3344585478);

        // Console.WriteLine($"Done");
        // Console.WriteLine($"Main - Boxes={mainBoxes.Count} Pkms={mainPkms.Count} PkmVersions={mainPkmVersions.Count}");
        // Console.WriteLine($"PkmXD - Boxes={xdBoxes.Count} Pkms={xdPkms.Count}");

        // if (1 == 1)
        // {
        //     return;
        // }

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
