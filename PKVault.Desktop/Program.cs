using Avalonia;
using Serilog;
using System;
using System.Runtime.InteropServices;

namespace PKVault.Desktop;

sealed class Program
{
    public static readonly bool WindowsOS = RuntimeInformation.IsOSPlatform(OSPlatform.Windows);
    public static readonly bool LinuxOS = RuntimeInformation.IsOSPlatform(OSPlatform.Linux);

    public static string[] Args { get; private set; } = [];

    [STAThread]
    public static void Main(string[] args)
    {
        Args = args;

        LogUtil.Initialize();

        Log.Logger.Debug($"ARGS: {string.Join(' ', args)}");

        // "Microsoft Windows 10.0.123"
        // "GNOME 50 (Flatpak runtime)"
        // "Linux Mint 22.1"
        Log.Logger.Debug($"OS : {RuntimeInformation.OSDescription}");
        Log.Logger.Debug($"OS LANGUAGE : {System.Globalization.CultureInfo.CurrentUICulture.Name}");

        // "win-x64"
        // "linux-x64"
        // "linux-arm64"
        Log.Logger.Debug($"RID runtime : {RuntimeInformation.RuntimeIdentifier}");

        Log.Logger.Debug($"LinuxOS : {LinuxOS}");
        Log.Logger.Debug($"WindowsOS : {WindowsOS}");

        Log.Logger.Debug($"Current directory : {Directory.GetCurrentDirectory()}");

        // SettingsService.ProgramArgs = args;

        // Required to ensure photino directory wwwroot being created in app directory
        // since app directory can be different than executable one (flatpak ran by steam)
        Directory.SetCurrentDirectory(SettingsService.GetAppDirectory());

        Log.Logger.Debug($"Current directory (fixed) : {Directory.GetCurrentDirectory()}");

        Backend.Program.Copyright();

        try
        {
            SettingsService.FlatpakMigrateIfAny();

            BuildAvaloniaApp()
                .StartWithClassicDesktopLifetime(args);
        }
        catch (Exception ex)
        {
            Log.Fatal(ex, "An unhandled exception occurred during startup");
        }
        finally
        {
            LogUtil.Dispose();
        }
    }

    // Avalonia configuration, don't remove; also used by visual designer.
    public static AppBuilder BuildAvaloniaApp()
        => AppBuilder.Configure(() => new App())
            .UsePlatformDetect()
            // .With(new Win32PlatformOptions
            // {
            //     RenderingMode = [Win32RenderingMode.Software]
            // })
            // .With(new X11PlatformOptions
            // {
            //     RenderingMode = [X11RenderingMode.Software]
            // })
#if DEBUG
            .WithDeveloperTools()
#endif
            .LogToTrace();
}
