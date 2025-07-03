using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Text.Json;
using PKHeX.Core;

namespace Backend;

public static class Program
{
    [DynamicDependency(DynamicallyAccessedMemberTypes.All, typeof(PkCommand))]
    [DynamicDependency(DynamicallyAccessedMemberTypes.All, "Spectre.Console.Cli.ExplainCommand", "Spectre.Console.Cli")]
    [DynamicDependency(DynamicallyAccessedMemberTypes.All, "Spectre.Console.Cli.VersionCommand", "Spectre.Console.Cli")]
    [DynamicDependency(DynamicallyAccessedMemberTypes.All, "Spectre.Console.Cli.XmlDocCommand", "Spectre.Console.Cli")]
    public static void Main(string[] args)
    {
        var app = new CommandApp<PkCommand>();
        app.Run(args);
    }

}

public sealed class PkCommand : Command
{
    public override int Execute(CommandContext context)
    {
        return Run();
    }

    private int Run()
    {
        var path = "./data/savedata.bin";

        var sav = SaveUtil.GetVariantSAV(path) ?? throw new System.Exception("Save parse error");

        AnsiConsole.MarkupLine(string.Empty);
        AnsiConsole.MarkupLine($"Successfully loaded the save state at: [blue]{path}[/]");
        AnsiConsole.MarkupLine(string.Empty);

        var sf = (SAV7b)sav;

        var pokedex = new List<DexItem>();

        for (ushort i = 1; i < sf.MaxSpeciesID + 1; i++)
        {
            var item = DexItem.fromSaveFile7b(sf, i);
            if (item.IsAnySeen)
            {
                pokedex.Add(item);
            }
        }

        Console.WriteLine(JsonSerializer.Serialize(pokedex, DexItemContext.Default.ListDexItem));

        return 0;
    }
}