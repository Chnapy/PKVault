using Android.App;
using Android.Content.PM;
using Android.OS;
using AndroidX.Activity;
using AndroidX.Core.View;

namespace PKVault.Mobile;

[Activity(Theme = "@style/Maui.SplashTheme", MainLauncher = true, LaunchMode = LaunchMode.SingleTop, ConfigurationChanges = ConfigChanges.ScreenSize | ConfigChanges.Orientation | ConfigChanges.UiMode | ConfigChanges.ScreenLayout | ConfigChanges.SmallestScreenSize | ConfigChanges.Density)]
public class MainActivity : MauiAppCompatActivity
{
    protected override void OnCreate(Bundle? savedInstanceState)
    {
        base.OnCreate(savedInstanceState);

        WindowCompat.SetDecorFitsSystemWindows(Window, false);

#pragma warning disable CA1422

        if (OperatingSystem.IsAndroidVersionAtLeast(29))
        {
            Window!.NavigationBarContrastEnforced = false;
            Window!.StatusBarContrastEnforced = false;
        }

        Window!.SetNavigationBarColor(Android.Graphics.Color.Transparent);
        Window!.SetStatusBarColor(Android.Graphics.Color.Transparent);

#pragma warning restore CA1422

        var controller = WindowCompat.GetInsetsController(Window, Window!.DecorView)!;
        controller.AppearanceLightStatusBars = false;
        controller.AppearanceLightNavigationBars = false;

        OnBackPressedDispatcher.AddCallback(this, new BackPressedCallback());
    }
}

public class BackPressedCallback : OnBackPressedCallback
{
    public BackPressedCallback() : base(true)
    {
    }

    public override void HandleOnBackPressed()
    {
        if (MainPage.HybridWebView == null)
            return;

        if (MainPage.HybridWebView.Handler?.PlatformView is Android.Webkit.WebView nativeWebView && nativeWebView.CanGoBack())
        {
            nativeWebView.GoBack();
        }
    }
}
