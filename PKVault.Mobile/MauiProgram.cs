using System.Runtime.InteropServices;
using Microsoft.Extensions.Logging;
using Microsoft.Maui.LifecycleEvents;
using Serilog;

namespace PKVault.Mobile;

public static class MauiProgram
{
#if WINDOWS && DEBUG
	[DllImport("kernel32.dll")]
	static extern bool AttachConsole(uint dwProcessId);
	const uint ATTACH_PARENT_PROCESS = 0x0ffffffff;
#endif

	public static MauiApp CreateMauiApp()
	{
#if WINDOWS && DEBUG
		AttachConsole(ATTACH_PARENT_PROCESS);
#endif

		LoggerConfiguration? loggerConfig = null;
#if ANDROID && DEBUG
		Android.Webkit.WebView.SetWebContentsDebuggingEnabled(true);
		loggerConfig = new LoggerConfiguration()
			.WriteTo.AndroidLog();
#endif

#if WINDOWS
		Environment.SetEnvironmentVariable("WEBVIEW2_USER_DATA_FOLDER",
			Path.Combine(FileSystem.AppDataDirectory, "WebView2")
		);
#endif

		Directory.SetCurrentDirectory(FileSystem.Current.AppDataDirectory);

		Core.Program.Initialize(loggerConfig);

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
