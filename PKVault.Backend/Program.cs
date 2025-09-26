using System.Net;
using System.Net.Sockets;
using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.Mvc.ApplicationModels;

namespace PKVault.Backend;

public class Program
{
    private static Task? SetupTask;

    public static async Task WaitForSetup()
    {
        SetupTask ??= Task.Run(async () =>
            {
                var staticDataTask = StaticDataService.PrepareStaticData();
                await LocalSaveService.ReadLocalSaves();
                await StorageService.ResetDataLoader();
                await WarningsService.CheckWarnings();
                await staticDataTask;
            });

        await SetupTask;
    }

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
        var initialMemoryUsedMB = System.Diagnostics.Process.GetCurrentProcess().WorkingSet64 / 1_000_000;

        LogUtil.Initialize();

        Console.WriteLine($"PKVault start, buildID = {SettingsService.AppSettings.BuildID}");

        if (args.Length > 0 && args[0] == "test-PB7")
        {
            await LocalSaveService.ReadLocalSaves();
            await StorageService.ResetDataLoader();
            // await StorageService.SaveMovePkmFromStorage(
            //     4106192122,
            //     "G700754A1E359E2 5 5 14 11 1200",
            //     3, 3
            // );
            var list = await StorageService.GetSavePkms(4106192122);
            var lastDto = list.Last();

            Console.WriteLine($"Id={lastDto.Id}\nPID={lastDto.PID}\nNickname={lastDto.Nickname}"
                + $"\nGender={lastDto.Gender}\nAV_ATK={lastDto.EVs[1]}\nAbility={lastDto.Ability}"
                + $"\nMoves.1={lastDto.Moves[0]}\nMoves.2={lastDto.Moves[1]}\nMoves.3={lastDto.Moves[2]}\nMoves.4={lastDto.Moves[3]}"
                + $"\nBall={lastDto.Ball}"
            );
            Console.WriteLine(lastDto.ValidityReport);

            return false;
        }

        if (args.Length > 0 && args[0] == "bench-pokeapi")
        {
            var logtimePkm = LogUtil.Time("Benchmark PokeApi perfs with 10.000 sequential calls pokemon", (10_500, 11_500));
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

            var logtimeSavePkmAll = LogUtil.Time("Benchmark Save Pkms (all) perfs with 10 sequential calls", (550, 800));
            // List<PkmSaveDTO> savePkms = [];
            for (var i = 0; i < 10; i++)
            {
                await StorageService.GetSavePkms(3809447156);
                // savePkms.ForEach(pkm => Console.WriteLine($"{pkm.Id} - {pkm.Box}/{pkm.BoxSlot}"));
            }
            // expected: ~0.5s
            logtimeSavePkmAll();
            // Console.WriteLine($"count={savePkms.Count} last_id={savePkms.Last().Id}");

            var logtimeSavePkmGet = LogUtil.Time("Benchmark Save Pkms (get) perfs with 2000 sequential calls", (10, 30));
            for (var i = 0; i < 2000; i++)
            {
                var result = await (await StorageService.GetLoader()).loaders.saveLoadersDict[3809447156].Pkms.GetDto("G30366FC1CF2B528 17 20 21 30 600")
                    ?? throw new Exception();
            }
            // expected: ~0.001s
            logtimeSavePkmGet();

            // diff=110

            var setupedMemoryUsedMB1 = System.Diagnostics.Process.GetCurrentProcess().WorkingSet64 / 1_000_000;

            Console.WriteLine($"Memory checks: initial={initialMemoryUsedMB} MB setuped={setupedMemoryUsedMB1} MB diff={setupedMemoryUsedMB1 - initialMemoryUsedMB} MB");

            return false;
        }

#if DEBUG
        if (args.Length > 0 && args[0] == "gen-pokeapi")
        {
            GenApiData.GenerateFiles();
            return false;
        }
#endif

        await WaitForSetup();

        var setupedMemoryUsedMB = System.Diagnostics.Process.GetCurrentProcess().WorkingSet64 / 1_000_000;

        Console.WriteLine($"Memory checks: initial={initialMemoryUsedMB} MB setuped={setupedMemoryUsedMB} MB diff={setupedMemoryUsedMB - initialMemoryUsedMB} MB");

        return true;
    }

    public static WebApplication PrepareWebApp(int port)
    {
        var builder = WebApplication.CreateBuilder([]);

        ConfigureServices(builder.Services);

        var certificate = SettingsService.AppSettings.SettingsMutable.HTTPS_CERT_PEM_PATH != default && SettingsService.AppSettings.SettingsMutable.HTTPS_KEY_PEM_PATH != default
            ? X509Certificate2.CreateFromPem(
                File.ReadAllText(SettingsService.AppSettings.SettingsMutable.HTTPS_CERT_PEM_PATH),
                File.ReadAllText(SettingsService.AppSettings.SettingsMutable.HTTPS_KEY_PEM_PATH)
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
                else if (SettingsService.AppSettings.SettingsMutable.HTTPS_NOCERT == true)
                {
                    listenOptions.UseHttps();
                }

            });
        });

        var app = builder.Build();

        ConfigureAppBuilder(app, certificate != default || SettingsService.AppSettings.SettingsMutable.HTTPS_NOCERT == true);

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

        app.UseMiddleware<ExceptionHandlingMiddleware>();
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
