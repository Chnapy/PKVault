using Microsoft.Extensions.Logging;
using Microsoft.Maui.LifecycleEvents;
using Serilog;

namespace PKVault.Mobile;

public static class MauiProgram
{
	public static MauiApp CreateMauiApp()
	{
#if DEBUG
		Android.Webkit.WebView.SetWebContentsDebuggingEnabled(true);
#endif

		Directory.SetCurrentDirectory(FileSystem.Current.AppDataDirectory);

		Core.Program.Initialize(new LoggerConfiguration()
			.WriteTo.AndroidLog()
		);

		var builder = MauiApp.CreateBuilder();
		builder
			.UseMauiApp((_) => new App())
			.ConfigureLifecycleEvents((builder) =>
			{
				// builder.AddEvent("Created", () =>
				// {
				// });
				builder.AddEvent("Destroying", () =>
				{
					Core.Program.Dispose();
				});
			});
		// .ConfigureFonts(fonts =>
		// {
		// 	fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
		// 	fonts.AddFont("OpenSans-Semibold.ttf", "OpenSansSemibold");
		// });

		Core.Program.ConfigureServices(builder.Services);

#if DEBUG
		builder.Services.AddHybridWebViewDeveloperTools();
		builder.Logging.AddDebug();
#endif

		return builder.Build();
	}
}
