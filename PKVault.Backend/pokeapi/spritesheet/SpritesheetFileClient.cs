public partial class SpritesheetFileClient
{
    public static readonly string[] SheetsParts = [.. StaticDataService.GetGeneratedPathParts(), "sheets"];

    private static readonly AssemblyClient assemblyClient = new();

    public static async Task<Stream> GetAsyncString(string filename)
    {
        List<string> fileParts = [
            ..SheetsParts, filename
        ];

        return await assemblyClient.GetAsync(fileParts);
    }

    public static string GetSpeciesImgFilename(int sheetIndex) => $"spritesheet_species_{sheetIndex}.webp";
    public static string GetItemsImgFilename(int sheetIndex) => $"spritesheet_items_{sheetIndex}.webp";
}
