using PKVault.Core;

namespace PKVault.Mobile;

public partial class MainPage : ContentPage
{
	private static Task SetupTask = Task.CompletedTask;

	private IServiceProvider ServiceProvider => IPlatformApplication.Current!.Services;

	public static HybridWebView? HybridWebView = null;

	public MainPage()
	{
		InitializeComponent();

		HybridWebView = hybridWebView;

		SetupTask = SetupCore();

		hybridWebView.SetInvokeJavaScriptTarget(new DesktopInvoker(ServiceProvider, SetupTask));
	}

	protected override void OnChildRemoved(Element child, int oldLogicalIndex)
	{
		if (child.GetType() == typeof(HybridWebView))
			HybridWebView = null;

		base.OnChildRemoved(child, oldLogicalIndex);
	}

	private async Task SetupCore()
	{
		await Program.SetupData(ServiceProvider);
	}

	private async void OnHybridWebViewInitialized(object? sender, EventArgs e)
	{
		Console.WriteLine($"OnHybridWebViewInitialized {e.GetType()}");
		// await hybridWebView.EvaluateJavaScriptAsync(
		// 	"console.log('Add HybridWebView API');"
		// 	+ "var el = document.createElement('script');"
		// 	+ "el.src = '_framework/hybridwebview.js';"
		// 	+ "document.head.appendChild(el);"
		// );
	}

	private void OnHybridWebViewRawMessageReceived(object? sender, EventArgs e) { Console.WriteLine($"OnHybridWebViewRawMessageReceived {e.GetType()}"); }
}
