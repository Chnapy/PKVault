namespace PKVault.WinForm;

public partial class MainForm : Form
{
    private readonly LocalWebServer server;

    public MainForm()
    {
        InitializeComponent();
        Resize += new EventHandler(Form_Resize);
        Load += new EventHandler(WebView_Load);

        server = new LocalWebServer();
        server.Start();
    }

    protected override async void OnFormClosing(FormClosingEventArgs e)
    {
        await server.Stop();
        base.OnFormClosing(e);
    }
}
