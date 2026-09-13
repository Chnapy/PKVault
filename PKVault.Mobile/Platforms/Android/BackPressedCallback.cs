using AndroidX.Activity;

namespace PKVault.Mobile;

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
