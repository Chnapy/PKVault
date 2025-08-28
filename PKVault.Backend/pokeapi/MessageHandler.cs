

using System.Diagnostics;
using System.Reflection;

public class MessageHandler : HttpMessageHandler
{
    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        // return new HttpClientHandler()
        // Console.WriteLine($"{request.RequestUri}");

        var uriParts = request.RequestUri!.ToString()
            .Split('/').ToList()
            .FindAll(part => part.Length > 0);

        // uriParts.Add("index.json");

        List<string> fileParts = [
            "pokeapi", "api-data","data",
            ..uriParts[2..],
            "index.json"
        ];

        // var path = string.Join('/', fileParts);

        List<string> assemblyParts = [
            "PKVault.Backend",
            ..fileParts
        ];

        var assemblyName = string.Join('.', assemblyParts.Select(part =>
        {
            part = part.Replace('-', '_');

            var isInt = int.TryParse(part, out _);
            if (isInt)
            {
                part = $"_{part}";
            }

            return part;
        }));

        var assembly = Assembly.GetExecutingAssembly();
        // var foo = assembly.GetManifestResourceNames();
        // Console.WriteLine(foo[2]);
        // PKVault.Backend.pokeapi.api_data.data.api.v2.pokemon._986.encounters.index.json

        // Stopwatch sw = new();

        // sw.Start();

        var stream = assembly.GetManifestResourceStream(assemblyName) ?? throw new Exception($"RESOURCE NOT FOUND: {assemblyName}");
        using StreamReader reader = new(stream);
        string jsonContent = reader.ReadToEnd();

        // var content = JsonSerializer.Deserialize<object>(
        //     jsonContent
        // );

        // var content = JsonSerializer.Deserialize<object>(
        //     File.ReadAllText("pokeapi/api-data/data/api/v2/pokemon-species/1/index.json")
        // );

        // sw.Stop();

        // Console.WriteLine($" {sw.Elapsed}");

        // File.ReadAllText();
        // System.Net.Http.StringContent
        return new HttpResponseMessage(System.Net.HttpStatusCode.OK)
        {
            Content = new StringContent(jsonContent)
        };
    }
}
