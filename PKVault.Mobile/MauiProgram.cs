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

		Directory.SetCurrentDirectory(FileSystem.Current.AppDataDirectory);

		Program.Initialize(loggerConfig);

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
					Program.Dispose();
				});
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
