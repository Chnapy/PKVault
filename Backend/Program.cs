using Microsoft.AspNetCore.Mvc.ApplicationModels;

namespace Backend;

public static class Program
{
    public static void Main(string[] args)
    {
        SaveInfosService.LoadLastSaves();

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

        var app = builder.Build();

        app.UseCors();
        app.UseOpenApi();
        app.UseSwaggerUi();

        app.MapControllers();

        app.Run("http://0.0.0.0:5000");

        Console.WriteLine("App is running.");
    }
}
