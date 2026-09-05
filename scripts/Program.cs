using Microsoft.Extensions.DependencyInjection;
using PKVault.Core;
using Serilog;

FileIOService.IsScriptsContext = true;

PKVault.Core.Program.Initialize();

var services = new ServiceCollection();
PKVault.Core.Program.ConfigureMinimalServices(services);
services.AddSingleton<PokeApiService>();
services.AddSingleton<GenStaticDataService>();

var sp = services.BuildServiceProvider();

if (args.Contains("update-pkhex"))
{
    Log.Information("-- Update PKHeX --");

    await UpdatePKHeX.Update();
}

else if (args.Contains("gen-migration"))
{
    Log.Information("-- Generate migration --");

    var filename = args[args.IndexOf("gen-migration") + 1];

    await GenerateMigration.GenerateTrimmedCompatibleMigration(filename);
}

else if (args.Contains("gen-static-data"))
{
    Log.Information("-- Static-data generation --");

    var genStaticDataService = sp.GetRequiredService<GenStaticDataService>();
    await genStaticDataService.GenerateFiles();
}

else
{
    throw new ArgumentException($"No command in args: {string.Join(' ', args)}");
}

PKVault.Core.Program.Dispose();
