using Android.App;
using Android.Content;
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

    protected override void OnActivityResult(int requestCode, Result resultCode, Intent? data)
    {
        base.OnActivityResult(requestCode, resultCode, data);

        if (requestCode == FileChooserClient.FileChooserRequestCode)
        {
            var results = Android.Webkit.WebChromeClient.FileChooserParams.ParseResult((int)resultCode, data);
            FileChooserClient.PendingFilePathCallback?.OnReceiveValue(results);
            FileChooserClient.PendingFilePathCallback = null;
        }
        else if (requestCode == AndroidDirectoryPicker.DirectoryPickerRequestCode
            || requestCode == AndroidDirectoryPicker.FilePickerRequestCode
        )
        {
            var uri = resultCode == Result.Ok ? data?.Data : null;
            AndroidDirectoryPicker.PendingPickTask?.TrySetResult(uri);
            AndroidDirectoryPicker.PendingPickTask = null;
        }
    }
}
