using PKHeX.Core;

namespace PKVault.Core;

public class StaticDataLoader
{
    public static readonly EntityContext LAST_ENTITY_CONTEXT = StaticDataService.LAST_ENTITY_CONTEXT;

    public static List<string> GetGeneratedPathParts()
    {
        string[] parts = ["static-data", "generated"];
        return parts.Select(AssemblyClient.FormatResourcePart).ToList();
    }

    public static string[] GetDataPathParts(string filename) => [
        ..GetGeneratedPathParts(), "api-data", $"{AssemblyClient.FormatResourcePart(filename)}.json.gz"
    ];
}