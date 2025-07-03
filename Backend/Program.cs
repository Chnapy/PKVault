using PKHeX.Core;

namespace Backend;

public static class Program
{
    public static void Main(string[] args)
    {
        var app = WebApplication.Create();

        app.MapGet("/", () => "Hello, world!");

        app.MapGet("/get-all-save-infos", () =>
        {
            var list = SaveInfosService.GetAllSaveInfos();

            return Results.Json(list);
        });

        app.MapPost("/upload-new-save", async (HttpRequest request) =>
        {
            var form = await request.ReadFormAsync();
            var file = form.Files["saveFile"];

            if (file == null || file.Length == 0)
                return Results.BadRequest("No file received");

            byte[] fileBytes;
            using (var ms = new MemoryStream())
            {
                await file.CopyToAsync(ms);
                fileBytes = ms.ToArray();
            }

            var saveInfos = SaveInfosService.UploadNewSave(fileBytes, file.FileName);

            return Results.Json(saveInfos);
        });

        app.MapGet("/get-full-dex", () =>
        {
            var dex = DexService.GetPersistedDex();

            return Results.Json(dex);
        });

        app.Run();
    }
}
