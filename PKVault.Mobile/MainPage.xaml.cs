namespace PKVault.Mobile;

public partial class MainPage : ContentPage
{
	public MainPage()
	{
		InitializeComponent();

		// hybridWebView.
	}

	private void OnHybridWebViewInitializing(object? sender, EventArgs e) { Console.WriteLine("OnHybridWebViewInitializing"); }

	private void OnHybridWebViewRawMessageReceived(object? sender, EventArgs e) { Console.WriteLine("OnHybridWebViewRawMessageReceived"); }

	private void OnHybridWebViewWebResourceRequested(object? sender, EventArgs e) { Console.WriteLine("OnHybridWebViewWebResourceRequested"); }
}
