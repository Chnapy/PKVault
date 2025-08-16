using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using PKHeX.Core;

namespace Backend;

public static class Program
{
    public static void Main(string[] args)
    {
        // TestService.Test();

        // BackupService.CreateBackup();
        // if (1 == 1)
        // {
        //     return;
        // }

        // GameInfo.CurrentLanguage = "fr";

        LocalSaveService.PrepareTimer();

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
