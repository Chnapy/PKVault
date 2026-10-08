using System.Runtime.InteropServices;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Logging;
using Microsoft.Maui.Handlers;
using Microsoft.Maui.LifecycleEvents;
using PKVault.Core;
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

#if ANDROID
		var currentDirectory = Preferences.Default.Get<string?>("pkvault-directory", null);
		Console.WriteLine($"Preferences[pkvault-directory] == {currentDirectory}");

		if (currentDirectory != null)
		{
			// check value and if throw error, rollback
			try
			{
				Directory.SetCurrentDirectory(currentDirectory);
				SettingsService.AppDirectory = currentDirectory;
			}
			catch (Exception ex)
			{
				Console.Error.WriteLine($"Android exception on Directory.SetCurrentDirectory", ex);

				Preferences.Default.Remove("pkvault-directory");
				Directory.SetCurrentDirectory(FileSystem.Current.AppDataDirectory);
			}
		}
		else
			Directory.SetCurrentDirectory(FileSystem.Current.AppDataDirectory);
#else
		Directory.SetCurrentDirectory(FileSystem.Current.AppDataDirectory);
#endif

		Program.Initialize(loggerConfig);

		var builder = MauiApp.CreateBuilder();
		builder
			.UseMauiApp((_) => new App())
			.ConfigureLifecycleEvents((builder) =>
			{
#if ANDROID
				builder.AddAndroid(android => android
					// in background
					// .OnStop((activity) =>
					// {
					// })

					// killed
					.OnDestroy((activity) =>
					{
						Program.Dispose();
					})
				);
#endif
			});

		Program.ConfigureServices(builder.Services);

#if ANDROID
		HybridWebViewHandler.Mapper.AppendToMapping("CustomFileChooser", (handler, view) =>
		{
			if (handler.PlatformView is Android.Webkit.WebView webView)
				webView.SetWebChromeClient(new FileChooserClient());
		});
		builder.Services.AddSingleton<IDirectoryPicker, AndroidDirectoryPicker>();
		builder.Services.AddSingleton(sp => new SafTreeMapper(
			Android.App.Application.Context
		));
		builder.Services.RemoveAll<IFileIOService>();
		builder.Services.AddSingleton<IFileIOService>(sp =>
		{
			var inner = new FileIOService(sp.GetRequiredService<System.IO.Abstractions.IFileSystem>());
			var mapper = sp.GetRequiredService<SafTreeMapper>();
			return new AndroidFileIOService(inner, mapper);
		});
#endif

#if DEBUG
		builder.Services.AddHybridWebViewDeveloperTools();
		builder.Logging.AddDebug();
#endif

		return builder.Build();
	}
}
