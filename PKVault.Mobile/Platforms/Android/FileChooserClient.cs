using Android.Content;
using Android.Webkit;

namespace PKVault.Mobile;

public class FileChooserClient : WebChromeClient
{
    public static IValueCallback? PendingFilePathCallback;
    public const int FileChooserRequestCode = 10101;

    public override bool OnShowFileChooser(
        Android.Webkit.WebView? webView,
        IValueCallback? filePathCallback,
        FileChooserParams? fileChooserParams)
    {
        PendingFilePathCallback?.OnReceiveValue(null);
        PendingFilePathCallback = filePathCallback;

        var intent = fileChooserParams?.CreateIntent();

        try
        {
            Platform.CurrentActivity?.StartActivityForResult(intent, FileChooserRequestCode);
            return true;
        }
        catch (ActivityNotFoundException)
        {
            PendingFilePathCallback = null;
            return false;
        }
    }
}
