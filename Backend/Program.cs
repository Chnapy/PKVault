using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using PKHeX.Core;

namespace Backend;

public static class Program
{
    public static async Task Main(string[] args)
    {
        // TestService.Test();

        // BackupService.CreateBackup();

        // LocalSaveService.ReadLocalSaves(null);

        // var pkm = new DataFileLoader().loaders.getSaveLoaders(3809447156).Pkms.GetDto("G30366F877008013 18 15 30 25 2500").Pkm;

        var initialMemoryUsedMB = System.Diagnostics.Process.GetCurrentProcess().WorkingSet64 / 1_000_000;

        LocalSaveService.PrepareTimer();

        await StorageService.Initialize();

        StorageService.CleanMainStorageFiles();

        Console.WriteLine($"Save loaded: {string.Join(',', LocalSaveService.SaveById.Keys)}");

        PokeApi.ClearCache();

        GC.Collect();
        GC.WaitForPendingFinalizers();

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

        var certPem = File.ReadAllText("../.devcontainer/.cert/code.lan+3.pem");
        var keyPem = File.ReadAllText("../.devcontainer/.cert/code.lan+3-key.pem");
        var certificate = X509Certificate2.CreateFromPem(certPem, keyPem);

        builder.WebHost.ConfigureKestrel(serverOptions =>
        {
            serverOptions.ListenAnyIP(5000, listenOptions =>
            {
                listenOptions.UseHttps(certificate);
            });
        });

        var app = builder.Build();

        app.UseHttpsRedirection();

        app.UseCors();
        app.UseOpenApi();
        app.UseSwaggerUi();

        app.MapControllers();

        app.Run();

        Console.WriteLine("App is running.");
    }
}
