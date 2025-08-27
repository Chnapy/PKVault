using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Microsoft.AspNetCore.Mvc.Testing;

namespace PKVault.Backend;

public class Program
{
    public static async Task Main(string[] args)
    {
        await SetupData();
        await SetupWebApp(args);
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

    private static WebApplication PrepareWebApp(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        builder.Services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy =>
            {
                policy.AllowAnyOrigin()
                      .AllowAnyMethod()
                      .AllowAnyHeader();
            });
        });

        builder.Services.AddControllers(options =>
        {
            options.Conventions.Add(new RouteTokenTransformerConvention(new SlugifyParameterTransformer()));
        });

        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerDocument(document =>
        {
            document.PostProcess = doc =>
            {
                doc.Info.Title = "PKVault API";
            };
        });

        var certificate = SettingsService.AppSettings.HTTPS_CERT_PEM_PATH != default && SettingsService.AppSettings.HTTPS_KEY_PEM_PATH != default
            ? X509Certificate2.CreateFromPem(
                File.ReadAllText(SettingsService.AppSettings.HTTPS_CERT_PEM_PATH),
                File.ReadAllText(SettingsService.AppSettings.HTTPS_KEY_PEM_PATH)
                )
            : null;

        builder.WebHost.ConfigureKestrel(serverOptions =>
        {
            serverOptions.ListenAnyIP(5000, listenOptions =>
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

        if (certificate != default || SettingsService.AppSettings.HTTPS_NOCERT == true)
        {
            app.UseHttpsRedirection();
        }

        app.UseCors();
        app.UseOpenApi();
        app.UseSwaggerUi();

        app.MapControllers();

        return app;
    }

    private static async Task SetupWebApp(string[] args)
    {
        var app = PrepareWebApp(args);
        await app.RunAsync();
    }

    public static HttpClient SetupFakeClient()
    {
        return new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    services.AddCors(options =>
                    {
                        options.AddDefaultPolicy(policy =>
                        {
                            policy.AllowAnyOrigin()
                                .AllowAnyMethod()
                                .AllowAnyHeader();
                        });
                    });
                });

                var certificate = SettingsService.AppSettings.HTTPS_CERT_PEM_PATH != default && SettingsService.AppSettings.HTTPS_KEY_PEM_PATH != default
                    ? X509Certificate2.CreateFromPem(
                        File.ReadAllText(SettingsService.AppSettings.HTTPS_CERT_PEM_PATH),
                        File.ReadAllText(SettingsService.AppSettings.HTTPS_KEY_PEM_PATH)
                        )
                    : null;

                builder.ConfigureKestrel(serverOptions =>
                {
                    serverOptions.ListenAnyIP(5000, listenOptions =>
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

                builder.Configure(app =>
                {
                    app.UseRouting();
                    app.UseCors();
                    app.UseEndpoints(endpoints =>
                    {
                        endpoints.MapControllers();
                    });
                });
            }).CreateClient();
    }
}
