using System.Text.Json;
using PKVault.Core;
using Serilog;

namespace PKVault.Mobile;

public partial class MainPage : ContentPage
{
	private static Task<IServiceProvider>? SetupTask = null;

	public MainPage()
	{
		InitializeComponent();

		SetupTask ??= SetupCore();
	}

	private static async Task<IServiceProvider> SetupCore()
	{
		var sp = Application.Current!.Handler.MauiContext!.Services;

		await Program.SetupData(sp);

		return sp;
	}

	private void OnHybridWebViewInitializing(object? sender, EventArgs e) { Console.WriteLine($"OnHybridWebViewInitializing {e.GetType()}"); }

	private void OnHybridWebViewRawMessageReceived(object? sender, EventArgs e) { Console.WriteLine($"OnHybridWebViewRawMessageReceived {e.GetType()}"); }

	private void OnHybridWebViewWebResourceRequested(object? sender, WebViewWebResourceRequestedEventArgs e)
	{
		var path = e.Uri.LocalPath;

		Console.WriteLine($"!! ResourceRequested !! {path.StartsWith("/api/")} {e.Method} {e.Uri.LocalPath} {e.Uri.Query}");

		if (!path.StartsWith("/api/"))
			return;

		e.Handled = true;
		e.SetResponse(
			200,
			"OK",
			"application/json",
			OnApiRequest(e)
		);
	}

	private async Task<Stream?> OnApiRequest(WebViewWebResourceRequestedEventArgs e)
	{
		var sp = await SetupTask!;
		using var scope = sp.CreateScope();
		var coreRouter = scope.ServiceProvider.GetRequiredService<CoreRouter>();

		var path = e.Uri.LocalPath;
		string queryString = e.Uri.Query;
		var reqBody = new MemoryStream();

		var result = await coreRouter.Dispatch(scope.ServiceProvider, e.Method, path, queryString, reqBody);

		Dictionary<string, string> headers = [];
		var body = new MemoryStream();

		if (result.Header is not null)
			foreach (var (key, values) in result.Header)
				headers[key] = values!;

		if (result is CoreFileResponse fileResponse)
		{
			var contentDispositionHeader = new System.Net.Mime.ContentDisposition()
			{
				FileName = fileResponse.File.FileName,
				DispositionType = "attachment"
			};
			headers["Content-Disposition"] = contentDispositionHeader.ToString();

			if (fileResponse.LastModified is not null)
				headers["LastModified"] = fileResponse.LastModified.ToString()!;

			await using var stream = fileResponse.File.Stream;
			await stream.CopyToAsync(body);
		}

		else if (result is CoreJSONResponse jsonResponse)
		{
			if (jsonResponse.Data is not null)
			{
				var typeInfo = RouteJsonContext.DefaultWithOptions.GetTypeInfo(jsonResponse.Data.GetType())
					?? throw new InvalidOperationException($"Missing TypeInfo for type {jsonResponse.Data.GetType()}");

				await JsonSerializer.SerializeAsync(
					body,
					jsonResponse.Data,
					typeInfo
				);
			}
		}

		else
		{
			throw new Exception($"Unhandled request {e.Method} {e.Uri}");
		}

		body.Position = 0;
		return body;
	}
}
